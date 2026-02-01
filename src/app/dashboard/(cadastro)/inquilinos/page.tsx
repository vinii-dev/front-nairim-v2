// app/dashboard/tenantes/page.tsx - VERSÃO ATUALIZADA
'use client';

import Section from "@/components/Section";
import DynamicTableManager from "@/components/DynamicTableManager";
import { ColumnDef } from "@/types/types";

export default function TenantesPage() {
  const columns: ColumnDef[] = [
    {
      field: "name",
      label: "Nome",
      sortParam: "sort_name",
      type: "text"
    },
    {
      field: "internal_code",
      label: "Código Interno",
      sortParam: "sort_internal_code",
      type: "text"
    },
    {
      field: "occupation",
      label: "Profissão",
      sortParam: "sort_occupation",
      type: "text"
    },
    {
      field: "marital_status",
      label: "Estado Civil",
      sortParam: "sort_marital_status",
      type: "text"
    },
    {
      field: "cnpj",
      label: "CNPJ",
      sortParam: "sort_cnpj",
      type: "text",
      formatter: "cpfCnpj"
    },
    {
      field: "cpf",
      label: "CPF",
      sortParam: "sort_cpf",
      type: "text",
      formatter: "cpfCnpj"
    },
    // ADICIONADO: Campos de inscrição estadual e municipal
    {
      field: "state_registration",
      label: "Inscrição Estadual",
      sortParam: "sort_state_registration",
      type: "text"
    },
    {
      field: "municipal_registration",
      label: "Inscrição Municipal",
      sortParam: "sort_municipal_registration",
      type: "text"
    },
    {
      field: "zip_code",
      label: "CEP",
      type: "text",
      sortParam: "sort_zip_code",
      formatter: "cep"
    },
    {
      field: "state",
      label: "UF",
      type: "text",
      sortParam: "sort_state"
    },
    {
      field: "city",
      label: "Cidade",
      type: "text",
      sortParam: "sort_city"
    },
    {
      field: "district",
      label: "Bairro",
      type: "text",
      sortParam: "sort_district"
    },
    {
      field: "address",
      label: "Endereço",
      type: "text",
      sortParam: "sort_address"
    },
    {
      field: "contact",
      label: "Contato",
      type: "text",
      sortParam: "sort_contact"
    },
    {
      field: "telephone",
      label: "Fone",
      type: "text",
      sortParam: "sort_telephone",
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
      sortParam: "sort_email"
    },
    {
      field: "actions",
      label: "Ação",
      type: "custom"
    }
  ];

  return (
    <Section title="Inquilinos">
      <DynamicTableManager
        resource="tenants"
        title="Inquilinos"
        columns={columns}
        basePath="/dashboard/inquilinos"
        autoFocusSearch={true}
      />
    </Section>
  );
}