const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export interface CreateSwapRequest {
  depositCoin: string;
  settleCoin: string;
  depositAmount?: string;
  settleAmount?: string;
  affiliateId?: string;
}

export interface SwapOrder {
  id: string;
  type: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount?: string;
  settleAmount?: string;
  depositAddress?: string;
  settleAddress?: string;
  status: 'waiting' | 'depositing' | 'confirming' | 'swapping' | 'settling' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  depositCoin: string;
  settleCoin: string;
  depositAmount?: string;
  settleAmount?: string;
  rate: string;
  fee: string;
  depositMin?: string;
  depositMax?: string;
}

export interface TradingPair {
  depositCoin: string;
  settleCoin: string;
  depositMin?: string;
  depositMax?: string;
  rate?: string;
}

export async function createSwap(params: CreateSwapRequest): Promise<SwapOrder> {
  const response = await fetch(`${API_BASE}/create-swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create swap');
  }

  return response.json();
}

export async function getSwapStatus(orderId: string): Promise<SwapOrder> {
  const response = await fetch(`${API_BASE}/get-swap-status?orderId=${encodeURIComponent(orderId)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get swap status');
  }

  return response.json();
}

export async function getQuote(
  depositCoin: string,
  settleCoin: string,
  depositAmount?: string,
  settleAmount?: string,
  type: 'fixed' | 'variable' = 'fixed'
): Promise<Quote> {
  const params = new URLSearchParams({
    depositCoin,
    settleCoin,
    type,
  });
  if (depositAmount) params.append('depositAmount', depositAmount);
  if (settleAmount) params.append('settleAmount', settleAmount);

  const response = await fetch(`${API_BASE}/get-quote?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get quote');
  }

  return response.json();
}

export async function getPairs(depositCoin?: string, settleCoin?: string): Promise<TradingPair[]> {
  const params = new URLSearchParams();
  if (depositCoin) params.append('depositCoin', depositCoin);
  if (settleCoin) params.append('settleCoin', settleCoin);

  const response = await fetch(`${API_BASE}/get-pairs?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get pairs');
  }

  return response.json();
}

