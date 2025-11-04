/*
  # ShiftMind Database Schema

  ## Overview
  This migration creates the complete database schema for ShiftMind - an AI-powered crypto portfolio management platform.

  ## New Tables

  ### 1. `user_profiles`
  Stores user preferences and settings
  - `id` (uuid, primary key) - References auth.users
  - `wallet_address` (text) - Primary wallet address
  - `ai_name` (text) - Personalized AI assistant name
  - `risk_preference` (text) - conservative/moderate/aggressive
  - `auto_mode_enabled` (boolean) - Whether automation is active
  - `notification_preferences` (jsonb) - Email, telegram settings
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `portfolios`
  Tracks current token holdings snapshot
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `token_symbol` (text) - ETH, BTC, USDC, etc
  - `balance` (decimal) - Current balance
  - `usd_value` (decimal) - Current USD value
  - `last_synced_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 3. `swap_history`
  Records all executed swaps
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `from_token` (text)
  - `to_token` (text)
  - `from_amount` (decimal)
  - `to_amount` (decimal)
  - `swap_rate` (decimal)
  - `gas_fee` (decimal)
  - `trigger_type` (text) - manual/ai_suggestion/automation
  - `ai_reasoning` (text) - Why AI suggested this swap
  - `profit_loss_percentage` (decimal)
  - `transaction_hash` (text)
  - `status` (text) - pending/completed/failed
  - `created_at` (timestamptz)

  ### 4. `automation_rules`
  User-defined trading rules
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `rule_name` (text)
  - `condition_type` (text) - price_above/price_below/gas_fee_low/time_based
  - `token_symbol` (text)
  - `threshold_value` (decimal)
  - `action_type` (text) - swap/rebalance/alert
  - `from_token` (text)
  - `to_token` (text)
  - `percentage` (decimal) - Percentage of holdings to swap
  - `is_active` (boolean)
  - `last_triggered_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 5. `ai_insights`
  Stores AI-generated market insights and recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `insight_type` (text) - risk_alert/opportunity/market_trend
  - `title` (text)
  - `message` (text)
  - `recommended_action` (jsonb) - Structured action data
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ### 6. `chat_messages`
  Conversation history with AI
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `role` (text) - user/assistant
  - `content` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Authenticated access required for all operations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE NOT NULL,
  ai_name text DEFAULT 'ShiftMind',
  risk_preference text DEFAULT 'moderate' CHECK (risk_preference IN ('conservative', 'moderate', 'aggressive')),
  auto_mode_enabled boolean DEFAULT false,
  notification_preferences jsonb DEFAULT '{"email": true, "telegram": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  token_symbol text NOT NULL,
  balance decimal(36, 18) DEFAULT 0,
  usd_value decimal(18, 2) DEFAULT 0,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token_symbol)
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio"
  ON portfolios FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own portfolio"
  ON portfolios FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own portfolio"
  ON portfolios FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own portfolio"
  ON portfolios FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create swap_history table
CREATE TABLE IF NOT EXISTS swap_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  from_token text NOT NULL,
  to_token text NOT NULL,
  from_amount decimal(36, 18) NOT NULL,
  to_amount decimal(36, 18) NOT NULL,
  swap_rate decimal(18, 8) NOT NULL,
  gas_fee decimal(18, 8) DEFAULT 0,
  trigger_type text DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'ai_suggestion', 'automation')),
  ai_reasoning text,
  profit_loss_percentage decimal(10, 2),
  transaction_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE swap_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own swap history"
  ON swap_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own swap history"
  ON swap_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  condition_type text NOT NULL CHECK (condition_type IN ('price_above', 'price_below', 'gas_fee_low', 'time_based')),
  token_symbol text NOT NULL,
  threshold_value decimal(18, 2) NOT NULL,
  action_type text DEFAULT 'swap' CHECK (action_type IN ('swap', 'rebalance', 'alert')),
  from_token text NOT NULL,
  to_token text NOT NULL,
  percentage decimal(5, 2) DEFAULT 10 CHECK (percentage > 0 AND percentage <= 100),
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automation rules"
  ON automation_rules FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own automation rules"
  ON automation_rules FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own automation rules"
  ON automation_rules FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own automation rules"
  ON automation_rules FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('risk_alert', 'opportunity', 'market_trend')),
  title text NOT NULL,
  message text NOT NULL,
  recommended_action jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own insights"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own insights"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_history_user_id ON swap_history(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_history_created_at ON swap_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_is_read ON ai_insights(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);