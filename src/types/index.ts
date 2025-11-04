export interface UserProfile {
  id: string;
  wallet_address: string;
  ai_name: string;
  risk_preference: "conservative" | "moderate" | "aggressive";
  auto_mode_enabled: boolean;
  notification_preferences: {
    email: boolean;
    telegram: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  token_symbol: string;
  balance: number;
  usd_value: number;
  last_synced_at: string;
  created_at: string;
}

export interface SwapHistory {
  id: string;
  user_id: string;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  swap_rate: number;
  gas_fee: number;
  trigger_type: "manual" | "ai_suggestion" | "automation";
  ai_reasoning?: string;
  profit_loss_percentage?: number;
  transaction_hash?: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

export interface AutomationRule {
  id: string;
  user_id: string;
  rule_name: string;
  condition_type: "price_above" | "price_below" | "gas_fee_low" | "time_based";
  token_symbol: string;
  threshold_value: number;
  action_type: "swap" | "rebalance" | "alert";
  from_token: string;
  to_token: string;
  percentage: number;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: "risk_alert" | "opportunity" | "market_trend";
  title: string;
  message: string;
  recommended_action?: {
    type: string;
    from_token: string;
    to_token: string;
    amount: number;
  };
  is_read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change_24h: number;
  market_cap: number;
  name?: string;
  image?: string; // logo url
}
