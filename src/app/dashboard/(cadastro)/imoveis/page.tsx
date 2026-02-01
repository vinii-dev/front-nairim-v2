'use client';

import Section from "@/components/Section";
import DynamicTableManager from "@/components/DynamicTableManager";
import { ColumnDef } from "@/types/types";

export default function ImoveisPage() {
  const columns: ColumnDef[] = [
    {
      field: "title",
      label: "Nome",
      sortParam: "title", // CORREÇÃO: Removido prefixo "sort_"
      type: "text"
    },
    {
      field: "owner",
      label: "Proprietário",
      sortParam: "owner.name", // CORREÇÃO: Campo aninhado para relacionamento
      type: "text",
      nestedField: "owner.name" // Adicionado para obter valor corretamente
    },
    {
      field: "zip_code",
      label: "CEP",
      type: "text",
      sortParam: "zip_code", // CORREÇÃO: Removido prefixo "sort_"
      formatter: "cep",
      nestedField: "addresses.0.address.zip_code"
    },
    {
      field: "street",
      label: "Endereço",
      type: "text",
      sortParam: "street", // CORREÇÃO: Removido prefixo "sort_"
      nestedField: "addresses.0.address.street"
    },
    {
      field: "district",
      label: "Bairro",
      type: "text",
      sortParam: "district", // CORREÇÃO: Removido prefixo "sort_"
      nestedField: "addresses.0.address.district"
    },
    {
      field: "city",
      label: "Cidade",
      type: "text",
      sortParam: "city", // CORREÇÃO: Removido prefixo "sort_"
      nestedField: "addresses.0.address.city"
    },
    {
      field: "state",
      label: "UF",
      type: "text",
      sortParam: "state", // CORREÇÃO: Removido prefixo "sort_"
      nestedField: "addresses.0.address.state"
    },
    {
      field: "type",
      label: "Tipo do imóvel",
      sortParam: "type.description", // CORREÇÃO: Campo aninhado para relacionamento
      type: "text",
      nestedField: "type.description"
    },
    {
      field: "bedrooms",
      label: "Quartos",
      sortParam: "bedrooms", // CORREÇÃO: Removido prefixo "sort_"
      type: "number"
    },
    {
      field: "bathrooms",
      label: "Banheiros",
      sortParam: "bathrooms", // CORREÇÃO: Removido prefixo "sort_"
      type: "number"
    },
    {
      field: "half_bathrooms",
      label: "Lavabos",
      sortParam: "half_bathrooms", // CORREÇÃO: Removido prefixo "sort_"
      type: "number"
    },
    {
      field: "garage_spaces",
      label: "Vagas na Garagem",
      sortParam: "garage_spaces", // CORREÇÃO: Removido prefixo "sort_"
      type: "number"
    },
    {
      field: "area_total",
      label: "Área Total (m²)",
      sortParam: "area_total", // CORREÇÃO: Removido prefixo "sort_"
      type: "number",
    },
    {
      field: "area_built",
      label: "Área Privativa (m²)",
      sortParam: "area_built", // CORREÇÃO: Removido prefixo "sort_"
      type: "number",
    },
    {
      field: "frontage",
      label: "Fachada",
      sortParam: "frontage", // CORREÇÃO: Removido prefixo "sort_"
      type: "number",
    },
    {
      field: "furnished",
      label: "Mobiliado",
      type: "boolean",
      sortParam: "furnished" // CORREÇÃO: Removido prefixo "sort_"
    },
    {
      field: "floor_number",
      label: "Número de Andar",
      sortParam: "floor_number", // CORREÇÃO: Removido prefixo "sort_"
      type: "number"
    },
    {
      field: "tax_registration",
      label: "Inscrição fiscal",
      sortParam: "tax_registration", // CORREÇÃO: Removido prefixo "sort_"
      type: "text"
    },
    {
      field: "notes",
      label: "Observações",
      type: "text",
      sortParam: "notes" // CORREÇÃO: Removido prefixo "sort_"
    },
    {
      field: "actions",
      label: "Ação",
      type: "custom"
    }
  ];

  return (
    <Section title="Imóveis">
      <DynamicTableManager
        resource="properties"
        title="Imóveis"
        columns={columns}
        basePath="/dashboard/imoveis"
        autoFocusSearch={true}
      />
    </Section>
  );
}