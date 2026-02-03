"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { propertyService, Property } from "@/lib/api";
import { useRouter } from "next/navigation";

interface CasaProps {
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
}

export default function CasasLocacao() {
  const [casas, setCasas] = useState<CasaProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  
  const itemsPerPage = 8;

  // Função para buscar propriedades
  const fetchProperties = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        page,
        limit: itemsPerPage,
        status: "AVAILABLE",
      };
      
      console.log("Buscando propriedades com filtros:", filters);
      
      const response = await propertyService.getAllProperties(filters);
      
      console.log("Resposta completa da API:", response);
      console.log("Tipo de response:", typeof response);
      console.log("É array?", Array.isArray(response));
      console.log("Estrutura completa:", JSON.stringify(response, null, 2));
      
      // Verifica se a resposta é um array ou se tem uma propriedade data que é um array
      let propertiesArray: any[] = [];
      
      if (Array.isArray(response)) {
        // Se a resposta já é um array
        propertiesArray = response;
      } else if (response && Array.isArray(response.data)) {
        // Se a resposta tem uma propriedade data que é array
        propertiesArray = response.data;
      } else if (response && response.data && typeof response.data === 'object') {
        // Se data é um objeto, pode ser que as propriedades estejam em uma chave diferente
        // Vamos tentar encontrar qualquer array dentro do objeto
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            propertiesArray = response.data[key];
            console.log(`Encontrado array na chave: ${key}`, propertiesArray);
            break;
          }
        }
      }
      
      console.log("Array de propriedades encontrado:", propertiesArray);
      
      // Se ainda não encontrou um array, tenta usar a resposta diretamente se for um objeto único
      if (!Array.isArray(propertiesArray) || propertiesArray.length === 0) {
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Se a resposta for um único objeto, coloca em um array
          propertiesArray = [response];
        } else if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Se data for um único objeto
          propertiesArray = [response.data];
        }
      }
      
      // Verifica se há dados
      if (!Array.isArray(propertiesArray) || propertiesArray.length === 0) {
        console.warn("Nenhuma propriedade encontrada ou formato inesperado");
        setCasas([]);
        setTotalPages(response?.totalPages || 1);
        return;
      }
      
      // Mapeia os dados da API para o formato do componente
      const mappedProperties: CasaProps[] = propertiesArray.map((property: any) => {
        // Debug da estrutura da propriedade
        console.log("Propriedade recebida:", property);
        
        // Tenta pegar a primeira imagem dos documentos
        let imagem = "/CasasLocacao.jpg";
        if (property.documents && Array.isArray(property.documents) && property.documents.length > 0) {
          const imageDoc = property.documents.find((doc: any) => 
            (doc.type === 'IMAGE' || (doc.filename && doc.filename.match(/\.(jpg|jpeg|png|webp)$/i)))
          );
          if (imageDoc && imageDoc.url) {
            imagem = imageDoc.url;
          }
        }
        
        // Tenta obter os valores da propriedade
        let rentalValue = 0;
        let propertyStatus = "UNKNOWN";
        
        if (property.values) {
          rentalValue = property.values.rental_value || 0;
          propertyStatus = property.values.status || "UNKNOWN";
        } else if (property.rental_value !== undefined) {
          rentalValue = property.rental_value;
        }
        
        // Tenta obter o endereço
        let street = "", number = "", district = "", city = "", state = "";
        if (property.address) {
          street = property.address.street || "";
          number = property.address.number || "";
          district = property.address.district || "";
          city = property.address.city || "";
          state = property.address.state || "";
        }
        
        return {
          id: property.id || `prop-${Math.random()}`,
          nome: property.title || property.name || "Sem título",
          local: `${street}, ${number} - ${district}, ${city} - ${state}`,
          preco: rentalValue,
          quartos: property.bedrooms || 0,
          banheiros: (property.bathrooms || 0) + (property.half_bathrooms || 0),
          vagas: property.garage_spaces || 0,
          area: property.area_total || property.area || 0,
          mobilia: property.furnished || false,
          status: propertyStatus,
          imagem: imagem,
          cidade: city,
        };
      });
      
      console.log("Propriedades mapeadas:", mappedProperties);
      
      setCasas(mappedProperties);
      setTotalPages(response?.totalPages || 1);
      setCurrentPage(response?.page || page);
    } catch (err) {
      console.error("Erro ao buscar propriedades:", err);
      setError(err instanceof Error ? err.message : "Erro ao conectar com a API");
      
      // Dados de exemplo em caso de erro
      setCasas([
        { id: "1", nome: "Casa Moderna Alphaville", local: "Alphaville, Barueri", preco: 8500, quartos: 4, banheiros: 5, vagas: 3, area: 350, mobilia: true, status: "AVAILABLE", cidade: "Barueri" },
        { id: "2", nome: "Sobrado Familiar", local: "Morumbi, São Paulo", preco: 12000, quartos: 5, banheiros: 6, vagas: 4, area: 450, mobilia: false, status: "AVAILABLE", cidade: "São Paulo" },
        { id: "3", nome: "Casa Com Piscina", local: "Moema, São Paulo", preco: 9500, quartos: 3, banheiros: 4, vagas: 2, area: 280, mobilia: true, status: "AVAILABLE", cidade: "São Paulo" },
        { id: "4", nome: "Casa de Condomínio", local: "Jardins, São Paulo", preco: 15000, quartos: 6, banheiros: 7, vagas: 4, area: 520, mobilia: true, status: "AVAILABLE", cidade: "São Paulo" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Busca propriedades quando o componente monta
  useEffect(() => {
    fetchProperties(1);
  }, []);

  // Função para lidar com ver detalhes
  const handleVerDetalhes = (casaId: string) => {
    router.push(`/casas/${casaId}`);
  };

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchProperties(newPage);
    }
  };

  // Loading skeleton
  if (loading && casas.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Casas para Locação</h1>
            <p className="text-gray-600">Encontre a casa perfeita para sua família</p>
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Casas para Locação</h1>
          <p className="text-gray-600 mb-6">Encontre a casa perfeita para sua família</p>
          
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
          
          {/* Botão para testar a API manualmente */}
          <div className="mb-4 flex gap-4">
            <button
              onClick={() => fetchProperties(1)}
              className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800"
            >
              Recarregar Dados
            </button>
            <button
              onClick={() => {
                // Abre o console para debug
                if (typeof window !== 'undefined') {
                  console.log("Estado atual:", { casas, loading, error, totalPages, currentPage });
                }
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Debug no Console
            </button>
          </div>
          
          {/* Contador de resultados */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {casas.length > 0 ? `${casas.length} propriedades encontradas` : 'Nenhuma propriedade encontrada'}
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </p>
            )}
          </div>
        </div>

        {/* Grid de Casas */}
        {casas.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {casas.map((casa) => (
                <div key={casa.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  {/* Imagem */}
                  <div className="relative h-48 overflow-hidden">
                    {casa.imagem ? (
                      <Image 
                        src={casa.imagem} 
                        alt={casa.nome}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        priority={false}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                        <Icon icon="mingcute:home-2-line" className="w-16 h-16 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Badge de status */}
                    <div className="absolute top-3 left-3">
                      {casa.status === "AVAILABLE" ? (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                          Disponível
                        </span>
                      ) : casa.status === "RENTED" ? (
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                          Alugado
                        </span>
                      ) : casa.status === "SOLD" ? (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                          Vendido
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full font-medium">
                          {casa.status}
                        </span>
                      )}
                    </div>
                    
                    {/* Overlay escuro */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5 flex-grow flex flex-col">
                    {/* Nome e Localização */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{casa.nome}</h3>
                      <div className="flex items-start gap-2 text-gray-600">
                        <Icon icon="mingcute:map-pin-line" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm line-clamp-2">{casa.local}</span>
                      </div>
                    </div>

                    {/* Preço */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-purple-900">
                          R$ {casa.preco.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-gray-500">/mês</span>
                      </div>
                      <div className="mt-2">
                        {casa.mobilia ? (
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
                      </div>
                    </div>

                    {/* Ícones de Características */}
                    <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-4">
                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-purple-50 rounded-lg mb-2">
                          <Icon icon="mingcute:bed-line" className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{casa.quartos}</span>
                        <span className="text-xs text-gray-500">Quartos</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-blue-50 rounded-lg mb-2">
                          <Icon icon="mingcute:shower-line" className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{casa.banheiros}</span>
                        <span className="text-xs text-gray-500">Banheiros</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-green-50 rounded-lg mb-2">
                          <Icon icon="mingcute:car-line" className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{casa.vagas}</span>
                        <span className="text-xs text-gray-500">Vagas</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-yellow-50 rounded-lg mb-2">
                          <Icon icon="mingcute:ruler-line" className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{casa.area}m²</span>
                        <span className="text-xs text-gray-500">Área</span>
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    <div className="mt-auto">
                      <button 
                        onClick={() => handleVerDetalhes(casa.id)}
                        className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-lg font-medium hover:from-purple-800 hover:to-purple-950 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={casa.status !== "AVAILABLE"}
                      >
                        {casa.status === "AVAILABLE" ? (
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
          /* Mensagem quando não há propriedades */
          !loading && (
            <div className="text-center py-12">
              <Icon icon="mingcute:home-2-line" className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Nenhuma propriedade encontrada</h3>
              <p className="text-gray-500 mb-6">A API não retornou propriedades ou o formato está diferente do esperado.</p>
              <button
                onClick={() => fetchProperties(1)}
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