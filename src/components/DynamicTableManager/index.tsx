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
  
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  const isRestoringScrollRef = useRef(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { showMessage } = useMessageContext();
  const { showPopup } = usePopupContext();
  
  const { 
    filters: dynamicFilters, 
    searchFields,
    isLoading: isLoadingFilters 
  } = useDynamicFilters(`/${resource}/filters`, appliedFilters);
  
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

  const dataColumns = useMemo(() => {
    return columns.filter(col => col.field !== "actions" && col.type !== "custom");
  }, [columns]);

  const { items, meta } = useMemo(() => {
    console.log('📊 Dados recebidos:', data);
    
    if (!data) {
      return { items: [], meta: null };
    }
    
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
    
    if (data.items && Array.isArray(data.items)) {
      return {
        items: data.items,
        meta: data.meta
      };
    }
    
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
    
    console.error('❌ Estrutura de dados desconhecida:', data);
    return { items: [], meta: null };
  }, [data, state.limit]);

  const handleSelectOwnerType = (tipo: OwnerType) => {
    setShowOwnerTypeModal(false);
    window.location.href = `${basePath}/cadastrar?tipo=${tipo}`;
  };

  const getNestedValue = useCallback((obj: any, path: string) => {
    if (!obj || !path) return undefined;
    
    try {
      return path.split('.').reduce((acc, key) => {
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

  const formatValue = useCallback((value: any, column: ColumnDef, item: any) => {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    if (column.formatter) {
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
          return formatCEP(value);
        default:
          return String(value);
      }
    }

    if (column.type === 'date' && value) return formatDate(value);
    if (column.type === 'currency' && value) return formatCurrency(value);
    if (column.type === 'boolean') return value ? 'Sim' : 'Não';
    if (column.type === 'number') return Number(value).toLocaleString('pt-BR');

    return String(value);
  }, []);

  const getCellValue = useCallback((item: any, column: ColumnDef) => {
    try {
      // -------------------------------------------------------------------------
      // 1. REFATORAÇÃO: TRATAMENTO DE LISTA DE CONTATOS (UM ABAIXO DO OUTRO)
      // -------------------------------------------------------------------------
      const contactFields = ['contact', 'telephone', 'phone', 'cellphone', 'email', 'contact_name'];
      
      if (contactFields.includes(column.field)) {
        if (item.contacts && Array.isArray(item.contacts) && item.contacts.length > 0) {
          return (
            <div className="flex flex-col gap-1 py-1">
              {item.contacts.map((contact: any, index: number) => {
                let rawValue = '';
                
                if (column.field === 'contact' || column.field === 'contact_name') rawValue = contact.contact;
                else if (column.field === 'email') rawValue = contact.email;
                else if (column.field === 'telephone' || column.field === 'phone') rawValue = contact.phone;
                else if (column.field === 'cellphone') rawValue = contact.cellphone;

                // Formata o valor individualmente
                const formattedValue = formatValue(rawValue, column, item);
                
                // Exibe mesmo se for vazio para manter o alinhamento com a lista ao lado
                return (
                  <div key={index} className="h-5 flex items-center justify-center whitespace-nowrap text-xs">
                     <span className={!rawValue ? "text-gray-300" : ""}>
                        {formattedValue !== '-' ? formattedValue : '-'}
                     </span>
                  </div>
                );
              })}
            </div>
          );
        }
        return '-';
      }

      // -------------------------------------------------------------------------
      // LÓGICA PADRÃO PARA OUTROS CAMPOS
      // -------------------------------------------------------------------------

      const isUser = resource === 'users';
      if (isUser && ['name', 'email', 'gender', 'birth_date', 'created_at'].includes(column.field)) {
        return formatValue(item[column.field], column, item);
      }

      const isLease = resource === 'leases';
      if (isLease) {
        if (column.field === "property_title") return formatValue(item.property?.title, column, item);
        if (column.field === "type") return formatValue(item.property?.type?.description, column, item);
        if (column.field === "owner") return formatValue(item.owner?.name, column, item);
        if (column.field === "tenant") return formatValue(item.tenant?.name, column, item);
        if (['rent_due_day', 'tax_due_day', 'condo_due_day'].includes(column.field)) {
           return item[column.field] ? `${item[column.field]}º dia` : '-';
        }
      }

      const isProperty = resource === 'properties';
      if (isProperty) {
        const addressFieldMap: Record<string, string> = {
          'zip_code': 'zip_code', 'state': 'state', 'city': 'city',
          'district': 'district', 'street': 'street', 'address': 'street', 'cep': 'zip_code'
        };
        const addressField = addressFieldMap[column.field];
        if (addressField) return formatValue(item.addresses?.[0]?.address?.[addressField], column, item);
        if (column.field === "owner") return formatValue(item.owner?.name, column, item);
        if (column.field === "type") return formatValue(item.type?.description, column, item);
      }

      // Campos de Endereço Genéricos (Primeiro endereço)
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
        return formatValue(getNestedValue(item, `${path}.${field}`), column, item);
      }

      // Fallback para campos diretos
      if (column.field in item) {
        const value = item[column.field];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (value.name) return formatValue(value.name, column, item);
          if (value.description) return formatValue(value.description, column, item);
          if (value.title) return formatValue(value.title, column, item);
        }
        return formatValue(value, column, item);
      }
      
      const nestedValue = getNestedValue(item, column.field);
      if (nestedValue !== undefined) return formatValue(nestedValue, column, item);

      return '-';
      
    } catch (error) {
      console.error(`Erro ao obter valor da coluna ${column.field}:`, error);
      return '-';
    }
  }, [formatValue, getNestedValue, resource]);

  const searchPlaceholder = useMemo(() => {
    if (!searchFields.length) return `Pesquisar ${title.toLowerCase()}...`;
    const fieldsText = searchFields.map(field => {
      const filter = dynamicFilters.find(f => f.field === field);
      return filter?.label || field;
    }).join(", ");
    return `Pesquisar por ${fieldsText}...`;
  }, [searchFields, dynamicFilters, title]);

  const headers = useMemo(() => 
    dataColumns.map(col => ({
      label: col.label,
      field: col.field,
      sortParam: col.sortParam || col.field
    }))
  , [dataColumns]);

  const handleTableScroll = useCallback(() => {
    if (isRestoringScrollRef.current) return;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (tableContainerRef.current) {
        scrollPositionRef.current = tableContainerRef.current.scrollLeft;
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (tableContainerRef.current) {
      isRestoringScrollRef.current = true;
      tableContainerRef.current.scrollLeft = scrollPositionRef.current;
      setTimeout(() => { isRestoringScrollRef.current = false; }, 100);
    }
  }, [items]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const handleSearch = useCallback((search: string) => {
    updateState({ search, page: 1 });
  }, [updateState]);

  const handleSort = useCallback((sortParam: string) => {
    const currentOrder = state.sort[sortParam] || null;
    let nextOrder: "asc" | "desc" = "desc";
    
    if (currentOrder === "desc") nextOrder = "asc";
    else if (currentOrder === "asc") nextOrder = "desc";

    updateState({ sort: { [sortParam]: nextOrder }, page: 1 });
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
              
              if (response.ok) successCount++;
              else errorCount++;
            } catch {
              errorCount++;
            }
          }
          
          if (errorCount === 0) {
            showMessage(selectedCheckboxes.length > 1 ? `${successCount} registros removidos com sucesso!` : "Registro removido com sucesso!", "success");
          } else {
            showMessage(`${successCount} de ${selectedCheckboxes.length} registros removidos. ${errorCount} erros.`, "info");
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
    updateState({ filters, page: 1 });
    setFilterVisible(false);
  }, [updateState]);

  const handleClearFilters = useCallback(() => {
    setAppliedFilters({});
    updateState({ filters: {}, page: 1 });
    setFilterVisible(false);
  }, [updateState]);

  const handlePageChange = useCallback((page: number) => {
    updateState({ page });
  }, [updateState]);

  const handleLimitChange = useCallback((limit: number) => {
    updateState({ limit, page: 1 });
  }, [updateState]);

  const tableData = useMemo(() => {
    if (!meta || !meta.total) {
      return { start: 0, end: 0, allSelected: false };
    }
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    const allSelected = selectedCheckboxes.length === items.length && items.length > 0;
    return { start, end, allSelected };
  }, [meta, selectedCheckboxes.length, items.length]);

  const hasActiveFilters = useMemo(() => Object.keys(appliedFilters).length > 0, [appliedFilters]);
  const activeFilterCount = useMemo(() => Object.keys(appliedFilters).length, [appliedFilters]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (filterVisible || showOwnerTypeModal)) {
        setFilterVisible(false);
        setShowOwnerTypeModal(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [filterVisible, showOwnerTypeModal]);

  if (isLoadingFilters || isLoadingData) {
    return <SkeletonTable />;
  }

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
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">↓</span>
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

        <SelectLimit limit={state.limit} onLimitChange={handleLimitChange} />

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
              className="bg-white hover:bg-gray-50 text-[#111111B2] text-center relative border-b border-gray-100 cursor-pointer align-top"
              onClick={() => onRowClick?.(item)}
            >
              <td className="py-2 px-2 sticky left-0 bg-white z-10 border-r border-gray-100">
                <div className="flex items-center justify-start gap-2 h-full">
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
                  <div 
                    className="truncate max-w-[150px] text-sm text-left" 
                    title={getCellValue(item, dataColumns[0]) as string}
                  >
                    {getCellValue(item, dataColumns[0])}
                  </div>
                </div>
              </td>
              
              {dataColumns.slice(1).map((column) => (
                <td key={column.field} className="py-2 px-2 align-top">
                  <div className={`flex flex-col h-full justify-${column.align === 'right' ? 'start items-end' : column.align === 'left' ? 'start items-start' : 'center items-center'}`}>
                    <div className="w-full">
                      {getCellValue(item, column)}
                    </div>
                  </div>
                </td>
              ))}
              
              {(enableView || enableEdit) && (
                <td className="py-2 px-2 sticky right-0 bg-white z-10 border-l border-gray-100 align-middle">
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