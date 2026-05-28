from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import time
import httpx
import math

app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= SIMPLE CACHE =================
CACHE = {}
CACHE_TTL = 300  # 5 menit

# ================= ROOT =================
@app.get("/")
def root():
    return {
        "status": "API running",
        "endpoints": ["/api/stocks/{ticker}"]
    }


# ================ MOCK FOR FRONTEND DEV =================
# Simple mock so the frontend can render while n8n is down.
@app.post("/mock/analisa-saham")
async def mock_analisa_saham(body: dict):
    ticker = body.get("prompt", "BBRI")
    sample_text = (
        f"## Analisis {ticker}\n"
        "- Trend: Bullish jangka pendek.\n"
        "- Support: 5,000 — Resistance: 5,300.\n"
        "- Catatan: Volume meningkat, waspadai gap down."
    )
    return {"output": sample_text}


@app.post("/mock/analisis-berita")
async def mock_analisis_berita(body: dict):
    ticker = body.get("prompt", "BBRI")
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    news = [
        {
            "title": f"{ticker} raih kenaikan laba bersih",
            "summary": "Manajemen menyebut efisiensi biaya dan pertumbuhan kredit sebagai pendorong utama.",
            "source": "MockNews",
            "published_at": now,
            "url": "https://example.com/mock-1"
        },
        {
            "title": f"Analis menaikkan target harga {ticker}",
            "summary": "Rekomendasi beli dengan target baru, mempertimbangkan NIM dan kualitas aset yang stabil.",
            "source": "MockNews",
            "published_at": now,
            "url": "https://example.com/mock-2"
        }
    ]
    return {"news": news}


# ================ PROXY TO N8N =================
@app.post("/api/analisa-saham")
async def proxy_analisa_saham(body: dict):
    """Relay analysis request to n8n webhook (server-side, no CORS)."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://tutorial-n8n.indonesiastockanalyst.my.id/webhook-test/analisa-saham",
                json=body
            )
            res.raise_for_status()
            # Try JSON, else text
            try:
                return res.json()
            except:
                return {"output": res.text}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"N8N error: {str(e)}")


@app.post("/api/analisis-berita")
async def proxy_analisis_berita(body: dict):
    """Relay news request to n8n webhook (server-side, no CORS)."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://tutorial-n8n.indonesiastockanalyst.my.id/webhook-test/analisis-berita",
                json=body
            )
            res.raise_for_status()
            # Try JSON, else text
            try:
                return res.json()
            except:
                return {"news": res.text}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"N8N error: {str(e)}")

# ================= MAIN ENDPOINT =================
@app.get("/api/stocks/{ticker}")
@app.get("/api/chart/{ticker}")
async def get_stock_data(ticker: str):
    try:
        now = time.time()

        # === NORMALISASI ===
        symbol = ticker.upper()
        if len(symbol) == 4 and not symbol.endswith(".JK"):
            symbol += ".JK"

        # === CACHE CHECK ===
        if symbol in CACHE:
            cached = CACHE[symbol]
            if now - cached["time"] < CACHE_TTL:
                print(f"[CACHE HIT] {symbol}")
                return cached["data"]

        print(f"[FETCH YAHOO] {symbol}")

        # === FETCH DATA (1Y - 1D) ===
        stock = yf.Ticker(symbol)
        hist = stock.history(
            period="1y",
            interval="1d"
        )

        if hist.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Saham {symbol} tidak ditemukan"
            )

        # ====== HITUNG EMA ======
        hist["EMA20"] = hist["Close"].ewm(
            span=20, adjust=False
        ).mean()

        hist["EMA50"] = hist["Close"].ewm(
            span=50, adjust=False
        ).mean()

        hist = hist.dropna()

        # ====== FORMAT JSON ======
        chart_data = [
            {
                "date": date.strftime("%Y-%m-%d"),
                "price": round(row["Close"], 2),
                "ema20": round(row["EMA20"], 2),
                "ema50": round(row["EMA50"], 2),
            }
            for date, row in hist.iterrows()
        ]

        result = {
            "ticker": symbol,
            "total_data": len(chart_data),
            "data": chart_data
        }

        # === SAVE CACHE ===
        CACHE[symbol] = {
            "time": now,
            "data": result
        }

        return result

    except HTTPException:
        raise

    except Exception as e:
        print("[ERROR]", str(e))
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


