// app/dashboard/(cadastro)/administradores/page.tsx
'use client';

import { Suspense } from "react";
import Section from "@/components/Section";
import DynamicTableManager from "@/components/DynamicTableManager";
import SkeletonTable from "@/components/Loading/SkeletonTable";
import { ColumnDef } from "@/types/types";

export default function AdministradoresPage() {
  const columns: ColumnDef[] = [
    {
      field: "name",
      label: "Nome",
      sortParam: "name",
      type: "text"
    },
    {
      field: "email",
      label: "Email",
      sortParam: "email",
      type: "text"
    },
    {
      field: "gender",
      label: "Sexo",
      sortParam: "gender",
      type: "text",
      formatter: "gender"
    },
    {
      field: "birth_date",
      label: "Data de Nascimento",
      sortParam: "birth_date",
      type: "date",
      formatter: "date"
    },
    {
      field: "created_at",
      label: "Criado em",
      sortParam: "created_at",
      type: "date",
      formatter: "date"
    }
  ];

  return (
    <Section title="Administradores">
      <Suspense fallback={<SkeletonTable />}>
        <DynamicTableManager
          resource="users"
          title="Administradores"
          columns={columns}
          basePath="/dashboard/administradores"
          autoFocusSearch={true}
        />
      </Suspense>
    </Section>
  );
}