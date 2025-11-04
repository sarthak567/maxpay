import { useState, useEffect, useRef } from "react";
import { TokenPrice } from "../types";

type SymbolToIdMap = Record<string, string>; // SYMBOL (upper) -> coingecko id

export function useTokenPrices() {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(true);
  const symbolToIdRef = useRef<SymbolToIdMap>({});

  useEffect(() => {
    // Preload top markets (first 500 by market cap) to cover most symbols
    let cancelled = false;
    async function preload() {
      setLoading(true);
      try {
        const pages = [1, 2];
        const results = await Promise.all(
          pages.map((p) =>
            fetch(
              `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${p}&price_change_percentage=24h`
            ).then((r) => r.json())
          )
        );
        if (cancelled) return;
        const merged = ([] as any[]).concat(...results);
        const nextPrices: Record<string, TokenPrice> = {};
        const nextMap: SymbolToIdMap = {};
        for (const c of merged) {
          const symbol = String(c.symbol || "").toUpperCase();
          if (!symbol || nextPrices[symbol]) continue; // keep first occurrence
          nextPrices[symbol] = {
            symbol,
            price: Number(c.current_price ?? 0),
            change_24h: Number(c.price_change_percentage_24h ?? 0),
            market_cap: Number(c.market_cap ?? 0),
            name: String(c.name || symbol),
            image: String(c.image || ""),
          };
          if (c.id) nextMap[symbol] = c.id;
        }
        symbolToIdRef.current = nextMap;
        setPrices(nextPrices);
      } catch (e) {
        console.error("Failed to preload prices", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    preload();
    return () => {
      cancelled = true;
    };
  }, []);

  // Periodically refresh known symbols using coin ids
  useEffect(() => {
    const interval = setInterval(async () => {
      const map = symbolToIdRef.current;
      const symbols = Object.keys(prices);
      if (symbols.length === 0) return;
      const ids = symbols
        .map((s) => map[s])
        .filter(Boolean)
        .join(",");
      if (!ids) return;
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`
        );
        const data = await res.json();
        const updated: Record<string, TokenPrice> = { ...prices };
        for (const c of data) {
          const symbol = String(c.symbol || "").toUpperCase();
          if (!symbol || !updated[symbol]) continue;
          updated[symbol] = {
            symbol,
            price: Number(c.current_price ?? updated[symbol].price),
            change_24h: Number(
              c.price_change_percentage_24h ?? updated[symbol].change_24h
            ),
            market_cap: Number(c.market_cap ?? updated[symbol].market_cap),
            name: String(c.name || updated[symbol].name || symbol),
            image: String(c.image || updated[symbol].image || ""),
          };
        }
        setPrices(updated);
      } catch (e) {
        // silent refresh failure
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [prices]);

  async function resolveAndAddSymbol(
    symbolInput: string
  ): Promise<string | null> {
    const sym = symbolInput.trim().toUpperCase();
    if (!sym) return null;
    if (prices[sym]) return sym;
    // Try preload cache matches by symbol (already loaded most)
    // If not present, use search and fetch
    try {
      const search = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
          sym
        )}`
      ).then((r) => r.json());
      const coins = (search?.coins as any[]) || [];
      const exact = coins.find(
        (c) => String(c.symbol || "").toUpperCase() === sym
      );
      const pick = exact || coins[0];
      if (!pick?.id) return null;
      const id = pick.id as string;
      const market = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&price_change_percentage=24h`
      ).then((r) => r.json());
      const c = market?.[0];
      if (!c) return null;
      const resolvedSym = String(c.symbol || "").toUpperCase();
      const tp: TokenPrice = {
        symbol: resolvedSym,
        price: Number(c.current_price ?? 0),
        change_24h: Number(c.price_change_percentage_24h ?? 0),
        market_cap: Number(c.market_cap ?? 0),
        name: String(c.name || resolvedSym),
        image: String(c.image || ""),
      };
      symbolToIdRef.current[resolvedSym] = id;
      setPrices((prev) => ({ ...prev, [resolvedSym]: tp }));
      return resolvedSym;
    } catch (e) {
      console.error("Failed to resolve symbol", sym, e);
      return null;
    }
  }

  function getPrice(symbol: string): TokenPrice | null {
    const sym = symbol.toUpperCase();
    return prices[sym] || null;
  }

  return {
    prices,
    loading,
    getPrice,
    addSymbol: resolveAndAddSymbol,
  };
}