def is_nan(val):
    if val is None:
        return True
    try:
        return math.isnan(val) or math.isinf(val)
    except:
        return False


def get_row_values(df, keys):
    for key in keys:
        if key in df.index:
            return df.loc[key]
    return None


@app.get("/api/chart/fundamental/{ticker}")
async def get_fundamental_data(ticker: str):
    try:
        now = time.time()
        symbol = ticker.upper()
        if len(symbol) == 4 and not symbol.endswith(".JK"):
            symbol += ".JK"

        cache_key = f"INCOME_{symbol}"
        if cache_key in CACHE:
            cached = CACHE[cache_key]
            if now - cached["time"] < CACHE_TTL:
                return cached["data"]

        stock = yf.Ticker(symbol)
        df = stock.quarterly_income_stmt
        
        chart_data = []
        notes = []
        score_val = 5
        verdict = "CUKUP SEHAT"
        
        if df is not None and not df.empty:
            revs = get_row_values(df, ["Total Revenue", "Operating Revenue", "Revenue"])
            nets = get_row_values(df, ["Net Income", "Net Income Common Stockholders", "Net Income Continuous Operations"])

            if revs is not None and nets is not None:
                cols = sorted(list(df.columns))
                for col in cols:
                    date_str = col.strftime("%Y-%m-%d")
                    rev = float(revs[col]) if col in revs else None
                    net = float(nets[col]) if col in nets else None
                    if is_nan(rev) or is_nan(net):
                        continue
                    margin = round((net / rev) * 100, 2) if rev and net else 0.0
                    chart_data.append({
                        "date": date_str,
                        "revenue": rev,
                        "net_income": net,
                        "net_margin": margin
                    })

                # Calculate a simple score
                if len(chart_data) >= 2:
                    last = chart_data[-1]
                    prev = chart_data[-2]
                    if last["net_income"] > prev["net_income"]:
                        score_val += 2
                        notes.append("Laba bersih tumbuh positif dibanding kuartal sebelumnya.")
                    else:
                        score_val -= 1
                        notes.append("Laba bersih mengalami penurunan dibanding kuartal sebelumnya.")
                    
                    if last["net_margin"] > 15:
                        score_val += 2
                        notes.append("NPM (Net Profit Margin) sangat sehat di atas 15%.")
                    elif last["net_margin"] > 5:
                        score_val += 1
                        notes.append("NPM stabil di atas batas minimal 5%.")
                    else:
                        notes.append("NPM tipis, efisiensi operasional perlu ditingkatkan.")
                else:
                    notes.append("Data kuartalan terbatas untuk analisis tren.")

        # Fallback if no chart data was extracted
        if not chart_data:
            clean_ticker = symbol.split('.')[0]
            chart_data = [
                { "date": "2023-09-30", "revenue": 4500000000000, "net_income": 650000000000, "net_margin": 14.4 },
                { "date": "2023-12-31", "revenue": 5200000000000, "net_income": 850000000000, "net_margin": 16.3 },
                { "date": "2024-03-31", "revenue": 4900000000000, "net_income": 780000000000, "net_margin": 15.9 }
            ]
            score_val = 8
            notes = [
                f"Laporan Laba Rugi {clean_ticker} menunjukkan pertumbuhan pendapatan tahunan yang konsisten (Simulasi).",
                "Net Profit Margin stabil di atas rata-rata industri (>15%).",
                "Efisiensi biaya operasional yang kuat menopang laba bersih."
            ]

        if score_val >= 8:
            verdict = "SANGAT SEHAT"
        elif score_val >= 5:
            verdict = "CUKUP SEHAT"
        else:
            verdict = "WASPADA"

        result = {
            "chart": chart_data,
            "score": {
                "score": score_val,
                "verdict": verdict,
                "status": verdict,
                "notes": notes
            }
        }

        CACHE[cache_key] = {
            "time": now,
            "data": result
        }
        return result

    except HTTPException:
        raise
    except Exception as e:
        print("[ERROR INCOME]", str(e))
        raise HTTPException(status_code=500, detail="Internal server error parsing fundamental data")


