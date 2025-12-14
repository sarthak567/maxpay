import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Bot, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { ChatMessage } from "../types";
import { useTokenPrices } from "../hooks/useTokenPrices";

export function AIChat() {
  const { user, profile } = useAuth();
  const { getPrice } = useTokenPrices();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    setMessages(data || []);

    if (!data || data.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        user_id: user.id,
        role: "assistant",
        content: `Hi! I'm ${
          profile?.ai_name || "X PAY Assistant"
        }, your AI crypto assistant. I can help you:\n\n• Analyze market trends\n• Suggest optimal swap timings\n• Answer questions about your portfolio\n• Set up automation rules\n\nWhat would you like to know?`,
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user, profile?.ai_name]);

  useEffect(() => {
    loadMessages();
  }, [user, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function generateAIResponse(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("price") || lowerMessage.includes("how much")) {
      const tokens = ["eth", "btc", "matic", "sol", "bnb", "usdc"];
      const mentionedToken = tokens.find((t) => lowerMessage.includes(t));

      if (mentionedToken) {
        const price = getPrice(mentionedToken.toUpperCase());
        if (price) {
          return `${mentionedToken.toUpperCase()} is currently trading at $${price.price.toFixed(
            2
          )}. It's ${price.change_24h >= 0 ? "up" : "down"} ${Math.abs(
            price.change_24h
          ).toFixed(
            2
          )}% in the last 24 hours.\n\nWould you like me to analyze if this is a good time to buy or sell?`;
        }
      }
    }

    if (lowerMessage.includes("buy") || lowerMessage.includes("swap")) {
      return `I can help you execute that swap! Here's what I recommend:\n\n• Check current gas fees (they're moderate right now)\n• Consider market volatility\n• Review slippage tolerance\n\nWould you like me to prepare a swap transaction for you?`;
    }

    if (
      lowerMessage.includes("portfolio") ||
      lowerMessage.includes("holdings")
    ) {
      return `Let me analyze your portfolio for you. Based on current market conditions:\n\n✅ Your diversification looks reasonable\n⚠️ Consider rebalancing if volatility increases\n💡 Gas fees are optimal for swaps right now\n\nWould you like specific recommendations?`;
    }

    if (
      lowerMessage.includes("automation") ||
      lowerMessage.includes("auto") ||
      lowerMessage.includes("rule")
    ) {
      return `Great question! I can help you set up automation rules. For example:\n\n"If BTC price > $70,000 → swap 20% to USDC"\n"If gas fees < 10 gwei → rebalance portfolio"\n\nWould you like to create a rule now?`;
    }

    if (lowerMessage.includes("risk") || lowerMessage.includes("safe")) {
      return `Based on your current portfolio composition:\n\n📊 Your risk level is moderate\n🛡️ Consider holding 30-40% in stablecoins for protection\n📈 Volatile assets can offer higher returns but need monitoring\n\nWould you like me to suggest a safer allocation?`;
    }

    return `I understand you're asking about "${userMessage}". Here's my take:\n\nThe crypto market is dynamic right now. I recommend:\n\n• Monitor price movements closely\n• Set up automation rules for protection\n• Diversify across multiple assets\n\nWould you like more specific advice on this topic?`;
  }

  async function handleSend() {
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: input,
    });

    const aiResponse = await generateAIResponse(input);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      user_id: user.id,
      role: "assistant",
      content: aiResponse,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: aiResponse,
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            {profile?.ai_name || "AI Assistant"}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Your intelligent crypto companion
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about crypto..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
