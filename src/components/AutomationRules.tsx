import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Power } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { AutomationRule } from "../types";

export function AutomationRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: "",
    condition_type: "price_above" as "price_above" | "price_below" | "gas_fee_low",
    token_symbol: "BTC",
    threshold_value: 0,
    action_type: "swap" as const,
    from_token: "BTC",
    to_token: "USDC",
    percentage: 10,
  });

  const loadRules = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading rules:", error);
    } else {
      setRules(data || []);
    }
  }, [user]);

  useEffect(() => {
    loadRules();
  }, [user, loadRules]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from("automation_rules").insert({
        user_id: user.id,
        ...formData,
      });

      if (error) throw error;

      setShowForm(false);
      setFormData({
        rule_name: "",
        condition_type: "price_above",
        token_symbol: "BTC",
        threshold_value: 0,
        action_type: "swap",
        from_token: "BTC",
        to_token: "USDC",
        percentage: 10,
      });
      await loadRules();
    } catch (error) {
      console.error("Error creating rule:", error);
    }
  }

  async function toggleRule(ruleId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from("automation_rules")
        .update({ is_active: !isActive })
        .eq("id", ruleId);

      if (error) throw error;
      await loadRules();
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  }

  async function deleteRule(ruleId: string) {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const { error } = await supabase
        .from("automation_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;
      await loadRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  }

  const tokens = ["BTC", "ETH", "MATIC", "SOL", "BNB", "USDC", "USDT"];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Automation Rules
          </h2>
          <p className="text-slate-400">
            Set it and forget it - let AI handle your swaps
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Rule
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Create Automation Rule
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rule Name
              </label>
              <input
                type="text"
                value={formData.rule_name}
                onChange={(e) =>
                  setFormData({ ...formData, rule_name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                placeholder="e.g., Protect BTC profits"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Condition
                </label>
                <select
                  value={formData.condition_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition_type: e.target.value as "price_above" | "price_below" | "gas_fee_low",
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="price_above">Price Above</option>
                  <option value="price_below">Price Below</option>
                  <option value="gas_fee_low">Gas Fee Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Token
                </label>
                <select
                  value={formData.token_symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, token_symbol: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                >
                  {tokens.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Threshold Value
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.threshold_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    threshold_value: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                placeholder="e.g., 70000"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  From Token
                </label>
                <select
                  value={formData.from_token}
                  onChange={(e) =>
                    setFormData({ ...formData, from_token: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                >
                  {tokens.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  To Token
                </label>
                <select
                  value={formData.to_token}
                  onChange={(e) =>
                    setFormData({ ...formData, to_token: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                >
                  {tokens.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentage: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Create Rule
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Active Rules</h3>
        </div>

        <div className="divide-y divide-white/10">
          {rules.length === 0 ? (
            <div className="p-12 text-center">
              <Power className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No automation rules yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Create your first rule to get started
              </p>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white text-lg">
                        {rule.rule_name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          rule.is_active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {rule.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 mb-3">
                      <p className="text-slate-300 text-sm mb-2">
                        <span className="font-medium text-white">When:</span>{" "}
                        {rule.token_symbol}{" "}
                        {rule.condition_type.replace("_", " ")} $
                        {rule.threshold_value}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <span className="font-medium text-white">Then:</span>{" "}
                        Swap {rule.percentage}% of {rule.from_token} →{" "}
                        {rule.to_token}
                      </p>
                    </div>

                    {rule.last_triggered_at && (
                      <p className="text-xs text-slate-500">
                        Last triggered:{" "}
                        {new Date(rule.last_triggered_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRule(rule.id, rule.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.is_active
                          ? "bg-green-500/20 hover:bg-green-500/30"
                          : "bg-slate-500/20 hover:bg-slate-500/30"
                      }`}
                      title={rule.is_active ? "Disable" : "Enable"}
                    >
                      <Power
                        className={`w-5 h-5 ${
                          rule.is_active ? "text-green-400" : "text-slate-400"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
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
