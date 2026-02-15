'use client';

import Section from "@/components/Section";
import DynamicTableManager from "@/components/DynamicTableManager";
import { ColumnDef } from "@/types/types";

export default function InquilinosPage() {
  const columns: ColumnDef[] = [
    {
      field: "name",
      label: "Nome",
      sortParam: "name",
      type: "text"
    },
    {
      field: "person_type",
      label: "Pessoa",
      type: "text",
      sortParam: "cpf"
    },
    {
      field: "internal_code",
      label: "Código Interno",
      sortParam: "internal_code",
      type: "text"
    },
    {
      field: "occupation",
      label: "Profissão",
      sortParam: "occupation",
      type: "text"
    },
    {
      field: "marital_status",
      label: "Estado Civil",
      sortParam: "marital_status",
      type: "text"
    },
    {
      field: "cpf",
      label: "CPF",
      sortParam: "cpf",
      type: "text",
      formatter: "cpfCnpj"
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
      type: "text"
    },
    {
      field: "municipal_registration",
      label: "Inscrição Municipal",
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
      field: "address",
      label: "Endereço",
      type: "text",
      sortParam: "street"
    },
    {
      field: "contact",
      label: "Contato",
      type: "text",
      sortParam: "contact_name"
    },
    {
      field: "telephone",
      label: "Fone",
      type: "text",
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