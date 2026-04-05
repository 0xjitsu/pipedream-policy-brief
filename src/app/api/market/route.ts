import { NextResponse } from "next/server";

interface MarketDataField {
  value: number;
  delta: string;
  source: string;
  sourceUrl: string;
  updatedAt: string;
}

interface MarketData {
  oilPrice: MarketDataField | null;
  pesoRate: MarketDataField | null;
}

async function fetchOilPrice(): Promise<MarketDataField | null> {
  try {
    // Brent crude (BZ=F) as proxy for Dubai crude which PH tracks
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=5d&interval=1d",
      {
        headers: { "User-Agent": "pipedream-policy-brief/1.0" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const currentPrice = meta?.regularMarketPrice;
    const previousClose = meta?.chartPreviousClose ?? meta?.previousClose;

    if (typeof currentPrice !== "number") return null;

    let delta = "";
    if (typeof previousClose === "number" && previousClose > 0) {
      const pctChange = ((currentPrice - previousClose) / previousClose) * 100;
      const sign = pctChange >= 0 ? "+" : "";
      delta = `${sign}${pctChange.toFixed(1)}%`;
    }

    return {
      value: Math.round(currentPrice * 100) / 100,
      delta,
      source: "Yahoo Finance (Brent)",
      sourceUrl: "https://finance.yahoo.com/quote/BZ=F/",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function fetchPesoRate(): Promise<MarketDataField | null> {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP",
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const rate = data?.rates?.PHP;
    if (typeof rate !== "number") return null;

    // Fetch previous day for delta
    let delta = "";
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      const prevRes = await fetch(
        `https://api.frankfurter.dev/v1/${yStr}?base=USD&symbols=PHP`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (prevRes.ok) {
        const prevData = await prevRes.json();
        const prevRate = prevData?.rates?.PHP;
        if (typeof prevRate === "number" && prevRate > 0) {
          const diff = rate - prevRate;
          const sign = diff >= 0 ? "+" : "";
          delta = `${sign}${diff.toFixed(2)}`;
        }
      }
    } catch {
      // Delta is non-critical
    }

    return {
      value: Math.round(rate * 100) / 100,
      delta: delta || "Weakening",
      source: "Frankfurter (ECB)",
      sourceUrl: "https://www.ecb.europa.eu/stats/exchange/eurofxref/html/index.en.html",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [oilPrice, pesoRate] = await Promise.all([
      fetchOilPrice(),
      fetchPesoRate(),
    ]);

    const result: MarketData = { oilPrice, pesoRate };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch {
    return NextResponse.json({ oilPrice: null, pesoRate: null });
  }
}
