/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Filter, Trash2, Plus, Edit, Eye } from "lucide-react";
import { useMessageContext } from "@/contexts/MessageContext";
import { usePopupContext } from "@/contexts/PopupContext";
import SkeletonTable from "../Loading/SkeletonTable";
import DynamicFilterModal from "../DynamicFilterModal";
import SearchInput from "../SearchInput";
import SelectLimit from "../SelectLimit";
import Pagination from "../Pagination";
import TableInformations from "../TableInformations";
import { formatCurrency, formatDate, formatCPFCNPJ, formatGender, formatPhone, formatCEP } from "@/util/formatters";
import { useOptimizedTableData } from "@/hooks/useOptimizedTableData";
import { useDynamicFilters } from "@/hooks/useDynamicFilters";
import { ColumnDef } from "@/types/types";
import ModalSelectTypeOwner from "@/components/ModalSelectTypeOwner";
import { OwnerType } from "@/types/owner";
import { useRouter } from "next/navigation";

interface DynamicTableManagerProps {
  resource: string;
  title: string;
  columns: ColumnDef[];
  basePath: string;
  autoFocusSearch?: boolean;
  defaultSort?: Record<string, any>;
  defaultLimit?: number;
  enableCreate?: boolean;
  enableView?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  onRowClick?: (item: any) => void;
}

