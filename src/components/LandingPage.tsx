import {
  Brain,
  TrendingUp,
  Shield,
  Zap,
  MessageSquare,
  Settings,
} from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const { signIn, signUp } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        const mockWallet = `0x${Math.random().toString(16).substr(2, 40)}`;
        await signUp(email, password, mockWallet);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0b1740] to-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-30 animated-gradient"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-30 animated-gradient"></div>

      <div className="relative">
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/10 animate-float">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">maxpay</span>
          </div>
          <button
            onClick={() => setShowAuth(!showAuth)}
            className="px-6 py-2 btn-soft rounded-lg backdrop-blur-sm"
          >
            {showAuth ? "Close" : "Sign In"}
          </button>
        </nav>

        <div className="container mx-auto px-6 pt-10 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  Think. Swap. Earn.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-cyan-200/90 mb-4">
                Let AI manage your crypto swaps
              </p>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                Your intelligent companion for smarter crypto trading. Get
                AI-powered insights, automated swaps, and 24/7 portfolio
                monitoring — all in one beautiful interface.
              </p>

              {showAuth ? (
                <div className="max-w-md mx-auto glass rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {isSignUp ? "Create Account" : "Sign In"}
                  </h2>
                  <form onSubmit={handleAuth} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      required
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      type="submit"
                      className="w-full py-3 btn-primary rounded-lg font-semibold"
                    >
                      {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="w-full text-cyan-300 text-sm hover:text-cyan-200"
                    >
                      {isSignUp
                        ? "Already have an account? Sign In"
                        : "Don't have an account? Sign Up"}
                    </button>
                  </form>
                  <div className="mt-6">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-transparent text-slate-400">
                          or
                        </span>
                      </div>
                    </div>
                    <WalletConnect />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <WalletConnect />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="card p-8 hover:border-cyan-400/50">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  AI Conversations
                </h3>
                <p className="text-slate-300">
                  Chat naturally with your AI assistant. Ask questions, get
                  insights, and execute swaps through simple conversation.
                </p>
              </div>

              <div className="card p-8 hover:border-cyan-400/50">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Smart Insights
                </h3>
                <p className="text-slate-300">
                  Receive real-time market analysis and personalized
                  recommendations based on your portfolio and risk preferences.
                </p>
              </div>

              <div className="card p-8 hover:border-cyan-400/50">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Auto Trading
                </h3>
                <p className="text-slate-300">
                  Set rules once, let AI execute. Automatic swaps based on price
                  triggers, gas fees, or custom conditions.
                </p>
              </div>
            </div>

            <div className="card p-12">
              <div className="flex items-start gap-4 mb-8">
                <Shield className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    100% Non-Custodial
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Your wallet, your keys, your crypto. maxpay never holds your
                    assets. We only suggest and execute swaps with your
                    approval, directly through your wallet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Settings className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Powered by SideShift
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Seamless cross-chain swaps with competitive rates, no KYC
                    required. Trade between ETH, BTC, MATIC, and 50+
                    cryptocurrencies instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="text-center text-slate-400">
            <p>maxpay - AI-Powered Crypto Portfolio Management</p>
            <p className="text-sm mt-2">
              Built with Supabase, React, and SideShift API
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
