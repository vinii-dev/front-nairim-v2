/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import DynamicForm from "@/components/DynamicFormManager";
import { FormFieldDef } from "@/types/types";

export default function CadastrarAdministradorPage() {
  const fields: FormFieldDef[] = [
    {
      field: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
      placeholder: 'Nome do administrador',
    },
    {
      field: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'email@exemplo.com',
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Email inválido'
      },
    },
    {
      field: 'birth_date',
      label: 'Data de Nascimento',
      type: 'date',
      required: true,
    },
    {
      field: 'gender',
      label: 'Sexo',
      type: 'select',
      required: true,
      options: [
        { label: 'Masculino', value: 'MALE' },
        { label: 'Feminino', value: 'FEMALE' },
      ],
    },
    {
      field: 'password',
      label: 'Senha',
      type: 'password',
      required: true,
      placeholder: 'Insira a senha',
      validation: {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/,
        patternMessage: 'A senha deve conter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.'
      },
      className: 'mt-6',
    },
    {
      field: 'password_confirm',
      label: 'Confirmar Senha',
      type: 'password',
      required: true,
      placeholder: 'Confirme sua senha',
      validation: {
        custom: (value: any, formValues: { password: any; }) => {
          if (value !== formValues.password) {
            return 'As senhas não coincidem';
          }
          return null;
        }
      },
      className: 'mt-6',
    },
  ];

  const transformResponse = (data: any) => {
    return {
      ...data,
      role: 'ADMIN'
    };
  };

  return (
    <DynamicForm
      resource="users"
      title="Administrador"
      basePath="/dashboard/administradores"
      mode="create"
      fields={fields}
      transformResponse={transformResponse}
    />
  );
}