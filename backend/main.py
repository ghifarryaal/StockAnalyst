from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import time

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