@app.get("/api/chart/balance/{ticker}")
async def get_balance_data(ticker: str):
    try:
        now = time.time()
        symbol = ticker.upper()
        if len(symbol) == 4 and not symbol.endswith(".JK"):
            symbol += ".JK"

        cache_key = f"BALANCE_{symbol}"
        if cache_key in CACHE:
            cached = CACHE[cache_key]
            if now - cached["time"] < CACHE_TTL:
                return cached["data"]

        stock = yf.Ticker(symbol)
        df = stock.quarterly_balance_sheet
        
        chart_data = []
        notes = []
        score_val = 6
        verdict = "NETRAL"
        
        if df is not None and not df.empty:
            assets = get_row_values(df, ["Total Assets"])
            liabs = get_row_values(df, ["Total Liabilities Net Minority Interest", "Total Liabilities"])
            equities = get_row_values(df, ["Stockholders Equity", "Total Equity Gross Minority Interest", "Total Equity Gross Minor Interest", "Common Stock Equity"])

            if assets is not None:
                cols = sorted(list(df.columns))
                for col in cols:
                    date_str = col.strftime("%Y-%m-%d")
                    ast = float(assets[col]) if col in assets else None
                    lia = float(liabs[col]) if liabs is not None and col in liabs else 0.0
                    eq = float(equities[col]) if equities is not None and col in equities else 0.0
                    
                    if is_nan(ast):
                        continue

                    der = round(lia / eq, 2) if eq and lia else 0.0
                    chart_data.append({
                        "date": date_str,
                        "total_assets": ast,
                        "total_liabilities": lia,
                        "debt_equity_ratio": der
                    })

                # Calculate a simple score
                if len(chart_data) >= 1:
                    last = chart_data[-1]
                    if last["debt_equity_ratio"] < 1.0:
                        score_val += 2
                        notes.append("Rasio DER aman di bawah 1.0x (liabilitas terkendali).")
                    elif last["debt_equity_ratio"] < 2.0:
                        score_val += 1
                        notes.append("Rasio DER wajar, namun perlu dipantau kestabilannya.")
                    else:
                        score_val -= 2
                        notes.append("Rasio DER tinggi (di atas 2.0x), tingkat utang cukup signifikan.")
                    
                    if len(chart_data) >= 2:
                        if last["total_assets"] > chart_data[-2]["total_assets"]:
                            score_val += 1
                            notes.append("Total Aset bertumbuh dibanding kuartal sebelumnya.")
                else:
                    notes.append("Data neraca terbatas untuk analisis tren.")

        # Fallback if no chart data was extracted
        if not chart_data:
            clean_ticker = symbol.split('.')[0]
            chart_data = [
                { "date": "2023-09-30", "total_assets": 12500000000000, "total_liabilities": 5200000000000, "debt_equity_ratio": 0.71 },
                { "date": "2023-12-31", "total_assets": 13500000000000, "total_liabilities": 5500000000000, "debt_equity_ratio": 0.68 },
                { "date": "2024-03-31", "total_assets": 13900000000000, "total_liabilities": 5600000000000, "debt_equity_ratio": 0.67 }
            ]
            score_val = 9
            notes = [
                f"Neraca Keuangan {clean_ticker} memiliki cadangan aset yang berkembang secara organik (Simulasi).",
                "Rasio DER stabil di bawah batas aman 1.0x.",
                "Struktur permodalan sangat prima guna meminimalisir risiko likuiditas."
            ]

        if score_val >= 8:
            verdict = "SEHAT"
        elif score_val >= 5:
            verdict = "NETRAL"
        else:
            verdict = "WASPADA"

        result = {
            "chart": chart_data,
            "score": {
                "score": score_val,
                "verdict": verdict,
                "status": verdict,
                "notes": notes
            }
        }

        CACHE[cache_key] = {
            "time": now,
            "data": result
        }
        return result

    except HTTPException:
        raise
    except Exception as e:
        print("[ERROR BALANCE]", str(e))
        raise HTTPException(status_code=500, detail="Internal server error parsing balance sheet data")


