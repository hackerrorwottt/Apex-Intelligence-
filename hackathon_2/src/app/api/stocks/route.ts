import { NextResponse } from "next/server";

const API_KEY = "f5cb284dd47849f49ce2ae78eb69676c";

// Server-side in-memory cache to handle Twelve Data 8-calls/min rate limits
let cache = {
  quote: {
    data: null as any,
    timestamp: 0,
  },
  series: {} as Record<string, { data: any; timestamp: number }>,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "quote";
  const now = Date.now();

  try {
    if (action === "quote") {
      // Always fetch the complete set of symbols to keep the cache fully populated
      const symbolsToFetch = "SPY,QQQ,GLD,IEF,BTC/USD,ETH/USD";

      // Return cache if it is fresh (less than 60s old)
      if (cache.quote.data && now - cache.quote.timestamp < 60000) {
        return NextResponse.json(cache.quote.data);
      }

      const res = await fetch(
        `https://api.twelvedata.com/quote?symbol=${symbolsToFetch}&apikey=${API_KEY}`,
        { next: { revalidate: 60 } }
      );
      
      if (!res.ok) throw new Error("HTTP error connecting to Twelve Data");
      const data = await res.json();

      // Check if API returned a rate limit or credential error
      if (data.status === "error" || data.code === 429) {
        throw new Error(data.message || "API rate limit reached");
      }

      cache.quote.data = data;
      cache.quote.timestamp = now;
      return NextResponse.json(data);
    }

    if (action === "series") {
      const symbol = searchParams.get("symbol") || "SPY";
      const interval = searchParams.get("interval") || "1day";
      const outputsize = searchParams.get("outputsize") || "30";

      const cacheKey = `${symbol}_${interval}_${outputsize}`;

      if (cache.series[cacheKey] && now - cache.series[cacheKey].timestamp < 60000) {
        return NextResponse.json(cache.series[cacheKey].data);
      }

      const res = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`,
        { next: { revalidate: 60 } }
      );
      
      if (!res.ok) throw new Error("HTTP error connecting to Twelve Data");
      const data = await res.json();

      if (data.status === "error" || data.code === 429) {
        throw new Error(data.message || "API rate limit reached");
      }

      cache.series[cacheKey] = {
        data: data,
        timestamp: now,
      };
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Twelve Data API Error, falling back to mock data:", error.message);
    return NextResponse.json(
      { error: error.message, isFallback: true },
      { status: 200 } // Send status 200 so the client can read the isFallback flag safely
    );
  }
}
