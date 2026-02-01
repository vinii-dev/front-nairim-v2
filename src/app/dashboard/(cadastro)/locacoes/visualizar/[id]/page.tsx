/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import {
  FileText, Calendar, DollarSign, User, Building, 
  Home, File, Percent, Calculator, Hash
} from 'lucide-react';

const formatMoney = (value: number) => {
  if (!value && value !== 0) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export default function VisualizarLocacaoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  // Transformar dados da API para o formulário
  const transformData = (apiData: any) => {
    console.log('🔄 Transformando dados da API (locação):', apiData);
    
    if (!apiData) return {};
    
    return {
      contract_number: apiData.contract_number || '',
      start_date: apiData.start_date ? apiData.start_date.split('T')[0] : '',
      end_date: apiData.end_date ? apiData.end_date.split('T')[0] : '',
      property_display: apiData.property?.title || 'Imóvel não encontrado',
      type_display: apiData.property?.type?.description || apiData.type?.description || '',
      owner_display: apiData.property?.owner?.name || apiData.owner?.name || '',
      tenant_display: apiData.tenant?.name || 'Inquilino não encontrado',
      notes: apiData.notes || '',
      rent_amount: apiData.rent_amount ? formatMoney(apiData.rent_amount) : 'R$ 0,00',
      condo_fee: apiData.condo_fee ? formatMoney(apiData.condo_fee) : null,
      property_tax: apiData.property_tax ? formatMoney(apiData.property_tax) : 'R$ 0,00',
      extra_charges: apiData.extra_charges ? formatMoney(apiData.extra_charges) : null,
      agency_commission: apiData.agency_commission ? `${apiData.agency_commission}%` : '0%',
      commission_amount: apiData.commission_amount ? formatMoney(apiData.commission_amount) : 'R$ 0,00',
      rent_due_day: apiData.rent_due_day ? `Dia ${apiData.rent_due_day}` : 'Dia 5',
      tax_due_day: apiData.tax_due_day ? `Dia ${apiData.tax_due_day}` : 'Dia 10',
      condo_due_day: apiData.condo_due_day ? `Dia ${apiData.condo_due_day}` : 'Dia 10',
    };
  };

  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Dados da Locação',
      icon: <FileText size={20} />,
      fields: [
        {
          field: 'contract_number',
          label: 'Número do Contrato',
          type: 'text',
          required: true,
          placeholder: 'Ex: 2024/001',
          autoFocus: true,
          icon: <Hash size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'start_date',
          label: 'Data de Início',
          type: 'date',
          required: true,
          icon: <Calendar size={20} />,
          readOnly: true,
        },
        {
          field: 'end_date',
          label: 'Data de Término',
          type: 'date',
          required: true,
          icon: <Calendar size={20} />,
          readOnly: true,
        },
        {
          field: 'property_display',
          label: 'Imóvel',
          type: 'text',
          required: true,
          icon: <Home size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'type_display',
          label: 'Tipo do Imóvel',
          type: 'text',
          required: true,
          icon: <Building size={20} />,
          readOnly: true,
        },
        {
          field: 'owner_display',
          label: 'Proprietário',
          type: 'text',
          required: true,
          icon: <User size={20} />,
          readOnly: true,
        },
        {
          field: 'tenant_display',
          label: 'Inquilino',
          type: 'text',
          required: true,
          icon: <User size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'notes',
          label: 'Observações Gerais',
          type: 'textarea',
          placeholder: 'Observações sobre a locação',
          rows: 3,
          icon: <FileText size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
      ],
    },
    {
      title: 'Valores da Locação',
      icon: <DollarSign size={20} />,
      fields: [
        {
          field: 'rent_amount',
          label: 'Valor do Aluguel',
          type: 'text',
          required: true,
          placeholder: 'R$ 0,00',
          icon: <DollarSign size={20} />,
          readOnly: true,
        },
        {
          field: 'condo_fee',
          label: 'Valor do Condomínio',
          type: 'text',
          placeholder: 'R$ 0,00',
          icon: <Building size={20} />,
          readOnly: true,
        },
        {
          field: 'property_tax',
          label: 'Valor do IPTU',
          type: 'text',
          placeholder: 'R$ 0,00',
          icon: <File size={20} />,
          readOnly: true,
        },
        {
          field: 'extra_charges',
          label: 'Taxas Extras',
          type: 'text',
          placeholder: 'R$ 0,00',
          icon: <Calculator size={20} />,
          readOnly: true,
        },
        {
          field: 'agency_commission',
          label: 'Comissão Imobiliária',
          type: 'text',
          placeholder: '0%',
          icon: <Percent size={20} />,
          readOnly: true,
        },
        {
          field: 'commission_amount',
          label: 'Valor Comissão',
          type: 'text',
          placeholder: 'R$ 0,00',
          icon: <DollarSign size={20} />,
          readOnly: true,
        },
        {
          field: 'rent_due_day',
          label: 'Vencimento Aluguel',
          type: 'text',
          required: true,
          placeholder: 'Dia 5',
          icon: <Calendar size={20} />,
          readOnly: true,
        },
        {
          field: 'tax_due_day',
          label: 'Vencimento IPTU',
          type: 'text',
          placeholder: 'Dia 10',
          icon: <Calendar size={20} />,
          readOnly: true,
        },
        {
          field: 'condo_due_day',
          label: 'Vencimento Condomínio',
          type: 'text',
          placeholder: 'Dia 10',
          icon: <Calendar size={20} />,
          readOnly: true,
        },
      ],
    },
  ], []);

  return (
    <DynamicFormManager
      resource="leases"
      title="Locação"
      basePath="/dashboard/locacoes"
      mode="view"
      id={id}
      steps={steps}
      transformData={transformData}
    />
  );
}