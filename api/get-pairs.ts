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
    const { depositCoin, settleCoin } = req.query;

    let url = `${SIDESHIFT_API_URL}/pairs`;
    if (depositCoin && typeof depositCoin === 'string') {
      url += `?depositCoin=${encodeURIComponent(depositCoin)}`;
      if (settleCoin && typeof settleCoin === 'string') {
        url += `&settleCoin=${encodeURIComponent(settleCoin)}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-sideshift-secret': SIDESHIFT_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || 'Failed to get trading pairs',
        details: data 
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error getting pairs:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

