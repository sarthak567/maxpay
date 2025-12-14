import { useEffect, useState } from "react";
import { Star, Plus, Trash2 } from "lucide-react";
import { useTokenPrices } from "../hooks/useTokenPrices";

export function Watchlist() {
  const { getPrice } = useTokenPrices();
  const [tokens, setTokens] = useState<string[]>(["BTC", "ETH", "MATIC"]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("shiftmind_watchlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTokens(parsed);
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("shiftmind_watchlist", JSON.stringify(tokens));
  }, [tokens]);

  function addToken() {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    if (!tokens.includes(sym)) setTokens((t) => [...t, sym]);
    setInput("");
  }

  function removeToken(sym: string) {
    setTokens((t) => t.filter((s) => s !== sym));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Watchlist</h2>
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add token (e.g., SOL)"
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={addToken}
            className="px-4 py-2 btn-primary rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-white/10">
          {tokens.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No tokens yet. Add one above.
            </div>
          ) : (
            tokens.map((sym) => {
              const p = getPrice(sym);
              const price = p?.price ?? 0;
              const change = p?.change_24h ?? 0;
              return (
                <div
                  key={sym}
                  className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">{sym}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{sym}</div>
                      <div className="text-sm text-slate-400">
                        24h: {change >= 0 ? "+" : ""}
                        {Math.abs(change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-white text-lg font-semibold">
                      ${price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeToken(sym)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
