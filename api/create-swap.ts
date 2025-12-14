import type { VercelRequest, VercelResponse } from '@vercel/node';

const SIDESHIFT_API_URL = 'https://api.sideshift.ai/v2';
const SIDESHIFT_API_KEY = process.env.SIDESHIFT_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SIDESHIFT_API_KEY) {
    return res.status(500).json({ error: 'SideShift API key not configured' });
  }

  try {
    const { depositCoin, settleCoin, depositAmount, settleAmount, affiliateId } = req.body;

    if (!depositCoin || !settleCoin) {
      return res.status(400).json({ error: 'depositCoin and settleCoin are required' });
    }

    const response = await fetch(`${SIDESHIFT_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sideshift-secret': SIDESHIFT_API_KEY,
      },
      body: JSON.stringify({
        type: 'fixed',
        depositCoin,
        settleCoin,
        depositAmount,
        settleAmount,
        affiliateId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || 'Failed to create swap order',
        details: data 
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating swap:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

