import { useEffect, useState } from 'react';
import { getCustomersCount } from '@/services/api';

export function useCustomerCount(userId?: number) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (userId == null) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const c = await getCustomersCount(userId);
        if (mounted) setCount(c);
      } catch (e) {
        console.error('Failed to load customer count', e);
        if (mounted) setError('Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  return { count, loading, error };
}
