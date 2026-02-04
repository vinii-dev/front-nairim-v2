"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { propertyService } from "@/lib/api";
import { useRouter } from "next/navigation";

// Interface unificada para todos os imóveis
interface ImovelUnificado {
  id: string;
  nome: string;
  local: string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  area: number;
  mobilia: boolean;
  status: string;
  imagem?: string;
  cidade: string;
  tipo: "casa" | "apartamento";
  andar?: number;
  condominio?: boolean;
}

type FilterType = {
  searchTerm: string;
  propertyType: "todos" | "casa" | "apartamento";
  quartos: number | "";
  banheiros: number | "";
  vagas: number | "";
  areaMin: number | "";
  areaMax: number | "";
  valorMin: number | "";
  valorMax: number | "";
  cidade: string;
  bairro: string;
  uf: string;
  mobilia: boolean | "";
  status: "todos" | "AVAILABLE" | "RENTED" | "SOLD";
};

// Componente para exibir cada card de imóvel
function ImovelCard({ imovel, onVerDetalhes }: { 
  imovel: ImovelUnificado; 
  onVerDetalhes: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden">
        {imovel.imagem ? (
          <Image 
            src={imovel.imagem} 
            alt={imovel.nome}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${
            imovel.tipo === "casa" 
              ? "bg-gradient-to-r from-purple-100 to-blue-100" 
              : "bg-gradient-to-r from-blue-100 to-purple-100"
          }`}>
            <Icon 
              icon={imovel.tipo === "casa" ? "mingcute:home-2-line" : "mingcute:building-2-line"} 
              className="w-16 h-16 text-purple-300" 
            />
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 text-white text-xs rounded-full font-medium ${
            imovel.tipo === "casa" ? "bg-green-600" : "bg-blue-600"
          }`}>
            {imovel.tipo === "casa" ? "Casa" : "Apartamento"}
          </span>
        </div>
        
        {/* Badge de status */}
        <div className="absolute top-3 right-3">
          {imovel.status === "AVAILABLE" ? (
            <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
              Disponível
            </span>
          ) : imovel.status === "RENTED" ? (
            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
              Alugado
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full font-medium">
              {imovel.status}
            </span>
          )}
        </div>
        
        {imovel.tipo === "apartamento" && imovel.condominio && (
          <span className="absolute bottom-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
            Condomínio
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Nome e Localização */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{imovel.nome}</h3>
          <div className="flex items-start gap-2 text-gray-600">
            <Icon icon="mingcute:map-pin-line" className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm line-clamp-2">{imovel.local}</span>
          </div>
        </div>

        {/* Preço */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900">
              R$ {imovel.preco.toLocaleString('pt-BR')}
            </span>
            <span className="text-gray-500">/mês</span>
          </div>
          <div className="mt-2 flex gap-2">
            {imovel.mobilia ? (
              <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                <Icon icon="mingcute:sofa-line" className="w-4 h-4 mr-1" />
                Mobiliado
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                <Icon icon="mingcute:sofa-line" className="w-4 h-4 mr-1" />
                Não mobiliado
              </span>
            )}
            {imovel.tipo === "apartamento" && imovel.andar !== undefined && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                <Icon icon="mingcute:building-line" className="w-4 h-4 mr-1" />
                {imovel.andar}º andar
              </span>
            )}
          </div>
        </div>

        {/* Ícones de Características */}
        <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-4">
          <div className="flex flex-col items-center">
            <div className="p-2 bg-purple-50 rounded-lg mb-2">
              <Icon icon="mingcute:bed-line" className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">{imovel.quartos}</span>
            <span className="text-xs text-gray-500">Quartos</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-2 bg-blue-50 rounded-lg mb-2">
              <Icon icon="mingcute:shower-line" className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">{imovel.banheiros}</span>
            <span className="text-xs text-gray-500">Banheiros</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-2 bg-green-50 rounded-lg mb-2">
              <Icon icon="mingcute:car-line" className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">{imovel.vagas}</span>
            <span className="text-xs text-gray-500">Vagas</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-2 bg-yellow-50 rounded-lg mb-2">
              <Icon icon="mingcute:ruler-line" className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-800">{imovel.area}m²</span>
            <span className="text-xs text-gray-500">Área</span>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-auto">
          <button 
            onClick={() => onVerDetalhes(imovel.id)}
            className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-lg font-medium hover:from-purple-800 hover:to-purple-950 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={imovel.status !== "AVAILABLE"}
          >
            {imovel.status === "AVAILABLE" ? (
              <>
                <Icon icon="mingcute:eye-line" className="w-5 h-5" />
                Ver Detalhes
              </>
            ) : (
              "Indisponível"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImoveisLocacao() {
  const [imoveis, setImoveis] = useState<ImovelUnificado[]>([]);
  const [filteredImoveis, setFilteredImoveis] = useState<ImovelUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNoResults, setShowNoResults] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("valores");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  
  const itemsPerPage = 8;

  const [filters, setFilters] = useState<FilterType>({
    searchTerm: "",
    propertyType: "todos",
    quartos: "",
    banheiros: "",
    vagas: "",
    areaMin: "",
    areaMax: "",
    valorMin: "",
    valorMax: "",
    cidade: "",
    bairro: "",
    uf: "",
    mobilia: "",
    status: "todos",
  });

  // Detectar tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Buscar todas as propriedades
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Buscando todas as propriedades...");
      
      const response = await propertyService.getAllProperties({
        page: 1,
        limit: 100, // Buscar mais para ter uma boa base
        status: "AVAILABLE",
      });
      
      console.log("Resposta da API:", response);
      
      let propertiesArray: any[] = [];
      
      if (Array.isArray(response)) {
        propertiesArray = response;
      } else if (response && Array.isArray(response.data)) {
        propertiesArray = response.data;
      } else if (response && response.data && typeof response.data === 'object') {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            propertiesArray = response.data[key];
            console.log(`Encontrado array na chave: ${key}`, propertiesArray);
            break;
          }
        }
      }
      
      // Se ainda não encontrou um array, tenta usar a resposta diretamente
      if (!Array.isArray(propertiesArray) || propertiesArray.length === 0) {
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          propertiesArray = [response];
        } else if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          propertiesArray = [response.data];
        }
      }
      
      // Verifica se há dados
      if (!Array.isArray(propertiesArray) || propertiesArray.length === 0) {
        console.warn("Nenhuma propriedade encontrada");
        setImoveis([]);
        setFilteredImoveis([]);
        setShowNoResults(true);
        return;
      }
      
      // Mapear para o formato unificado
      const mappedProperties = propertiesArray.map((property: any): ImovelUnificado => {
        // Determinar tipo
        let tipo: "casa" | "apartamento" = "casa";
        if (property.type?.description?.toLowerCase().includes("apartamento") || 
            property.property_type?.toLowerCase().includes("apartamento") ||
            (property.title && property.title.toLowerCase().includes("apartamento"))) {
          tipo = "apartamento";
        }
        
        // Imagem
        let imagem = tipo === "casa" ? "/CasasLocacao.jpg" : "/ApartamentoLocacao.jpg";
        if (property.documents && Array.isArray(property.documents) && property.documents.length > 0) {
          const imageDoc = property.documents.find((doc: any) => 
            (doc.type === 'IMAGE' || (doc.filename && doc.filename.match(/\.(jpg|jpeg|png|webp)$/i)))
          );
          if (imageDoc && imageDoc.url) {
            imagem = imageDoc.url;
          }
        }
        
        // Valores
        let rentalValue = 0;
        let propertyStatus = "AVAILABLE";
        
        if (property.values) {
          rentalValue = property.values.rental_value || 0;
          propertyStatus = property.values.status || "AVAILABLE";
        } else if (property.rental_value !== undefined) {
          rentalValue = property.rental_value;
        }
        
        // Endereço
        let street = "", number = "", district = "", city = "", state = "";
        if (property.address) {
          street = property.address.street || "";
          number = property.address.number || "";
          district = property.address.district || "";
          city = property.address.city || "";
          state = property.address.state || "";
        }
        
        // Propriedades base
        const baseImovel: any = {
          id: property.id || `prop-${Math.random()}`,
          nome: property.title || property.name || "Sem título",
          local: `${street}, ${number} - ${district}, ${city} - ${state}`,
          preco: rentalValue,
          quartos: property.bedrooms || 1,
          banheiros: (property.bathrooms || 0) + (property.half_bathrooms || 0),
          vagas: property.garage_spaces || 0,
          area: property.area_total || property.area_built || property.area || 0,
          mobilia: property.furnished || false,
          status: propertyStatus,
          imagem: imagem,
          cidade: city || "Não informada",
          tipo: tipo,
        };
        
        // Adicionar propriedades específicas para apartamento
        if (tipo === "apartamento") {
          baseImovel.andar = property.floor_number || 0;
          baseImovel.condominio = property.values?.condo_fee > 0 || Boolean(property.condominio);
        }
        
        return baseImovel as ImovelUnificado;
      });
      
      console.log("Imóveis mapeados:", mappedProperties);
      
      setImoveis(mappedProperties);
      setFilteredImoveis(mappedProperties);
      setTotalPages(Math.ceil(mappedProperties.length / itemsPerPage));
      setShowNoResults(mappedProperties.length === 0);
    } catch (err) {
      console.error("Erro ao buscar propriedades:", err);
      setError(err instanceof Error ? err.message : "Erro ao conectar com a API");
      
      // Dados de exemplo
      const exampleImoveis: ImovelUnificado[] = [
        { id: "1", nome: "Casa Moderna Alphaville", local: "Alphaville, Barueri", preco: 8500, quartos: 4, banheiros: 5, vagas: 3, area: 350, mobilia: true, status: "AVAILABLE", cidade: "Barueri", tipo: "casa" },
        { id: "2", nome: "Sobrado Familiar", local: "Morumbi, São Paulo", preco: 12000, quartos: 5, banheiros: 6, vagas: 4, area: 450, mobilia: false, status: "AVAILABLE", cidade: "São Paulo", tipo: "casa" },
        { id: "3", nome: "Apartamento Moderno", local: "Alphaville, Barueri", preco: 4500, quartos: 3, banheiros: 2, vagas: 2, area: 120, mobilia: true, status: "AVAILABLE", cidade: "Barueri", tipo: "apartamento", andar: 12, condominio: true },
        { id: "4", nome: "Apartamento Alto Padrão", local: "Morumbi, São Paulo", preco: 6800, quartos: 4, banheiros: 3, vagas: 3, area: 180, mobilia: false, status: "AVAILABLE", cidade: "São Paulo", tipo: "apartamento", andar: 8, condominio: true },
        { id: "5", nome: "Casa Com Piscina", local: "Moema, São Paulo", preco: 9500, quartos: 3, banheiros: 4, vagas: 2, area: 280, mobilia: true, status: "AVAILABLE", cidade: "São Paulo", tipo: "casa" },
        { id: "6", nome: "Apartamento com Vista", local: "Moema, São Paulo", preco: 5200, quartos: 2, banheiros: 2, vagas: 1, area: 85, mobilia: true, status: "AVAILABLE", cidade: "São Paulo", tipo: "apartamento", andar: 15, condominio: false },
        { id: "7", nome: "Casa de Condomínio", local: "Jardins, São Paulo", preco: 15000, quartos: 6, banheiros: 7, vagas: 4, area: 520, mobilia: true, status: "AVAILABLE", cidade: "São Paulo", tipo: "casa" },
        { id: "8", nome: "Apartamento Duplex", local: "Brooklin, São Paulo", preco: 8500, quartos: 3, banheiros: 3, vagas: 2, area: 140, mobilia: false, status: "AVAILABLE", cidade: "São Paulo", tipo: "apartamento", andar: 7, condominio: true },
      ];
      
      setImoveis(exampleImoveis);
      setFilteredImoveis(exampleImoveis);
      setTotalPages(Math.ceil(exampleImoveis.length / itemsPerPage));
      setShowNoResults(false);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = (customFilters?: FilterType) => {
    const activeFilters = customFilters || filters;
    
    const filtered = imoveis.filter(imovel => {
      // Filtro por termo de busca (nome)
      if (activeFilters.searchTerm && !imovel.nome.toLowerCase().includes(activeFilters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por tipo de propriedade
      if (activeFilters.propertyType !== "todos" && imovel.tipo !== activeFilters.propertyType) {
        return false;
      }
      
      // Filtro por quartos
      if (activeFilters.quartos !== "" && imovel.quartos < Number(activeFilters.quartos)) {
        return false;
      }
      
      // Filtro por banheiros
      if (activeFilters.banheiros !== "" && imovel.banheiros < Number(activeFilters.banheiros)) {
        return false;
      }
      
      // Filtro por vagas
      if (activeFilters.vagas !== "" && imovel.vagas < Number(activeFilters.vagas)) {
        return false;
      }
      
      // Filtro por área
      if (activeFilters.areaMin !== "" && imovel.area < Number(activeFilters.areaMin)) {
        return false;
      }
      if (activeFilters.areaMax !== "" && imovel.area > Number(activeFilters.areaMax)) {
        return false;
      }
      
      // Filtro por valor
      if (activeFilters.valorMin !== "" && imovel.preco < Number(activeFilters.valorMin)) {
        return false;
      }
      if (activeFilters.valorMax !== "" && imovel.preco > Number(activeFilters.valorMax)) {
        return false;
      }
      
      // Filtro por cidade
      if (activeFilters.cidade && !imovel.cidade.toLowerCase().includes(activeFilters.cidade.toLowerCase())) {
        return false;
      }
      
      // Filtro por bairro (procurar no local)
      if (activeFilters.bairro && !imovel.local.toLowerCase().includes(activeFilters.bairro.toLowerCase())) {
        return false;
      }
      
      // Filtro por UF (procurar no local)
      if (activeFilters.uf && !imovel.local.includes(activeFilters.uf)) {
        return false;
      }
      
      // Filtro por mobília
      if (activeFilters.mobilia !== "" && imovel.mobilia !== Boolean(activeFilters.mobilia)) {
        return false;
      }
      
      // Filtro por status
      if (activeFilters.status !== "todos" && imovel.status !== activeFilters.status) {
        return false;
      }
      
      return true;
    });
    
    setFilteredImoveis(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Resetar para primeira página
    setShowNoResults(filtered.length === 0);
  };

  const handleFilterChange = (field: keyof FilterType, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterType = {
      searchTerm: "",
      propertyType: "todos",
      quartos: "",
      banheiros: "",
      vagas: "",
      areaMin: "",
      areaMax: "",
      valorMin: "",
      valorMax: "",
      cidade: "",
      bairro: "",
      uf: "",
      mobilia: "",
      status: "todos",
    };
    
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  };

  const aplicarFiltros = () => {
    applyFilters();
    setIsFilterOpen(false);
  };

  // Buscar dados iniciais
  useEffect(() => {
    fetchProperties();
  }, []);

  // Paginar resultados
  const paginatedImoveis = filteredImoveis.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Função para ver detalhes
  const handleVerDetalhes = (imovelId: string) => {
    router.push(`/imoveis/${imovelId}`);
  };

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const estadosBrasileiros = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'propertyType' && value === 'todos') return false;
    if (key === 'status' && value === 'todos') return false;
    if (key === 'mobilia' && value === '') return false;
    if (value === '' || value === null || value === undefined) return false;
    if (key === 'searchTerm' && value === '') return false;
    return true;
  }).length;

  // Loading skeleton
  if (loading && imoveis.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Imóveis para Locação</h1>
            <p className="text-gray-600">Encontre a casa ou apartamento perfeito</p>
          </div>
          
          {/* Skeleton do Filtro */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 animate-pulse">
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-6"></div>
                  <div className="h-8 bg-gray-300 rounded mb-6"></div>
                  <div className="grid grid-cols-4 gap-4 py-4 mb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Imóveis para Locação</h1>
          <p className="text-gray-600 mb-6">Encontre a casa ou apartamento perfeito</p>
          
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <Icon icon="mingcute:warning-line" className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">⚠️ Atenção</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs mt-1">Mostrando dados de exemplo enquanto a API não está disponível.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Botão para recarregar */}
          <div className="mb-4 flex gap-4">
            <button
              onClick={() => fetchProperties()}
              disabled={loading}
              className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon icon="mingcute:refresh-line" className="w-4 h-4" />
              {loading ? "Carregando..." : "Recarregar Dados"}
            </button>
          </div>
        </div>

        {/* Filtro Unificado (Barra de Pesquisa Principal) */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Toggle Tipo de Imóvel */}
            <div className="flex w-full md:w-auto border rounded-lg overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => handleFilterChange("propertyType", "todos")}
                className={`flex-1 md:flex-none px-4 py-3 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  filters.propertyType === "todos"
                    ? "bg-purple-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon icon="mingcute:home-2-line" className="w-4 h-4" />
                <span className="text-sm md:text-base">Todos</span>
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("propertyType", "casa")}
                className={`flex-1 md:flex-none px-4 py-3 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  filters.propertyType === "casa"
                    ? "bg-purple-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon icon="mingcute:home-1-line" className="w-4 h-4" />
                <span className="text-sm md:text-base">Casas</span>
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("propertyType", "apartamento")}
                className={`flex-1 md:flex-none px-4 py-3 font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  filters.propertyType === "apartamento"
                    ? "bg-purple-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon icon="mingcute:building-2-line" className="w-4 h-4" />
                <span className="text-sm md:text-base">Aptos</span>
              </button>
            </div>

            {/* Campo de Busca por Nome */}
            <div className="w-full md:flex-1">
              <div className="relative">
                <Icon
                  icon="mingcute:search-line"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5"
                />
                <input
                  id="search-input"
                  name="search"
                  type="text"
                  placeholder="Buscar imóvel pelo nome..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm text-gray-400 focus:text-black md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  aria-label="Buscar imóveis por nome"
                />
              </div>
            </div>

            {/* Botão de Filtro */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="w-full md:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shrink-0"
              aria-label={`Abrir filtros avançados (${activeFiltersCount} filtros ativos)`}
              aria-expanded={isFilterOpen}
            >
              <Icon icon="mingcute:filter-line" className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-purple-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Botão de Limpar Filtros */}
            <button
              type="button"
              onClick={resetFilters}
              className="w-full md:w-auto px-4 py-2.5 md:px-6 md:py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shrink-0"
              aria-label="Limpar todos os filtros"
            >
              <Icon icon="mingcute:refresh-line" className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Limpar</span>
            </button>
          </div>

          {/* Filtros Rápidos Visíveis */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Nome: {filters.searchTerm}
                <button
                  onClick={() => handleFilterChange("searchTerm", "")}
                  className="ml-2 text-purple-500 hover:text-purple-700"
                >
                  <Icon icon="mingcute:close-line" className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.propertyType !== "todos" && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Tipo: {filters.propertyType === "casa" ? "Casa" : "Apartamento"}
                <button
                  onClick={() => handleFilterChange("propertyType", "todos")}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <Icon icon="mingcute:close-line" className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.quartos !== "" && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Quartos: {filters.quartos}+
                <button
                  onClick={() => handleFilterChange("quartos", "")}
                  className="ml-2 text-green-500 hover:text-green-700"
                >
                  <Icon icon="mingcute:close-line" className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.valorMin !== "" && filters.valorMax !== "" && (
              <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                Valor: R$ {Number(filters.valorMin).toLocaleString('pt-BR')} - R$ {Number(filters.valorMax).toLocaleString('pt-BR')}
                <button
                  onClick={() => {
                    handleFilterChange("valorMin", "");
                    handleFilterChange("valorMax", "");
                  }}
                  className="ml-2 text-yellow-500 hover:text-yellow-700"
                >
                  <Icon icon="mingcute:close-line" className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            {filteredImoveis.length > 0 
              ? `${filteredImoveis.length} imóveis encontrados` 
              : 'Nenhum imóvel encontrado'}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </p>
          )}
        </div>

        {/* Pop-up de nenhum resultado */}
        {showNoResults && filteredImoveis.length === 0 && !loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNoResults(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <Icon 
                  icon="mingcute:home-search-line" 
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Nenhum imóvel encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Não encontramos imóveis com os critérios de busca informados.
                  Tente ajustar os filtros ou buscar por outro nome.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowNoResults(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setShowNoResults(false);
                      resetFilters();
                    }}
                    className="px-6 py-3 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Filtros Avançados */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Painel de Filtros */}
            <div className={`fixed ${
              isMobile 
                ? "bottom-0 left-0 right-0 max-h-[85vh]" 
                : "inset-y-0 right-0 w-full max-w-md"
            } bg-white ${isMobile ? "rounded-t-2xl" : ""} shadow-2xl overflow-hidden flex flex-col`}>
              
              {/* Cabeçalho */}
              <div className={`${isMobile ? 'p-4' : 'p-6'} bg-white border-b border-gray-200`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    Filtros Avançados
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Fechar filtros"
                  >
                    <Icon icon="mingcute:close-line" className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-purple-900 transition-colors flex items-center gap-2"
                  >
                    <Icon icon="mingcute:refresh-line" className="w-4 h-4" />
                    Limpar todos
                  </button>
                  <button
                    type="button"
                    onClick={aplicarFiltros}
                    className="ml-auto px-6 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors flex items-center gap-2"
                  >
                    <Icon icon="mingcute:check-line" className="w-4 h-4" />
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Menu de seções (mobile) */}
              {isMobile && (
                <div className="border-b border-gray-200 overflow-x-auto">
                  <div className="flex px-4">
                    {[
                      { id: "valores", label: "Valores", icon: "mingcute:coin-line" },
                      { id: "caracteristicas", label: "Características", icon: "mingcute:home-2-line" },
                      { id: "localizacao", label: "Localização", icon: "mingcute:map-pin-line" },
                    ].map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={`flex flex-col items-center px-3 py-2 min-w-[80px] transition-colors ${
                          activeSection === section.id
                            ? "text-purple-900 border-b-2 border-purple-900"
                            : "text-gray-500"
                        }`}
                      >
                        <Icon icon={section.icon} className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">{section.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conteúdo dos Filtros */}
              <div className="flex-1 overflow-y-auto">
                {isMobile ? (
                  // Versão Mobile
                  <div className="p-4">
                    {activeSection === "valores" && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Valores (R$)</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Mínimo
                            </label>
                            <input
                              type="number"
                              placeholder="0,00"
                              value={filters.valorMin || ""}
                              onChange={(e) => handleFilterChange("valorMin", e.target.value || "")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Máximo
                            </label>
                            <input
                              type="number"
                              placeholder="0,00"
                              value={filters.valorMax || ""}
                              onChange={(e) => handleFilterChange("valorMax", e.target.value || "")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "caracteristicas" && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Características</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quartos
                            </label>
                            <select
                              value={filters.quartos || ""}
                              onChange={(e) => handleFilterChange("quartos", e.target.value || "")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                              <option value="">Qualquer</option>
                              <option value="1">1+ quarto</option>
                              <option value="2">2+ quartos</option>
                              <option value="3">3+ quartos</option>
                              <option value="4">4+ quartos</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Banheiros
                            </label>
                            <select
                              value={filters.banheiros || ""}
                              onChange={(e) => handleFilterChange("banheiros", e.target.value || "")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                              <option value="">Qualquer</option>
                              <option value="1">1+ banheiro</option>
                              <option value="2">2+ banheiros</option>
                              <option value="3">3+ banheiros</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Vagas
                            </label>
                            <select
                              value={filters.vagas || ""}
                              onChange={(e) => handleFilterChange("vagas", e.target.value || "")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                              <option value="">Qualquer</option>
                              <option value="1">1+ vaga</option>
                              <option value="2">2+ vagas</option>
                              <option value="3">3+ vagas</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Área mínima (m²)
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              value={filters.areaMin || ""}
                              onChange={(e) => handleFilterChange("areaMin", e.target.value || "")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Mobília
                            </label>
                            <select
                              value={filters.mobilia === "" ? "" : filters.mobilia ? "true" : "false"}
                              onChange={(e) => handleFilterChange("mobilia", e.target.value === "" ? "" : e.target.value === "true")}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                              <option value="">Qualquer</option>
                              <option value="true">Com mobília</option>
                              <option value="false">Sem mobília</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={filters.status}
                              onChange={(e) => handleFilterChange("status", e.target.value as FilterType["status"])}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                              <option value="todos">Todos</option>
                              <option value="AVAILABLE">Disponível</option>
                              <option value="RENTED">Alugado</option>
                              <option value="SOLD">Vendido</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "localizacao" && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Localização</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Cidade
                            </label>
                            <input
                              type="text"
                              placeholder="Nome da cidade"
                              value={filters.cidade}
                              onChange={(e) => handleFilterChange("cidade", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Bairro
                            </label>
                            <input
                              type="text"
                              placeholder="Nome do bairro"
                              value={filters.bairro}
                              onChange={(e) => handleFilterChange("bairro", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Estado (UF)
                            </label>
                            <select
                              value={filters.uf}
                              onChange={(e) => handleFilterChange("uf", e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                              <option value="">Todos os estados</option>
                              {estadosBrasileiros.map((uf) => (
                                <option key={uf} value={uf}>
                                  {uf}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Versão Desktop
                  <div className="p-6 space-y-8">
                    {/* Valores */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Icon icon="mingcute:coin-line" className="w-5 h-5" />
                        Valores (R$)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor mínimo
                          </label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={filters.valorMin || ""}
                            onChange={(e) => handleFilterChange("valorMin", e.target.value || "")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor máximo
                          </label>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={filters.valorMax || ""}
                            onChange={(e) => handleFilterChange("valorMax", e.target.value || "")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Características */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Icon icon="mingcute:home-2-line" className="w-5 h-5" />
                        Características
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quartos
                          </label>
                          <select
                            value={filters.quartos || ""}
                            onChange={(e) => handleFilterChange("quartos", e.target.value || "")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          >
                            <option value="">Qualquer</option>
                            <option value="1">1+ quarto</option>
                            <option value="2">2+ quartos</option>
                            <option value="3">3+ quartos</option>
                            <option value="4">4+ quartos</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banheiros
                          </label>
                          <select
                            value={filters.banheiros || ""}
                            onChange={(e) => handleFilterChange("banheiros", e.target.value || "")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          >
                            <option value="">Qualquer</option>
                            <option value="1">1+ banheiro</option>
                            <option value="2">2+ banheiros</option>
                            <option value="3">3+ banheiros</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vagas
                          </label>
                          <select
                            value={filters.vagas || ""}
                            onChange={(e) => handleFilterChange("vagas", e.target.value || "")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          >
                            <option value="">Qualquer</option>
                            <option value="1">1+ vaga</option>
                            <option value="2">2+ vagas</option>
                            <option value="3">3+ vagas</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Área mínima (m²)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={filters.areaMin || ""}
                            onChange={(e) => handleFilterChange("areaMin", e.target.value || "")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Área máxima (m²)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={filters.areaMax || ""}
                            onChange={(e) => handleFilterChange("areaMax", e.target.value || "")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobília
                          </label>
                          <select
                            value={filters.mobilia === "" ? "" : filters.mobilia ? "true" : "false"}
                            onChange={(e) => handleFilterChange("mobilia", e.target.value === "" ? "" : e.target.value === "true")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          >
                            <option value="">Qualquer</option>
                            <option value="true">Com mobília</option>
                            <option value="false">Sem mobília</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange("status", e.target.value as FilterType["status"])}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          >
                            <option value="todos">Todos</option>
                            <option value="AVAILABLE">Disponível</option>
                            <option value="RENTED">Alugado</option>
                            <option value="SOLD">Vendido</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Localização */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Icon icon="mingcute:map-pin-line" className="w-5 h-5" />
                        Localização
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cidade
                          </label>
                          <input
                            type="text"
                            placeholder="Nome da cidade"
                            value={filters.cidade}
                            onChange={(e) => handleFilterChange("cidade", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bairro
                            </label>
                            <input
                              type="text"
                              placeholder="Nome do bairro"
                              value={filters.bairro}
                              onChange={(e) => handleFilterChange("bairro", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Estado (UF)
                            </label>
                            <select
                              value={filters.uf}
                              onChange={(e) => handleFilterChange("uf", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            >
                              <option value="">Todos os estados</option>
                              {estadosBrasileiros.map((uf) => (
                                <option key={uf} value={uf}>
                                  {uf}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé */}
              <div className={`${isMobile ? 'p-4' : 'p-6'} bg-white border-t border-gray-200`}>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className={`${isMobile ? 'flex-1' : 'flex-1'} px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={aplicarFiltros}
                    className={`${isMobile ? 'flex-1' : 'flex-1'} px-4 py-3 bg-purple-900 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors flex items-center justify-center gap-2`}
                  >
                    <Icon icon="mingcute:filter-line" className="w-4 h-4" />
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Imóveis */}
        {filteredImoveis.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedImoveis.map((imovel) => (
                <ImovelCard 
                  key={imovel.id} 
                  imovel={imovel}
                  onVerDetalhes={handleVerDetalhes}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Icon icon="mingcute:arrow-left-line" className="w-4 h-4" />
                  Anterior
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentPage === pageNum
                            ? 'bg-purple-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Próxima
                  <Icon icon="mingcute:arrow-right-line" className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <Icon icon="mingcute:home-2-line" className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-500 mb-6">Não há imóveis disponíveis para locação no momento.</p>
              <button
                onClick={() => fetchProperties()}
                className="px-6 py-3 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}