/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import DynamicForm from '@/components/DynamicFormManager';
import { FormFieldDef } from '@/types/types';
import { useParams } from 'next/navigation';

export default function EditarAdministradorPage() {
  const params = useParams();
  const id = params.id as string;

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
  ];

  // Transformar dados da API para o formulário
  const transformData = (apiResponse: any) => {
    console.log('📥 Dados brutos da API (edição):', apiResponse);
    
    const userData = apiResponse.data || apiResponse;
    
    console.log('👤 Dados do usuário para edição:', userData);
    
    return {
      name: userData.name || '',
      email: userData.email || '',
      birth_date: userData.birth_date ? userData.birth_date.split('T')[0] : '',
      gender: userData.gender || 'MALE',
    };
  };

  return (
    <DynamicForm
      resource="users"
      title="Administrador"
      basePath="/dashboard/administradores"
      mode="edit"
      id={id}
      fields={fields}
      transformData={transformData}
    />
  );
}