'use client';

import Section from "@/components/Section";
import DynamicTableManager from "@/components/DynamicTableManager";
import { ColumnDef } from "@/types/types";

export default function AgenciasPage() {
  const columns: ColumnDef[] = [
    {
      field: "legal_name",
      label: "Razão Social",
      sortParam: "legal_name",
      type: "text"
    },
    {
      field: "trade_name",
      label: "Nome Fantasia",
      sortParam: "trade_name",
      type: "text"
    },
    {
      field: "cnpj",
      label: "CNPJ",
      sortParam: "cnpj",
      type: "text",
      formatter: "cpfCnpj"
    },
    {
      field: "state_registration",
      label: "Inscrição Estadual",
      sortParam: "state_registration",
      type: "text"
    },
    {
      field: "municipal_registration",
      label: "Inscrição Municipal",
      sortParam: "municipal_registration",
      type: "text"
    },
    {
      field: "license_number",
      label: "CRECI",
      sortParam: "license_number",
      type: "text"
    },
    {
      field: "zip_code",
      label: "CEP",
      type: "text",
      sortParam: "zip_code",
      formatter: "cep"
    },
    {
      field: "state",
      label: "UF",
      type: "text",
      sortParam: "state"
    },
    {
      field: "city",
      label: "Cidade",
      type: "text",
      sortParam: "city"
    },
    {
      field: "district",
      label: "Bairro",
      type: "text",
      sortParam: "district"
    },
    {
      field: "street",
      label: "Endereço",
      type: "text",
      sortParam: "street"
    },
    {
      field: "contact",
      label: "Contato",
      type: "text",
      sortParam: "contact"
    },
    {
      field: "telephone",
      label: "Fone",
      type: "text",
      sortParam: "telephone",
      formatter: "phone"
    },
    {
      field: "cellphone",
      label: "Celular",
      type: "text",
      sortParam: "cellphone",
      formatter: "phone"
    },
    {
      field: "email",
      label: "E-mail",
      type: "text",
      sortParam: "email"
    },
    {
      field: "actions",
      label: "Ação",
      type: "custom"
    }
  ];

  return (
    <Section title="Imobiliárias">
      <DynamicTableManager
        resource="agencies"
        title="Imobiliárias"
        columns={columns}
        basePath="/dashboard/imobiliarias"
        autoFocusSearch={true}
      />
    </Section>
  );
}