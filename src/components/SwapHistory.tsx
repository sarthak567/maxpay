import { useState, useEffect } from "react";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  X,
  Filter,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { SwapHistory as SwapHistoryType } from "../types";

export function SwapHistory() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<SwapHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");

  useEffect(() => {
    loadHistory();
  }, [user, filter]);

  async function loadHistory() {
    if (!user) return;

    let query = supabase
      .from("swap_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading history:", error);
    } else {
      setSwaps(data || []);
    }

    setLoading(false);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-400" />;
      case "failed":
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  }

  function getTriggerBadge(trigger: string) {
    const badges = {
      manual: { label: "Manual", color: "bg-blue-500/20 text-blue-400" },
      ai_suggestion: {
        label: "AI Suggested",
        color: "bg-cyan-500/20 text-cyan-400",
      },
      automation: {
        label: "Auto Rule",
        color: "bg-purple-500/20 text-purple-400",
      },
    };

    const badge = badges[trigger as keyof typeof badges] || badges.manual;

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  }

  const totalProfit = swaps
    .filter((s) => s.status === "completed" && s.profit_loss_percentage)
    .reduce((sum, s) => sum + Number(s.profit_loss_percentage), 0);

  function exportCsv() {
    if (swaps.length === 0) return;
    const header = [
      "Date",
      "From Token",
      "From Amount",
      "To Token",
      "To Amount",
      "Rate",
      "Gas Fee",
      "Status",
      "Trigger",
      "AI Reasoning",
    ];
    const rows = swaps.map((s) => [
      new Date(s.created_at).toISOString(),
      s.from_token,
      String(s.from_amount),
      s.to_token,
      String(s.to_amount),
      String(s.swap_rate),
      String(s.gas_fee),
      s.status,
      s.trigger_type,
      (s.ai_reasoning || "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shiftmind-swaps-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Swap History</h2>
          <p className="text-slate-400">
            Track all your crypto swaps and performance
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6">
          <p className="text-white/80 text-sm mb-2">Total Swaps</p>
          <p className="text-4xl font-bold text-white">{swaps.length}</p>
        </div>

        <div
          className={`rounded-2xl p-6 ${
            totalProfit >= 0 ? "bg-green-500/20" : "bg-red-500/20"
          }`}
        >
          <p className="text-white/80 text-sm mb-2">Total Performance</p>
          <p
            className={`text-4xl font-bold ${
              totalProfit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {totalProfit >= 0 ? "+" : ""}
            {totalProfit.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <p className="text-white/80 text-sm mb-2">AI Swaps</p>
          <p className="text-4xl font-bold text-white">
            {swaps.filter((s) => s.trigger_type !== "manual").length}
          </p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              Transaction History
            </h3>
            <div className="flex gap-2">
              <button
                onClick={exportCsv}
                className="px-3 py-1 btn-soft rounded-lg flex items-center gap-2"
                title="Export CSV"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              {["all", "completed", "pending", "failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {swaps.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No swaps found</p>
              <p className="text-sm text-slate-500 mt-2">
                Your swap history will appear here
              </p>
            </div>
          ) : (
            swaps.map((swap) => (
              <div
                key={swap.id}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {swap.from_token}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-white">
                          {swap.to_token}
                        </span>
                      </div>
                      {getTriggerBadge(swap.trigger_type)}
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                          swap.status
                        )}`}
                      >
                        {getStatusIcon(swap.status)}
                        {swap.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-slate-400">Amount: </span>
                        <span className="text-white font-medium">
                          {Number(swap.from_amount).toFixed(6)}{" "}
                          {swap.from_token}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Received: </span>
                        <span className="text-white font-medium">
                          {Number(swap.to_amount).toFixed(6)} {swap.to_token}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Rate: </span>
                        <span className="text-white font-medium">
                          {Number(swap.swap_rate).toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Gas: </span>
                        <span className="text-white font-medium">
                          ${Number(swap.gas_fee).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {swap.ai_reasoning && (
                      <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3 mb-2">
                        <p className="text-cyan-200 text-sm">
                          <span className="font-semibold">AI Reasoning: </span>
                          {swap.ai_reasoning}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        {new Date(swap.created_at).toLocaleString()}
                      </p>

                      {swap.profit_loss_percentage !== null && (
                        <div
                          className={`flex items-center gap-1 ${
                            Number(swap.profit_loss_percentage) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {Number(swap.profit_loss_percentage) >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {Number(swap.profit_loss_percentage) >= 0
                              ? "+"
                              : ""}
                            {Number(swap.profit_loss_percentage).toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