export default function DynamicTableManager({
  resource,
  title,
  columns,
  basePath,
  autoFocusSearch = true,
  defaultSort = {},
  defaultLimit = 30,
  enableCreate = true,
  enableView = true,
  enableEdit = true,
  enableDelete = true,
  onRowClick,
}: DynamicTableManagerProps) {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [showOwnerTypeModal, setShowOwnerTypeModal] = useState(false);
  const router = useRouter();
  // Referência para o container da tabela
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // Ref para armazenar a posição do scroll sem causar re-render
  const scrollPositionRef = useRef(0);
  // Flag para controlar se está restaurando o scroll (evita loop)
  const isRestoringScrollRef = useRef(false);
  // Timer para debounce
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { showMessage } = useMessageContext();
  const { showPopup } = usePopupContext();
  
  // Buscar filtros dinâmicos
  const { 
    filters: dynamicFilters, 
    searchFields,
    isLoading: isLoadingFilters 
  } = useDynamicFilters(`/${resource}/filters`, appliedFilters);
  
  // Configuração da tabela com dados
  const { 
    state, 
    data, 
    isLoading: isLoadingData, 
    updateState, 
    refreshData 
  } = useOptimizedTableData(resource, {
    page: 1,
    limit: defaultLimit,
    search: "",
    sort: defaultSort,
    filters: {}
  });

  // **CORREÇÃO: Separar colunas de dados da coluna de ações**
  const dataColumns = useMemo(() => {
    // Remover coluna de ações se existir
    return columns.filter(col => col.field !== "actions" && col.type !== "custom");
  }, [columns]);

  // Desestruturar os dados - verificar várias estruturas possíveis
  const { items, meta } = useMemo(() => {
    console.log('📊 Dados recebidos:', data);
    
    // Verificar estrutura da API
    if (!data) {
      return { items: [], meta: null };
    }
    
    // Estrutura 1: { data: [...], count, totalPages, currentPage }
    if (data.data && Array.isArray(data.data)) {
      return {
        items: data.data,
        meta: {
          page: data.currentPage || 1,
          limit: state.limit,
          total: data.count || 0,
          totalPages: data.totalPages || 1
        }
      };
    }
    
    // Estrutura 2: { items: [...], meta: {...} }
    if (data.items && Array.isArray(data.items)) {
      return {
        items: data.items,
        meta: data.meta
      };
    }
    
    // Estrutura 3: Array direto
    if (Array.isArray(data)) {
      return {
        items: data,
        meta: {
          page: 1,
          limit: state.limit,
          total: data.length,
          totalPages: 1
        }
      };
    }
    
    // Estrutura desconhecida
    console.error('❌ Estrutura de dados desconhecida:', data);
    return { items: [], meta: null };
  }, [data, state.limit]);

  // Handler para seleção do tipo de proprietário
  const handleSelectOwnerType = (tipo: OwnerType) => {
    setShowOwnerTypeModal(false);
    window.location.href = `${basePath}/cadastrar?tipo=${tipo}`;
  };

  // Função para obter valor de campo aninhado
  const getNestedValue = useCallback((obj: any, path: string) => {
    if (!obj || !path) return undefined;
    
    try {
      return path.split('.').reduce((acc, key) => {
        // Verificar se é acesso a array[0].property
        const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
        if (arrayMatch && acc) {
          const arrayKey = arrayMatch[1];
          const index = parseInt(arrayMatch[2]);
          return acc[arrayKey]?.[index];
        }
        return acc?.[key];
      }, obj);
    } catch (error) {
      console.error(`Error accessing nested path ${path}:`, error);
      return undefined;
    }
  }, []);

  // Função para formatar valor
  const formatValue = useCallback((value: any, column: ColumnDef, item: any) => {
    console.log(`🔧 Formatando valor para ${column.field}:`, { value, column, item });
    
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    if (column.formatter) {
      console.log(`🎨 Aplicando formatter ${column.formatter} para ${column.field}`);
      switch (column.formatter) {
        case 'currency':
          return formatCurrency(value);
        case 'date':
          return formatDate(value);
        case 'cpfCnpj':
          return formatCPFCNPJ(value);
        case 'gender':
          return formatGender(value);
        case 'phone':
          return formatPhone(value);
        case 'boolean':
          return value ? 'Sim' : 'Não';
        case 'cep':
          console.log(`📮 Formatando CEP: ${value}`);
          return formatCEP(value);
        default:
          return String(value);
      }
    }

    if (column.type === 'date' && value) {
      return formatDate(value);
    }

    if (column.type === 'currency' && value) {
      return formatCurrency(value);
    }

    if (column.type === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    if (column.type === 'number') {
      return Number(value).toLocaleString('pt-BR');
    }

    console.log(`📝 Retornando valor padrão para ${column.field}: ${value}`);
    return String(value);
  }, []);

  const getCellValue = useCallback((item: any, column: ColumnDef) => {
    try {
      console.log(`🔍 Obtendo valor para coluna ${column.field}:`, item);
      const isLease = resource === 'leases';
      const isProperty = resource === 'properties';
      const isAgency = resource === 'agencies';
      const isOwner = resource === 'owners';
      const isTenant = resource === 'tenants'
      const isUser = resource === 'users';

      if (isUser) {
        console.log(`👨‍💼 Processando campo para usuário: ${column.field}`);
        
        // Campos diretos do usuário
        if (['name', 'email', 'gender', 'birth_date', 'created_at'].includes(column.field)) {
          const value = item[column.field] || '';
          console.log(`📄 Campo direto ${column.field}: ${value}`);
          return formatValue(value, column, item);
        }
      }

      // **CAMPOS DE LOCAÇÕES (leases) - ESPECÍFICO**
      if (isLease) {
        console.log(`📄 Processando campo para locação: ${column.field}`);
        
        // Campos de relacionamento
        if (column.field === "property_title") {
          const value = item.property?.title || '';
          return formatValue(value, column, item);
        }
        
        if (column.field === "type") {
          const value = item.property?.type?.description || '';
          return formatValue(value, column, item);
        }
        
        if (column.field === "owner") {
          const value = item.owner?.name || '';
          return formatValue(value, column, item);
        }
        
        if (column.field === "tenant") {
          const value = item.tenant?.name || '';
          return formatValue(value, column, item);
        }
        
        // Campos de data
        if (column.field === "start_date" || column.field === "end_date") {
          const value = item[column.field];
          return formatValue(value, column, item);
        }
        
        // Campos de valor (currency)
        if (['rent_amount', 'condo_fee', 'property_tax', 'extra_charges', 'commission_amount'].includes(column.field)) {
          const value = item[column.field];
          return formatValue(value, column, item);
        }
        
        // Campos de dia (formatação especial)
        if (['rent_due_day', 'tax_due_day', 'condo_due_day'].includes(column.field)) {
          const value = item[column.field];
          if (value === null || value === undefined || value === '') {
            return '-';
          }
          return `${value}º dia`;
        }
        
        // Campos diretos
        if (['contract_number', 'created_at'].includes(column.field)) {
          const value = item[column.field];
          return formatValue(value, column, item);
        }
      }

      // **CAMPOS DE IMÓVEIS (propriedades) - ESPECÍFICO**
      if (isProperty) {
        console.log(`🏠 Processando campo para propriedade: ${column.field}`);
        
        // **TRATAMENTO ESPECÍFICO PARA CAMPOS DE ENDEREÇO DE PROPRIEDADES**
        const addressFieldMap: Record<string, string> = {
          'zip_code': 'zip_code',
          'state': 'state', 
          'city': 'city',
          'district': 'district',
          'street': 'street',
          'address': 'street',
          'cep': 'zip_code'
        };
        
        // Verificar se é um campo de endereço
        const addressField = addressFieldMap[column.field];
        if (addressField) {
          const value = item.addresses?.[0]?.address?.[addressField] || '';
          console.log(`📍 Campo de endereço ${column.field} -> ${addressField}: ${value}`);
          return formatValue(value, column, item);
        }
        
        // Campos de proprietário
        if (column.field === "owner") {
          const value = item.owner?.name || '';
          console.log(`👤 Proprietário encontrado: ${value}`);
          return formatValue(value, column, item);
        }
        
        // Campos de tipo
        if (column.field === "type") {
          const value = item.type?.description || '';
          console.log(`🏘️ Tipo de imóvel encontrado: ${value}`);
          return formatValue(value, column, item);
        }
        
        // Campos diretos da propriedade
        if (['title', 'bedrooms', 'bathrooms', 'half_bathrooms', 'garage_spaces', 
            'area_total', 'area_built', 'frontage', 'furnished', 'floor_number',
            'tax_registration', 'notes'].includes(column.field)) {
          const value = item[column.field];
          console.log(`📊 Campo direto ${column.field}: ${value}`);
          return formatValue(value, column, item);
        }
      }

      // **CAMPOS PARA INQUILINOS (tenants) E PROPRIETÁRIOS (owners)**
      if (isTenant || isOwner) {
        console.log(`👥 Processando campo para ${isTenant ? 'inquilino' : 'proprietário'}: ${column.field}`);
        
        // CAMPOS DIRETOS DE PESSOA
        const directFields = [
          'name', 'internal_code', 'occupation', 'marital_status',
          'cpf', 'cnpj', 'state_registration', 'municipal_registration'
        ];
        
        if (directFields.includes(column.field)) {
          const value = item[column.field] || '';
          console.log(`📄 ${column.label}: ${value}`);
          return formatValue(value, column, item);
        }
      }

      // **CAMPOS DE AGÊNCIA (agencies)**
      if (isAgency) {
        console.log(`🏢 Processando campo para agência: ${column.field}`);
        
        // Campos diretos da agência
        if (['trade_name', 'legal_name', 'cnpj', 'state_registration', 
            'municipal_registration', 'license_number'].includes(column.field)) {
          const value = item[column.field] || '';
          return formatValue(value, column, item);
        }
      }

      // **CAMPOS DE ENDEREÇO COMUNS A TODOS OS RECURSOS**
      const addressFieldMap: Record<string, {path: string, field: string}> = {
        'zip_code': { path: 'addresses[0].address', field: 'zip_code' },
        'state': { path: 'addresses[0].address', field: 'state' },
        'city': { path: 'addresses[0].address', field: 'city' },
        'district': { path: 'addresses[0].address', field: 'district' },
        'address': { path: 'addresses[0].address', field: 'street' },
        'street': { path: 'addresses[0].address', field: 'street' },
        'cep': { path: 'addresses[0].address', field: 'zip_code' }
      };

      if (addressFieldMap[column.field]) {
        const { path, field } = addressFieldMap[column.field];
        const value = getNestedValue(item, `${path}.${field}`) || '';
        console.log(`📍 Endereço ${column.field}: ${value}`);
        return formatValue(value, column, item);
      }

      const contactFieldMap: Record<string, {path: string, field: string}> = {
        'contact': { path: 'contacts[0].contact', field: 'contact' },
        'telephone': { path: 'contacts[0].contact', field: 'phone' },
        'phone': { path: 'contacts[0].contact', field: 'phone' },
        'cellphone': { path: 'contacts[0].contact', field: 'cellphone' },
        'email': { path: 'contacts[0].contact', field: 'email' }
      };

      if (contactFieldMap[column.field]) {
        const { path, field } = contactFieldMap[column.field];
        const value = getNestedValue(item, `${path}.${field}`) || '';
        console.log(`📞 Contato ${column.field}: ${value}`);
        return formatValue(value, column, item);
      }

      // **CAMPOS DIRETOS (FALLBACK) - COM TRATAMENTO PARA OBJETOS**
      if (column.field in item) {
        const value = item[column.field];
        
        // **TRATAMENTO ESPECIAL: Se o valor for um objeto, extrair propriedades úteis**
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          console.log(`📦 Campo ${column.field} é um objeto:`, value);
          
          // Para objetos com nome
          if (value.name) {
            return formatValue(value.name, column, item);
          }
          // Para objetos com description
          if (value.description) {
            return formatValue(value.description, column, item);
          }
          // Para objetos com title
          if (value.title) {
            return formatValue(value.title, column, item);
          }
          // Para objetos com contact
          if (value.contact) {
            return formatValue(value.contact, column, item);
          }
          // Para objetos que não temos propriedade conhecida
          console.warn(`⚠️ Objeto não tratado para campo ${column.field}:`, value);
          return '-';
        }
        
        console.log(`📄 Campo direto encontrado ${column.field}: ${value}`);
        return formatValue(value, column, item);
      }
      
      // **CAMPOS ANINHADOS GENERICOS**
      const nestedValue = getNestedValue(item, column.field);
      if (nestedValue !== undefined) {
        console.log(`🔗 Campo aninhado encontrado ${column.field}: ${nestedValue}`);
        return formatValue(nestedValue, column, item);
      }
      
      // **TRATAMENTO DE nestedField ESPECÍFICO**
      if (column.nestedField) {
        const nestedFieldValue = getNestedValue(item, column.nestedField);
        if (nestedFieldValue !== undefined) {
          console.log(`🔗 Campo nestedField encontrado ${column.nestedField}: ${nestedFieldValue}`);
          return formatValue(nestedFieldValue, column, item);
        }
      }
      
      console.log(`⚠️ Campo ${column.field} não encontrado no item`);
      return '-';
      
    } catch (error) {
      console.error(`❌ Erro ao obter valor da coluna ${column.field}:`, error);
      return '-';
    }
  }, [formatValue, getNestedValue, resource]);

  // Combinar searchFields dos filtros dinâmicos
  const searchPlaceholder = useMemo(() => {
    if (!searchFields.length) return `Pesquisar ${title.toLowerCase()}...`;
    
    const fieldsText = searchFields.map(field => {
      const filter = dynamicFilters.find(f => f.field === field);
      return filter?.label || field;
    }).join(", ");
    
    return `Pesquisar por ${fieldsText}...`;
  }, [searchFields, dynamicFilters, title]);

  // Memoize as headers APENAS para as colunas de dados
  const headers = useMemo(() => 
    dataColumns.map(col => ({
      label: col.label,
      field: col.field,
      sortParam: col.sortParam || col.field
    }))
  , [dataColumns]);

  // Função para salvar a posição do scroll com debounce
  const handleTableScroll = useCallback(() => {
    if (isRestoringScrollRef.current) return;
    
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    scrollTimerRef.current = setTimeout(() => {
      if (tableContainerRef.current) {
        scrollPositionRef.current = tableContainerRef.current.scrollLeft;
      }
    }, 50); // Debounce de 50ms
  }, []);

  // Função para restaurar a posição do scroll quando os dados são atualizados
  useEffect(() => {
    // Restaurar scroll apenas quando items mudam (não no scroll do usuário)
    if (tableContainerRef.current) {
      isRestoringScrollRef.current = true;
      tableContainerRef.current.scrollLeft = scrollPositionRef.current;
      
      // Resetar flag após um breve delay
      setTimeout(() => {
        isRestoringScrollRef.current = false;
      }, 100);
    }
  }, [items]); // Apenas quando items mudam

  // Limpar timer no unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Funções de callback
  const handleSearch = useCallback((search: string) => {
    updateState({ search, page: 1 });
  }, [updateState]);

  const handleSort = useCallback((sortParam: string) => {
    const currentOrder = state.sort[sortParam] || null;
    let nextOrder: "asc" | "desc" = "desc";
    
    if (currentOrder === "desc") nextOrder = "asc";
    else if (currentOrder === "asc") nextOrder = "desc";

    console.log(`🔄 Solicitação de ordenação: ${sortParam} -> ${nextOrder}`);
    
    updateState({ 
      sort: { [sortParam]: nextOrder },
      page: 1
    });
  }, [state.sort, updateState]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && items.length > 0) {
      setSelectedCheckboxes(items.map((item: any) => item.id));
    } else {
      setSelectedCheckboxes([]);
    }
  }, [items]);

  const handleCheckboxChange = useCallback((id: string) => {
    setSelectedCheckboxes(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (!selectedCheckboxes.length) {
      showMessage(`Selecione os ${title.toLowerCase()} que deseja excluir.`, "error");
      return;
    }
    
    showPopup(
      selectedCheckboxes.length > 1 ? `Remover ${selectedCheckboxes.length} registros` : `Remover ${title.toLowerCase()}`,
      selectedCheckboxes.length > 1 
        ? `Você selecionou ${selectedCheckboxes.length} registros. Tem certeza que deseja removê-los?`
        : `Tem certeza que deseja remover este ${title.toLowerCase()}?`,
      async () => {
        if (!selectedCheckboxes.length) return;

        try {
          let successCount = 0;
          let errorCount = 0;
          
          for (const id of selectedCheckboxes) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/${resource}/${id}`, {
                method: 'DELETE',
              });
              
              if (response.ok) {
                successCount++;
              } else {
                errorCount++;
              }
            } catch {
              errorCount++;
            }
          }
          
          if (errorCount === 0) {
            showMessage(
              selectedCheckboxes.length > 1 
                ? `${successCount} registros removidos com sucesso!`
                : "Registro removido com sucesso!",
              "success"
            );
          } else {
            showMessage(
              `${successCount} de ${selectedCheckboxes.length} registros removidos. ${errorCount} erros.`,
              "info"
            );
          }
          
          refreshData();
          setSelectedCheckboxes([]);
        } catch {
          showMessage(`Erro ao deletar ${title.toLowerCase()}(s).`, "error");
        }
      },
      () => {}
    );
  }, [selectedCheckboxes, showMessage, showPopup, refreshData, resource, title]);

  const handleApplyFilter = useCallback((filters: Record<string, any>) => {
    setAppliedFilters(filters);
    updateState({ 
      filters,
      page: 1
    });
    setFilterVisible(false);
  }, [updateState]);

  const handleClearFilters = useCallback(() => {
    setAppliedFilters({});
    updateState({ 
      filters: {},
      page: 1
    });
    setFilterVisible(false);
  }, [updateState]);

  const handlePageChange = useCallback((page: number) => {
    updateState({ page });
  }, [updateState]);

  const handleLimitChange = useCallback((limit: number) => {
    updateState({ limit, page: 1 });
  }, [updateState]);

  // Cálculos memoizados
  const tableData = useMemo(() => {
    if (!meta || !meta.total) {
      return { start: 0, end: 0, allSelected: false };
    }
    
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    const allSelected = selectedCheckboxes.length === items.length && items.length > 0;
    
    return { start, end, allSelected };
  }, [meta, selectedCheckboxes.length, items.length]);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return Object.keys(appliedFilters).length > 0;
  }, [appliedFilters]);

  // Contar filtros ativos
  const activeFilterCount = useMemo(() => {
    return Object.keys(appliedFilters).length;
  }, [appliedFilters]);


  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (filterVisible || showOwnerTypeModal)) {
        setFilterVisible(false);
        setShowOwnerTypeModal(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [filterVisible, showOwnerTypeModal]);

  // Retorno de loading
  if (isLoadingFilters || isLoadingData) {
    return <SkeletonTable />;
  }

  // Se não há items, mostrar mensagem
  if (!items || !Array.isArray(items)) {
    return (
      <div className="flex justify-center items-center my-3">
        <div className="bg-[#D9D9D9] py-4 px-6 rounded-sm flex items-center gap-3">
          <p className="text-gray-700">Erro ao carregar dados da tabela</p>
        </div>
      </div>
    );
  }

  return (
    <>

      <div className="flex justify-center gap-1 sm:justify-between items-center flex-wrap mb-1 mt-2">
        <div className="flex items-center justify-center sm:justify-start gap-5 max-w-[500px] w-full flex-wrap sm:flex-nowrap relative">
          <div className="flex items-center gap-4">
            {enableCreate && (
              resource === 'owners' || resource === 'tenants' ? (
                <div className="relative">
                  <button
                    onClick={() => setShowOwnerTypeModal(true)}
                    className="bg-[#D9D9D9] p-2 rounded hover:bg-gray-300 transition-colors relative group"
                    title={`Adicionar novo ${title.toLowerCase()}`}
                  >
                    <Plus size={20} color="#666" />
                    {/* Tooltip indicando que há opções */}
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      ↓
                    </span>
                  </button>
                  {showOwnerTypeModal && (
                    <ModalSelectTypeOwner
                      onSelect={(type) => {
                        router.push(`${basePath}/cadastrar?tipo=${type}`);
                        setShowOwnerTypeModal(false);
                      }}
                      onClose={() => setShowOwnerTypeModal(false)}
                    />
                  )}
                </div>
              ) : (
                <Link 
                  href={`${basePath}/cadastrar`} 
                  className="bg-[#D9D9D9] p-2 rounded hover:bg-gray-300 transition-colors"
                  title={`Adicionar novo ${title.toLowerCase()}`}
                >
                  <Plus size={20} color="#666" />
                </Link>
              )
            )}
            <div className="relative">
              <button 
                onClick={() => setFilterVisible(!filterVisible)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Filtrar registros"
              >
                <Filter size={20} color={hasActiveFilters ? "#8b5cf6" : "#666"} />
              </button>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 bg-[#8b5cf6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {enableDelete && (
              <button 
                onClick={handleDeleteClick}
                className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Excluir selecionados"
                disabled={!selectedCheckboxes.length}
              >
                <Trash2 size={20} color="#666" />
              </button>
            )}
          </div>

          {/* Modal de Filtros */}
          {filterVisible && (
            <DynamicFilterModal
              visible={filterVisible}
              setVisible={setFilterVisible}
              onApply={handleApplyFilter}
              onClear={handleClearFilters}
              title={title}
              filters={dynamicFilters}
              initialValues={appliedFilters}
            />
          )}

          <SearchInput 
            initialValue={state.search}
            onSearch={handleSearch}
            placeholder={searchPlaceholder}
            delay={600}
            autoFocus={autoFocusSearch}
          />
        </div>

        <SelectLimit 
          limit={state.limit} 
          onLimitChange={handleLimitChange} 
        />

        <p className="text-[16px] font-normal text-[#111111B2] laptop:relative tablet:text-center tablet:w-full">
          {meta && meta.total > 0 
            ? `Exibindo ${tableData.start} a ${tableData.end} de ${meta.total} registros` 
            : 'Nenhum registro encontrado'}
        </p>

        {meta && meta.totalPages > 1 && (
          <Pagination 
            currentPage={meta.page} 
            totalPage={meta.totalPages} 
            onPageChange={handlePageChange} 
          />
        )}
      </div>

      <div 
        ref={tableContainerRef}
        onScroll={handleTableScroll}
        className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
      >
        <TableInformations
          headers={headers}
          sort={state.sort}
          onSort={handleSort}
          onSelectAll={(e) => handleSelectAll(e.target.checked)}
          allSelected={tableData.allSelected}
          hasActions={enableView || enableEdit}
        >
          {items.map((item: any) => (
            <tr
              key={item.id}
              className="bg-white hover:bg-gray-50 text-[#111111B2] text-center relative border-b border-gray-100 cursor-pointer"
              onClick={() => onRowClick?.(item)}
            >
              {/* Primeira coluna com checkbox */}
              <td className="py-1 px-2 sticky left-0 bg-white z-10">
                <div className="flex items-center justify-start gap-2 whitespace-nowrap">
                  {enableDelete && (
                    <input 
                      type="checkbox" 
                      className="inp-checkbox-select rounded border-gray-300 ml-1" 
                      value={item.id} 
                      id={`item-${item.id}`}
                      checked={selectedCheckboxes.includes(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(item.id);
                      }}
                    />
                  )}
                  <span 
                    className="truncate max-w-[150px] text-sm" 
                    title={getCellValue(item, dataColumns[0])}
                  >
                    {getCellValue(item, dataColumns[0])}
                  </span>
                </div>
              </td>
              
              {/* Colunas de dados restantes */}
              {dataColumns.slice(1).map((column) => (
                <td key={column.field} className="py-1 px-2">
                  <div className={`flex items-center justify-${column.align || 'center'} whitespace-nowrap`}>
                    <span 
                      className={`truncate max-w-[200px] text-sm ${column.align === 'right' ? 'text-right' : ''}`}
                      title={getCellValue(item, column)}
                    >
                      {getCellValue(item, column)}
                    </span>
                  </div>
                </td>
              ))}
              
              {/* CORREÇÃO: Coluna de ações - sempre no final */}
              {(enableView || enableEdit) && (
                <td className="py-1 px-2 sticky right-0 bg-white z-10 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    {enableView && (
                      <Link 
                        href={`${basePath}/visualizar/${item.id}`} 
                        title={`Visualizar`}
                        className="p-1 hover:bg-blue-50 rounded transition-colors text-[#8b5cf6]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={16} />
                      </Link>
                    )}
                    {enableEdit && (
                      <Link 
                        href={`${basePath}/editar/${item.id}`} 
                        title={`Editar`}
                        className="p-1 hover:bg-green-50 rounded transition-colors text-[#8b5cf6]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit size={16} />
                      </Link>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </TableInformations>
      </div>
    </>
  );
}