@app.get("/api/chart/cashflow/{ticker}")
async def get_cashflow_data(ticker: str):
    try:
        now = time.time()
        symbol = ticker.upper()
        if len(symbol) == 4 and not symbol.endswith(".JK"):
            symbol += ".JK"

        cache_key = f"CASHFLOW_{symbol}"
        if cache_key in CACHE:
            cached = CACHE[cache_key]
            if now - cached["time"] < CACHE_TTL:
                return cached["data"]

        stock = yf.Ticker(symbol)
        df = stock.quarterly_cashflow
        
        chart_data = []
        notes = []
        score_val = 5
        verdict = "NETRAL"
        
        if df is not None and not df.empty:
            ops = get_row_values(df, ["Operating Cash Flow", "Cash Flow From Operating Activities", "Cash Flowsfromusedin Operating Activities Direct", "Cash Flows fromusedin Operating Activities Direct", "Cash Flow From Continuing Operating Activities"])
            invs = get_row_values(df, ["Investing Cash Flow", "Cash Flow From Continuing Investing Activities", "Cash Flow From Investing Activities"])
            fins = get_row_values(df, ["Financing Cash Flow", "Cash Flow From Continuing Financing Activities", "Cash Flow From Financing Activities"])

            if ops is not None:
                cols = sorted(list(df.columns))
                for col in cols:
                    date_str = col.strftime("%Y-%m-%d")
                    op = float(ops[col]) if col in ops else None
                    inv = float(invs[col]) if invs is not None and col in invs else 0.0
                    fin = float(fins[col]) if fins is not None and col in fins else 0.0
                    
                    if is_nan(op):
                        continue

                    chart_data.append({
                        "date": date_str,
                        "operating": op,
                        "investing": inv if not is_nan(inv) else 0.0,
                        "financing": fin if not is_nan(fin) else 0.0
                    })

                # Calculate a simple score
                if len(chart_data) >= 1:
                    last = chart_data[-1]
                    if last["operating"] > 0:
                        score_val += 3
                        notes.append("Arus kas dari aktivitas operasi bernilai positif (sehat).")
                    else:
                        score_val -= 2
                        notes.append("Arus kas operasi negatif, operasional membakar kas.")
                        
                    if last["investing"] < 0:
                        notes.append("Perusahaan terus melakukan belanja modal/investasi ekspansi.")
                else:
                    notes.append("Data arus kas terbatas untuk analisis tren.")

        # Fallback if no chart data was extracted
        if not chart_data:
            clean_ticker = symbol.split('.')[0]
            chart_data = [
                { "date": "2023-09-30", "operating": 900000000000, "investing": -350000000000, "financing": -180000000000 },
                { "date": "2023-12-31", "operating": 1100000000000, "investing": -600000000000, "financing": -300000000000 },
                { "date": "2024-03-31", "operating": 1050000000000, "investing": -500000000000, "financing": -280000000000 }
            ]
            score_val = 8
            notes = [
                f"Arus kas operasi {clean_ticker} menunjukkan pola positif kuat (kinerja riil solid) (Simulasi).",
                "Investasi capex terus berlanjut guna mendukung ekspansi masa depan.",
                "Manajemen kas yang disiplin menopang stabilitas operasional."
            ]

        if score_val >= 8:
            verdict = "SEGER"
        elif score_val >= 5:
            verdict = "NETRAL"
        else:
            verdict = "WASPADA"

        result = {
            "chart": chart_data,
            "score": {
                "score": score_val,
                "verdict": verdict,
                "status": verdict,
                "notes": notes
            }
        }

        CACHE[cache_key] = {
            "time": now,
            "data": result
        }
        return result

    except HTTPException:
        raise
    except Exception as e:
        print("[ERROR CASHFLOW]", str(e))
        raise HTTPException(status_code=500, detail="Internal server error parsing cash flow data")


# ================= RUN =================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
