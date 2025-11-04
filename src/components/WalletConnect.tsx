import { useState } from "react";
import { Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function WalletConnect() {
  const { connectWallet, user, signUp } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setIsConnecting(true);
    setError("");

    try {
      // Resolve a wallet address from provider or generate a mock
      let resolvedAddress: string | undefined;
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        resolvedAddress = accounts[0];
      }
      if (!resolvedAddress) {
        resolvedAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      }

      // If no authenticated user, create a lightweight demo account automatically
      if (!user) {
        const emailSuffix = Math.random().toString(36).slice(2, 8);
        const demoEmail = `demo+${emailSuffix}@example.com`;
        const demoPassword = `Pass_${Date.now()}`;
        await signUp(demoEmail, demoPassword, resolvedAddress);
      }

      await connectWallet(resolvedAddress);
    } catch (err) {
      setError("Failed to connect wallet");
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-6 h-6" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </div>
  );
}
