import { useState, useEffect } from "react";
import { Save, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function ProfileSettings() {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    ai_name: "",
    risk_preference: "moderate" as "conservative" | "moderate" | "aggressive",
    auto_mode_enabled: false,
    email_notifications: true,
    telegram_notifications: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        ai_name: profile.ai_name || "ShiftMind",
        risk_preference: profile.risk_preference || "moderate",
        auto_mode_enabled: profile.auto_mode_enabled || false,
        email_notifications: profile.notification_preferences?.email ?? true,
        telegram_notifications:
          profile.notification_preferences?.telegram ?? false,
      });
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await updateProfile({
        ai_name: formData.ai_name,
        risk_preference: formData.risk_preference,
        auto_mode_enabled: formData.auto_mode_enabled,
        notification_preferences: {
          email: formData.email_notifications,
          telegram: formData.telegram_notifications,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Customize your ShiftMind experience</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AI Assistant Name
            </label>
            <input
              type="text"
              value={formData.ai_name}
              onChange={(e) =>
                setFormData({ ...formData, ai_name: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              placeholder="e.g., Nova, Athena, ShiftMind"
            />
            <p className="mt-2 text-sm text-slate-400">
              Give your AI assistant a personal name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Risk Preference
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "conservative",
                  label: "Conservative",
                  desc: "Safety first",
                },
                { value: "moderate", label: "Moderate", desc: "Balanced" },
                {
                  value: "aggressive",
                  label: "Aggressive",
                  desc: "High risk/reward",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      risk_preference: option.value as "conservative" | "moderate" | "aggressive",
                    })
                  }
                  className={`p-4 rounded-lg border transition-all ${
                    formData.risk_preference === option.value
                      ? "border-cyan-400 bg-cyan-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="font-medium text-white mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-400">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white mb-1">Auto Mode</div>
                <div className="text-sm text-slate-400">
                  Let AI execute approved swaps automatically without
                  confirmation
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    auto_mode_enabled: !formData.auto_mode_enabled,
                  })
                }
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  formData.auto_mode_enabled ? "bg-cyan-600" : "bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.auto_mode_enabled
                      ? "translate-x-7"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="font-medium text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white mb-1">
                    Email Notifications
                  </div>
                  <div className="text-sm text-slate-400">
                    Receive alerts via email
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      email_notifications: !formData.email_notifications,
                    })
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    formData.email_notifications
                      ? "bg-cyan-600"
                      : "bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.email_notifications
                        ? "translate-x-7"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white mb-1">
                    Telegram Notifications
                  </div>
                  <div className="text-sm text-slate-400">
                    Receive alerts via Telegram
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      telegram_notifications: !formData.telegram_notifications,
                    })
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    formData.telegram_notifications
                      ? "bg-cyan-600"
                      : "bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.telegram_notifications
                        ? "translate-x-7"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white mb-1">
                    Connected Wallet
                  </div>
                  <div className="text-sm text-slate-400 font-mono">
                    {profile?.wallet_address}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            {saved && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg">
                Settings saved successfully!
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
