/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { useMessage } from "./useMessage";
import { ApiResponse, TableState } from "@/types/administrador";

export const useTableData = (initialState: TableState) => {
  const [state, setState] = useState<TableState>(initialState);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showMessage } = useMessage();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_URL_API}/users`);
      
      // Adicionar todos os parâmetros
      url.searchParams.set("page", state.page.toString());
      url.searchParams.set("limit", state.limit.toString());
      
      if (state.search) {
        url.searchParams.set("search", state.search);
      }

      // Adicionar ordenação
      Object.entries(state.sort).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      // Adicionar filtros
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.set(key, value.toString());
        }
      });

      const res = await fetch(url.toString(), { 
        cache: "no-store",
        signal: abortController.signal
      });
      
      if (!res.ok) throw new Error('Falha ao buscar dados');
      
      const result: ApiResponse = await res.json();
      
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.message || 'Erro na resposta da API');
      }
    } catch (error: any) {
      // Ignorar erro se foi abortado
      if (error.name === 'AbortError') {
        console.log('Requisição cancelada');
        return;
      }
      
      console.error('Erro ao carregar dados:', error);
      showMessage('Erro ao carregar dados', 'error');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [state.page, state.limit, state.search, state.sort, state.filters, showMessage]);

  useEffect(() => {
    fetchData();
    
    return () => {
      // Cancelar requisição ao desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const updateState = useCallback((updates: Partial<TableState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    state,
    data,
    isLoading,
    updateState,
    refreshData: fetchData
  };
};