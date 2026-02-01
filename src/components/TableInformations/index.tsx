"use client";

import { ChangeEvent, ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { Header, SortOrder } from "@/types/administrador";

interface TableInformationsProps {
  headers: Header[];
  children: ReactNode;
  sort: Record<string, SortOrder>;
  onSort: (sortParam: string) => void;
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  allSelected: boolean;
  emptyMessage?: string;
  hasActions?: boolean;
}

export default function TableInformations({
  headers,
  children,
  sort,
  onSort,
  onSelectAll,
  allSelected,
  emptyMessage = "Não foi encontrado nenhum registro.",
  hasActions = true,
}: TableInformationsProps) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  if (isEmpty) {
    return (
      <div className="flex justify-center items-center my-3">
        <div className="bg-[#D9D9D9] py-4 px-6 rounded-sm flex items-center gap-3">
          <p className="text-gray-700">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // **CORREÇÃO: Separar headers de dados do header de ações**
  const dataHeaders = headers.filter(header => header.field !== "actions");
  const actionHeader = headers.find(header => header.field === "actions");

  return (
    <table className="min-w-full text-sm text-left text-gray-700">
      <thead className="bg-[#ABABAB] uppercase text-[#111111B2] font-semibold border-b border-gray-200">
        <tr>
          {/* Headers de dados */}
          {dataHeaders.map((header, idx) => {
            const isSortable = header?.sortParam && header.field !== "actions";
            const displayOrder = sort[header.sortParam!];
            const isFirstColumn = idx === 0;

            return (
              <th
                key={idx}
                className={`py-2 px-3 font-normal text-[14px] whitespace-nowrap
                  ${isFirstColumn ? "sticky left-0 bg-[#ABABAB] z-20" : ""}
                  ${isSortable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""}
                `}
                onClick={isSortable ? () => onSort(header.sortParam!) : undefined}
              >
                <div className={`flex gap-1 capitalize ${isFirstColumn ? 'items-start justify-start' : 'items-center justify-center'}`}>
                  {isFirstColumn && (
                    <input
                      type="checkbox"
                      className="inp-checkbox-select ml-[4px] mr-[4px]"
                      onChange={onSelectAll}
                      onClick={(e) => e.stopPropagation()}
                      checked={allSelected}
                    />
                  )}
                  <span>{header.label}</span>
                  {isSortable && (
                    <span
                      className={`transition-transform duration-200 ${
                        displayOrder === "desc" ? "rotate-180" : ""
                      }`}
                    >
                      <ArrowUpDown size={14} className="text-[#111111B2]" />
                    </span>
                  )}
                </div>
              </th>
            );
          })}
          
          {/* **CORREÇÃO: Header da coluna de ações - sempre no final */}
          {hasActions && (
            <th
              key="actions"
              className="py-2 px-3 font-normal text-[14px] whitespace-nowrap sticky right-0 bg-[#ABABAB] z-20 min-w-[80px]"
            >
              <div className="flex items-center justify-center gap-1 capitalize">
                <span>Ação</span>
              </div>
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 lines-bg">{children}</tbody>
    </table>
  );
}