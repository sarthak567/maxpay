import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { useTokenPrices } from "../hooks/useTokenPrices";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { AIInsight } from "../types";

export function PortfolioOverview() {
  const { portfolio, loading, totalValue, refreshPortfolio } = usePortfolio();
  const { prices, getPrice } = useTokenPrices();
  const { user, profile } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [swapOpen, setSwapOpen] = useState<{
    symbol: string;
    balance: number;
  } | null>(null);
  const [swapTo, setSwapTo] = useState<"USDC" | "ETH" | "BTC" | "MATIC">(
    "USDC"
  );
  const [swapPct, setSwapPct] = useState(20);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [user]);

  async function loadInsights() {
    if (!user) return;

    const { data } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(3);

    setInsights(data || []);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refreshPortfolio();
    setTimeout(() => setRefreshing(false), 1000);
  }

  function getRiskLevel() {
    if (portfolio.length === 0)
      return {
        level: "neutral",
        color: "text-slate-400",
        bg: "bg-slate-500/20",
      };

    const stablecoins = portfolio.filter((p) =>
      ["USDC", "USDT", "DAI"].includes(p.token_symbol)
    );
    const stablePercentage =
      (stablecoins.reduce((sum, p) => sum + Number(p.usd_value), 0) /
        totalValue) *
      100;

    if (stablePercentage > 70)
      return {
        level: "Low Risk",
        color: "text-green-400",
        bg: "bg-green-500/20",
      };
    if (stablePercentage > 40)
      return {
        level: "Medium Risk",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
      };
    return { level: "High Risk", color: "text-red-400", bg: "bg-red-500/20" };
  }

  const riskLevel = getRiskLevel();

  async function executeSwap(
    fromSymbol: string,
    toSymbol: string,
    percent: number
  ) {
    if (!user) return;
    const from = portfolio.find((p) => p.token_symbol === fromSymbol);
    if (!from || percent <= 0 || percent > 100) return;

    const fromPrice = getPrice(fromSymbol)?.price || 0;
    const toPrice = getPrice(toSymbol)?.price || 1;
    const fromAmount = (Number(from.balance) * percent) / 100;
    const usdValue = fromAmount * fromPrice;
    const gasFee = Math.max(0.5, Math.random() * 3);
    const toAmount = usdValue / toPrice;
    const swapRate = toAmount / fromAmount || 0;

    setSwapping(true);

    try {
      await supabase.from("swap_history").insert({
        user_id: user.id,
        from_token: fromSymbol,
        to_token: toSymbol,
        from_amount: fromAmount,
        to_amount: toAmount,
        swap_rate: swapRate,
        gas_fee: gasFee,
        status: "completed",
        trigger_type: "manual",
        ai_reasoning: `Swapped ${percent}% of ${fromSymbol} based on user action`,
      });

      // Update portfolio balances
      const remainingFrom = Number(from.balance) - fromAmount;
      await supabase.from("portfolios").upsert({
        user_id: user.id,
        token_symbol: fromSymbol,
        balance: remainingFrom,
        usd_value: remainingFrom * fromPrice,
        last_synced_at: new Date().toISOString(),
      });

      const existingTo = portfolio.find((p) => p.token_symbol === toSymbol);
      const newToBalance =
        (existingTo ? Number(existingTo.balance) : 0) + toAmount;
      await supabase.from("portfolios").upsert({
        user_id: user.id,
        token_symbol: toSymbol,
        balance: newToBalance,
        usd_value: newToBalance * toPrice,
        last_synced_at: new Date().toISOString(),
      });

      await refreshPortfolio();
      setSwapOpen(null);
    } finally {
      setSwapping(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Hi {profile?.wallet_address?.slice(0, 6)} 👋
          </h2>
          <p className="text-slate-400">Here's your portfolio overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          <RefreshCw
            className={`w-5 h-5 text-cyan-400 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 shadow-[0_10px_40px_-15px_rgba(6,182,212,0.5)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-sm font-medium">
              Total Value
            </span>
          </div>
          <p className="text-4xl font-bold text-white">
            ${totalValue.toFixed(2)}
          </p>
        </div>

        <div
          className={`${riskLevel.bg} rounded-2xl p-6 border border-white/10`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-sm font-medium">
              Risk Level
            </span>
          </div>
          <p className={`text-2xl font-bold ${riskLevel.color}`}>
            {riskLevel.level}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-sm font-medium">Assets</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {portfolio.length} Tokens
          </p>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="card p-6 border-cyan-400/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-cyan-400" />
            AI Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-slate-300 text-sm">{insight.message}</p>
                  </div>
                  {insight.recommended_action && (
                    <button className="px-4 py-2 btn-primary rounded-lg text-sm font-medium whitespace-nowrap">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Your Holdings</h3>
        </div>
        <div className="divide-y divide-white/10">
          {portfolio.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400">No tokens in portfolio yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Connect your wallet to sync holdings
              </p>
            </div>
          ) : (
            portfolio.map((item) => {
              const tokenPrice = getPrice(item.token_symbol);
              const change24h = tokenPrice?.change_24h || 0;

              return (
                <div
                  key={item.id}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {item.token_symbol}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {item.token_symbol}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {Number(item.balance).toFixed(6)} tokens
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-white text-lg">
                        ${Number(item.usd_value).toFixed(2)}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          change24h >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(change24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        setSwapOpen({
                          symbol: item.token_symbol,
                          balance: Number(item.balance),
                        })
                      }
                      className="flex-1 px-4 py-2 btn-primary rounded-lg text-sm font-medium"
                    >
                      Swap
                    </button>
                    <button className="px-4 py-2 btn-soft rounded-lg text-sm font-medium">
                      Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {swapOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Swap {swapOpen.symbol}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Swap To
                </label>
                <select
                  value={swapTo}
                  onChange={(e) => setSwapTo(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {["USDC", "ETH", "BTC", "MATIC"]
                    .filter((t) => t !== swapOpen.symbol)
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Percentage
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={swapPct}
                  onChange={(e) => setSwapPct(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  You have {swapOpen.balance.toFixed(6)} {swapOpen.symbol}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300">
                <p>
                  Estimated: swap{" "}
                  {((swapOpen.balance * swapPct) / 100).toFixed(6)}{" "}
                  {swapOpen.symbol} →
                  {(() => {
                    const fromPrice = getPrice(swapOpen.symbol)?.price || 0;
                    const toPrice = getPrice(swapTo)?.price || 1;
                    const toAmt =
                      (((swapOpen.balance * swapPct) / 100) * fromPrice) /
                      toPrice;
                    return ` ${toAmt.toFixed(6)} ${swapTo}`;
                  })()}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSwapOpen(null)}
                  className="px-5 py-2 btn-soft rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeSwap(swapOpen.symbol, swapTo, swapPct)}
                  disabled={swapping}
                  className="px-5 py-2 btn-primary rounded-lg font-medium disabled:opacity-50"
                >
                  {swapping ? "Swapping…" : "Approve Swap"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
