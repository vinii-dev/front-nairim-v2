'use client';

import Section from "@/components/Section";
import DynamicTableManager from "@/components/DynamicTableManager";
import { ColumnDef } from "@/types/types";

export default function TiposImovelPage() {
  const columns: ColumnDef[] = [
    {
      field: "description",
      label: "Descrição",
      sortParam: "description",
      type: "text"
    },
    {
      field: "created_at",
      label: "Criado em",
      type: "date",
      formatter: "date"
    }
  ];

  return (
    <Section title="Tipos de Imóvel">
      <DynamicTableManager
        resource="property-types"
        title="Tipos de Imóvel"
        columns={columns}
        basePath="/dashboard/tipo-imovel"
        autoFocusSearch={true}
      />
    </Section>
  );
}