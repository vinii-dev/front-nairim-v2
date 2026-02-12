/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/layout/DashboardLayout";
import { MetricResponse } from "@/types/types";

type FilterType = "financial" | "portfolio" | "clients" | "map";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterType>("financial");
  
  const [metrics, setMetrics] = useState<Record<FilterType, MetricResponse | any[] | null>>({
    financial: null,
    portfolio: null,
    clients: null,
    map: null
  });
  
  const [loading, setLoading] = useState<Record<FilterType, boolean>>({
    financial: false,
    portfolio: false,
    clients: false,
    map: false
  });
  
  const [error, setError] = useState<string | null>(null);

  const getDateRange = useCallback(() => {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const start = startDate || formatDate(firstDayOfMonth);
    const end = endDate || formatDate(lastDayOfMonth);

    return { start, end };
  }, [searchParams]);

  const fetchSection = useCallback(async (section: FilterType) => {
    setLoading(prev => ({ ...prev, [section]: true }));
    setError(null);

    try {
      const { start, end } = getDateRange();
      const baseUrl = process.env.NEXT_PUBLIC_URL_API;
      if (!baseUrl) throw new Error("NEXT_PUBLIC_URL_API não configurada");

      let endpoint = "";
      switch (section) {
        case "financial":
          endpoint = "/dashboard/financial";
          break;
        case "portfolio":
          endpoint = "/dashboard/portfolio";
          break;
        case "clients":
          endpoint = "/dashboard/clients";
          break;
        case "map":
          endpoint = "/dashboard/map";
          break;
      }

      const res = await fetch(
        `${baseUrl}${endpoint}?startDate=${start}&endDate=${end}`,
        {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );

      if (!res.ok) throw new Error(`Erro ao carregar ${section}: ${res.status}`);

      const response = await res.json();
      
      if (!response.success) {
        throw new Error(response.message || `Erro na resposta da API para ${section}`);
      }

      const apiData = response.data;
      
      let processedData = apiData;

      if (section === "map") {
        const coordsRaw = apiData.coordinates || (Array.isArray(apiData) ? apiData : []);
        processedData = coordsRaw.map((g: any) => ({
          lat: Number(g.lat ?? 0),
          lng: Number(g.lng ?? 0),
          info: String(g.info ?? ""),
        }));
      }

      setMetrics(prev => ({
        ...prev,
        [section]: processedData
      }));

    } catch (err: any) {
      console.error(`Erro ao carregar ${section}:`, err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchSection("financial");
  }, []);

  useEffect(() => {
    fetchSection(filter);
  }, [filter]);

  useEffect(() => {
    fetchSection(filter);
  }, [searchParams]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (metrics.financial) {
      setInitialLoad(false);
    }
  }, [metrics.financial]);

  if (initialLoad && loading.financial) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    );
  }

  if (error && !metrics[filter]) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => fetchSection(filter)}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout
      filter={filter}
      onFilterChange={handleFilterChange}
      metrics={metrics}
      isLoading={loading[filter]}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}