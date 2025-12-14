import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  History,
  Settings,
  MessageSquare,
  Zap,
  LogOut,
  RefreshCw,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PortfolioOverview } from "./PortfolioOverview";
import { AIChat } from "./AIChat";
import { SwapHistory } from "./SwapHistory";
import { AutomationRules } from "./AutomationRules";
import { ProfileSettings } from "./ProfileSettings";
import { Watchlist } from "./Watchlist";
import { usePortfolio } from "../hooks/usePortfolio";
import { useTokenPrices } from "../hooks/useTokenPrices";
import { supabase } from "../lib/supabase";

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "portfolio" | "chat" | "history" | "automation" | "settings" | "watchlist"
  >("portfolio");
  const { portfolio, refreshPortfolio } = usePortfolio();
  const { getPrice } = useTokenPrices();

  const [quickSwapOpen, setQuickSwapOpen] = useState(false);
  const [fromToken, setFromToken] = useState<
    "BTC" | "ETH" | "MATIC" | "SOL" | "BNB" | "USDC"
  >("ETH");
  const [toToken, setToToken] = useState<
    "BTC" | "ETH" | "MATIC" | "SOL" | "BNB" | "USDC"
  >("USDC");
  const [percentage, setPercentage] = useState(20);
  const [swapping, setSwapping] = useState(false);
  const [gas, setGas] = useState<{
    level: "low" | "moderate" | "high";
    gwei: number;
  }>({ level: "moderate", gwei: 18 });

  // Mock gas updates
  useEffect(() => {
    const id = setInterval(() => {
      const g = Math.max(5, Math.round(40 * Math.random()));
      const level = g < 12 ? "low" : g < 25 ? "moderate" : "high";
      setGas({ level, gwei: g });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const tabs = [
    { id: "portfolio" as const, label: "Portfolio", icon: TrendingUp },
    { id: "watchlist" as const, label: "Watchlist", icon: Star },
    { id: "chat" as const, label: "AI Chat", icon: MessageSquare },
    { id: "history" as const, label: "History", icon: History },
    { id: "automation" as const, label: "Automation", icon: Zap },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0b1740] to-slate-900">
      <nav className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">X PAY</h1>
                <p className="text-sm text-cyan-300">
                  {profile?.ai_name || "Your AI Assistant"}
                </p>
              </div>

              {/* Moved Quick Swap next to logo */}
              <button
                onClick={() => setQuickSwapOpen(true)}
                className="px-3 py-2 btn-primary rounded-lg text-sm font-medium ml-2"
              >
                Quick Swap
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`hidden md:flex items-center gap-2 px-2 py-1 rounded-lg border ${
                  gas.level === "low"
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : gas.level === "moderate"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
                title="Network Gas"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    gas.level === "low"
                      ? "text-green-300"
                      : gas.level === "moderate"
                      ? "text-yellow-300"
                      : "text-red-300"
                  }`}
                />
                <span className="text-sm font-medium">{gas.gwei} gwei</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Wallet</p>
                <p className="text-sm text-white font-mono">
                  {profile?.wallet_address?.slice(0, 6)}...
                  {profile?.wallet_address?.slice(-4)}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap shadow-sm ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {activeTab === "portfolio" && <PortfolioOverview />}
        {activeTab === "watchlist" && <Watchlist />}
        {activeTab === "chat" && <AIChat />}
        {activeTab === "history" && <SwapHistory />}
        {activeTab === "automation" && <AutomationRules />}
        {activeTab === "settings" && <ProfileSettings />}
      </main>

      {quickSwapOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Quick Swap</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    From
                  </label>
                  <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value as "BTC" | "ETH" | "MATIC" | "SOL" | "BNB" | "USDC")}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {["BTC", "ETH", "MATIC", "SOL", "BNB", "USDC"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    To
                  </label>
                  <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value as "BTC" | "ETH" | "MATIC" | "SOL" | "BNB" | "USDC")}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {["BTC", "ETH", "MATIC", "SOL", "BNB", "USDC"]
                      .filter((t) => t !== fromToken)
                      .map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Percentage
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={percentage}
                  onChange={(e) => setPercentage(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available:{" "}
                  {Number(
                    portfolio.find((p) => p.token_symbol === fromToken)
                      ?.balance || 0
                  ).toFixed(6)}{" "}
                  {fromToken}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300">
                <p>
                  Estimated: swap{" "}
                  {(
                    (Number(
                      portfolio.find((p) => p.token_symbol === fromToken)
                        ?.balance || 0
                    ) *
                      percentage) /
                    100
                  ).toFixed(6)}{" "}
                  {fromToken} →
                  {(() => {
                    const fromPrice = getPrice(fromToken)?.price || 0;
                    const toPrice = getPrice(toToken)?.price || 1;
                    const fromAmt =
                      (Number(
                        portfolio.find((p) => p.token_symbol === fromToken)
                          ?.balance || 0
                      ) *
                        percentage) /
                      100;
                    const toAmt = (fromAmt * fromPrice) / toPrice;
                    return ` ${toAmt.toFixed(6)} ${toToken}`;
                  })()}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setQuickSwapOpen(false)}
                  className="px-5 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!user) return;
                    const from = portfolio.find(
                      (p) => p.token_symbol === fromToken
                    );
                    if (!from || percentage <= 0 || percentage > 100) return;
                    const fromPrice = getPrice(fromToken)?.price || 0;
                    const toPrice = getPrice(toToken)?.price || 1;
                    const fromAmount =
                      (Number(from.balance) * percentage) / 100;
                    const usdValue = fromAmount * fromPrice;
                    const gasFee = Math.max(0.5, Math.random() * 3);
                    const toAmount = usdValue / toPrice;
                    const swapRate = toAmount / fromAmount || 0;
                    setSwapping(true);
                    try {
                      await supabase.from("swap_history").insert({
                        user_id: user.id,
                        from_token: fromToken,
                        to_token: toToken,
                        from_amount: fromAmount,
                        to_amount: toAmount,
                        swap_rate: swapRate,
                        gas_fee: gasFee,
                        status: "completed",
                        trigger_type: "manual",
                        ai_reasoning: `Quick swap ${percentage}% of ${fromToken}`,
                      });
                      const remainingFrom = Number(from.balance) - fromAmount;
                      await supabase.from("portfolios").upsert({
                        user_id: user.id,
                        token_symbol: fromToken,
                        balance: remainingFrom,
                        usd_value: remainingFrom * fromPrice,
                        last_synced_at: new Date().toISOString(),
                      });
                      const existingTo = portfolio.find(
                        (p) => p.token_symbol === toToken
                      );
                      const newToBalance =
                        (existingTo ? Number(existingTo.balance) : 0) +
                        toAmount;
                      await supabase.from("portfolios").upsert({
                        user_id: user.id,
                        token_symbol: toToken,
                        balance: newToBalance,
                        usd_value: newToBalance * toPrice,
                        last_synced_at: new Date().toISOString(),
                      });
                      await refreshPortfolio();
                      setQuickSwapOpen(false);
                    } finally {
                      setSwapping(false);
                    }
                  }}
                  disabled={swapping}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
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
