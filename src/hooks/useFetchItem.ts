/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useFetchItem.ts
import { useState, useEffect } from 'react';

interface UseFetchItemProps {
  resource: string;
  id?: string;
  enabled?: boolean;
}

// hooks/useFetchItem.ts - adicione logs
export function useFetchItem({ resource, id, enabled = true }: UseFetchItemProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🌐 Buscando ${resource}/${id}...`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/${resource}/${id}`);
        
        console.log(`📨 Resposta status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ Dados recebidos de ${resource}:`, result);
        
        setData(result);
      } catch (err: any) {
        console.error('❌ Erro ao buscar dados:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resource, id, enabled]);

  return { data, loading, error };
}