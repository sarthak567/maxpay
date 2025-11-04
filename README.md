# maxpay – AI Crypto Portfolio & Swap Dashboard

maxpay is a Vite + React + Tailwind web app that helps users monitor crypto, chat with an AI assistant, manage automation rules, and perform quick swaps. It uses Supabase for auth and data, and integrates live market data from CoinGecko for watchlists and pricing.

## What this web app does

- Dashboard with tabs: Portfolio, Watchlist, AI Chat, History, Automation, Settings, Leaderboard
- Quick Swap modal to simulate/record swaps between popular coins
- Watchlist with live prices, coin logos, and names (resolved via CoinGecko)
- Swap History persisted in Supabase
- Automation Rules UI (client-side) for rule setup
- Profile Settings (AI name, risk level, notification preferences)

## How it works (high-level)

- UI: React 18 + TailwindCSS (Vite build)
- Auth/Data: Supabase (users, portfolios, swap_history, etc.)
- Prices: custom hook `useTokenPrices` fetches markets from CoinGecko (top coins preload + symbol/name search). It stores symbol→id map and periodically refreshes prices.
- Quick Swap: performs validations, writes a swap record to Supabase, and updates portfolio balances to reflect the swap.

### Data flow

1. User signs in (Supabase) → `AuthContext` provides `user` and `profile`.
2. `usePortfolio` loads holdings from Supabase and computes totals.
3. `useTokenPrices` loads/refreshes prices (CoinGecko) → Watchlist and Quick Swap read prices via `getPrice(symbol)`.
4. Quick Swap writes a row to `swap_history` and upserts both tokens in `portfolios`.

## SideShift API usage

SideShift enables real cross-chain swaps between assets. In this project, the Quick Swap is currently simulated and persisted to Supabase for UX, but the code is structured to wire SideShift easily:

- Where to integrate: `src/components/Dashboard.tsx` inside the Quick Swap confirm handler.
- Replace the simulated write with a server-side call (recommended) to SideShift:
  1. Create a backend route (Vercel serverless function under `api/`) to call SideShift securely with your API key.
  2. From the Quick Swap button, call your `api/create-swap` endpoint with `from`, `to`, and `amount`.
  3. Receive a deposit address and start polling swap status (or Webhook).
  4. When status is complete, insert into `swap_history` with the returned tx hash and mark `status` as `completed`.

References (read before integrating):

- SideShift Docs: `https://sideshift.ai/developers`
- Use server-side functions for API keys; never expose secrets in the browser.

## Environment variables

Set these in `.env.local` for dev and in Vercel Project Settings for production:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Local development

```bash
npm install
npm run dev
# open the URL shown (e.g., http://localhost:5173)
```

## Production build

```bash
npm run build
# output in /dist
```

## Deploy to Vercel

- Project root contains `vercel.json` for SPA rewrites and asset caching.
- Vercel settings:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Security & notes

- Do not put API secrets in the client. For SideShift, create serverless functions under `api/` to proxy calls with your key.
- Supabase RLS policies are included in the migration file to scope data per-user.
- CoinGecko is used for price data only; rate limiting may apply.

## File map (key files)

- `src/components/Dashboard.tsx` – main app shell, Quick Swap modal
- `src/components/Watchlist.tsx` – add by symbol/name, shows price, logo
- `src/hooks/useTokenPrices.ts` – price loader/refresh, symbol resolver
- `src/context/AuthContext.tsx` – user/profile context
- `supabase/migrations/*` – database schema and policies
- `vercel.json` – SPA rewrites + immutable asset caching
