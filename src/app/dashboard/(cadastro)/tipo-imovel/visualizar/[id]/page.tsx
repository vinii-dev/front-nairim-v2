/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import { Home, Tag, Calendar, Clock } from 'lucide-react';

export default function VisualizarTipoImovelPage() {
  const params = useParams();
  const id = params.id as string;

  // Transformar dados da API para o formulário (CORRIGIDO)
  const transformData = (apiData: any) => {
    console.log('🔄 Transformando dados da API (tipo de imóvel):', apiData);
    
    if (!apiData) return {};
    
    // A API retorna o objeto diretamente, não tem "data.data"
    const data = apiData.data || apiData;
    
    return {
      description: data.description || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
    };
  };

  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Informações do Tipo de Imóvel',
      icon: <Home size={20} />,
      fields: [
        {
          field: 'description',
          label: 'Descrição',
          type: 'textarea',
          required: true,
          placeholder: 'Ex: Apartamento, Casa, Terreno, etc.',
          icon: <Tag size={20} />,
          className: 'col-span-full',
          readOnly: true,
        }
      ],
    },
  ], []);

  return (
    <DynamicFormManager
      resource="property-types"
      title="Tipo de Imóvel"
      basePath="/dashboard/tipo-imovel"
      mode="view"
      id={id}
      steps={steps}
      transformData={transformData}
    />
  );
}