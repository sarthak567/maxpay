import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Portfolio } from '../types';
import { useAuth } from '../context/AuthContext';

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  const loadPortfolio = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .order('usd_value', { ascending: false });

      if (error) throw error;

      setPortfolio(data || []);
      const total = (data || []).reduce((sum, item) => sum + Number(item.usd_value), 0);
      setTotalValue(total);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user, loadPortfolio]);

  async function updatePortfolioItem(tokenSymbol: string, balance: number, usdValue: number) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .upsert({
          user_id: user.id,
          token_symbol: tokenSymbol,
          balance,
          usd_value: usdValue,
          last_synced_at: new Date().toISOString(),
        });

      if (error) throw error;
      await loadPortfolio();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  return {
    portfolio,
    loading,
    totalValue,
    refreshPortfolio: loadPortfolio,
    updatePortfolioItem,
  };
}
