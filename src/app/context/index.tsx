// app/context/FilterContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type FilterType = {
  transactionType: "comprar" | "alugar";
  location: string;
  dataInicio: string;
  dataFim: string;
  quartos: number | "";
  andares: number | "";
  vagas: number | "";
  banheiros: number | "";
  cep: string;
  areaMin: string;
  areaMax: string;
  endereco: string;
  bairro: string;
  uf: string;
  garagem: number | "";
  lavabo: number | "";
  fachada: string;
  mobilia: number | "";
  valorMin: string;
  valorMax: string;
  propertyType?: "apartment" | "house" | "all";
};

interface FilterContextType {
  filters: FilterType;
  setFilters: (filters: FilterType) => void;
  activeFiltersCount: number;
  resetFilters: () => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FilterType>({
    transactionType: "alugar",
    location: "",
    dataInicio: "",
    dataFim: "",
    quartos: "",
    andares: "",
    vagas: "",
    banheiros: "",
    cep: "",
    areaMin: "",
    areaMax: "",
    endereco: "",
    bairro: "",
    uf: "",
    garagem: "",
    lavabo: "",
    fachada: "",
    mobilia: "",
    valorMin: "",
    valorMax: "",
    propertyType: "all",
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== "" && 
    v !== "alugar" && 
    v !== "comprar" &&
    v !== "all" &&
    v !== filters.location
  ).length;

  const resetFilters = () => {
    setFilters({
      transactionType: "alugar",
      location: "",
      dataInicio: "",
      dataFim: "",
      quartos: "",
      andares: "",
      vagas: "",
      banheiros: "",
      cep: "",
      areaMin: "",
      areaMax: "",
      endereco: "",
      bairro: "",
      uf: "",
      garagem: "",
      lavabo: "",
      fachada: "",
      mobilia: "",
      valorMin: "",
      valorMax: "",
      propertyType: "all",
    });
  };

  return (
    <FilterContext.Provider value={{ 
      filters, 
      setFilters, 
      activeFiltersCount, 
      resetFilters,
      isFilterOpen,
      setIsFilterOpen
    }}>
      {children}
    </FilterContext.Provider>
  );
};