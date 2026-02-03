from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import time
import httpx

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


# ================= RUN =================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
