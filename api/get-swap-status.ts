import type { VercelRequest, VercelResponse } from '@vercel/node';

const SIDESHIFT_API_URL = 'https://api.sideshift.ai/v2';
const SIDESHIFT_API_KEY = process.env.SIDESHIFT_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SIDESHIFT_API_KEY) {
    return res.status(500).json({ error: 'SideShift API key not configured' });
  }

  try {
    const { orderId } = req.query;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const response = await fetch(`${SIDESHIFT_API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-sideshift-secret': SIDESHIFT_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || 'Failed to get swap status',
        details: data 
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error getting swap status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

