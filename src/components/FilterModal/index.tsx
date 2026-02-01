/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { FilterField } from "@/types/administrador";

interface FilterModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onApply: (filters: Record<string, string | number | null>) => void;
  onClear: () => void;
  title: string;
  fields: FilterField[];
}

export default function FilterModal({ 
  visible, 
  setVisible, 
  onApply, 
  onClear, 
  title, 
  fields 
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<Record<string, string | number | null>>({});

  useEffect(() => {
    if (visible) {
      setLocalFilters({});
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Filtrar {title}</h3>
          <p className="text-sm text-gray-500 mt-1">Selecione os critérios de filtro</p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Fechar filtro"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent bg-white"
                value={localFilters[field.key] || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters, 
                  [field.key]: e.target.value || null
                })}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                value={localFilters[field.key] || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters, 
                  [field.key]: e.target.value || null
                })}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={() => {
            onClear();
            setLocalFilters({});
          }}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Limpar tudo
        </button>
        <button 
          onClick={() => onApply(localFilters)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Check size={16} />
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}