/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/(cadastro)/locacoes/cadastrar/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import { useMessageContext } from '@/contexts/MessageContext';
import { useRouter } from 'next/navigation';
import { 
  FileText, Calendar, DollarSign, User, Building, 
  Home, File, Percent, Calculator, Hash
} from 'lucide-react';

const parseMoney = (value: string | number) => {
  if (!value && value !== 0) return 0;
  
  if (typeof value === 'number') {
    return value;
  }
  
  const cleaned = String(value)
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
    
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    console.warn(`Valor monetário inválido: ${value}`);
    return 0;
  }
  
  return parsed;
};

const formatMoney = (value: number) => {
  if (!value && value !== 0) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Função para calcular o IPTU (exemplo: 0.3% do valor do aluguel + condomínio)
const calculateIPTU = (rentAmount: number, condoFee: number = 0): number => {
  const baseValue = rentAmount + condoFee;
  // Exemplo: 0.3% do valor base (pode ajustar a fórmula conforme necessidade)
  const iptuValue = baseValue * 0.003; // 0.3%
  return iptuValue;
};

export default function CadastrarLocacaoPage() {
  const { showMessage } = useMessageContext();
  const router = useRouter();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formValues, setFormValues] = useState<any>({});

  // Buscar dados para selects
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [propertiesRes, tenantsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/properties?limit=50`),
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/tenants`),
        ]);

        if (!propertiesRes.ok || !tenantsRes.ok) {
          throw new Error('Erro ao buscar dados iniciais');
        }

        const propertiesData = await propertiesRes.json();
        const tenantsData = await tenantsRes.json();

        setProperties(propertiesData.data || propertiesData || []);
        setTenants(tenantsData.data || tenantsData || []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        showMessage('Erro ao carregar dados iniciais', 'error');
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, [showMessage]);

  // Handler para mudança de campo - busca dados do imóvel
  const handleFieldChange = async (fieldName: string, value: any) => {
    console.log('handleFieldChange:', fieldName, value);
    
    // Quando o imóvel é selecionado, buscar seus dados completos
    if (fieldName === 'property_id' && value) {
      try {
        showMessage('Carregando dados do imóvel...', 'info');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/properties/${value}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do imóvel');
        }

        const result = await response.json();
        const property = result.data || result;
        
        // Obter valores do imóvel (último registro do array values)
        const propertyValues = property.values?.[0] || {};
        
        // Preparar updates para o formulário
        const updates: any = {
          // Preencher tipo do imóvel e proprietário (campos ocultos)
          type_id: property.type_id,
          owner_id: property.owner_id,
          // Preencher campos de exibição (texto somente leitura)
          type_display: property.type?.description || 'Tipo não encontrado',
          owner_display: property.owner?.name || 'Proprietário não encontrado',
          // Valores monetários do imóvel
          rent_amount: propertyValues.rental_value ? formatMoney(parseMoney(propertyValues.rental_value)) : 'R$ 0,00',
          condo_fee: propertyValues.condo_fee ? formatMoney(parseMoney(propertyValues.condo_fee)) : 'R$ 0,00',
          extra_charges: propertyValues.extra_charges ? formatMoney(parseMoney(propertyValues.extra_charges)) : 'R$ 0,00',
        };

        // Calcular comissão padrão (5% do aluguel)
        if (propertyValues.rental_value) {
          updates.agency_commission = '5'; // 5% por padrão
          const rentValue = parseMoney(propertyValues.rental_value);
          updates.commission_amount = formatMoney(rentValue * 0.05);
        }

        // Definir dia de vencimento padrão
        updates.rent_due_day = '5';
        updates.tax_due_day = '10';
        updates.condo_due_day = '10';

        showMessage('Dados do imóvel carregados com sucesso!', 'success');
        return updates;

      } catch (error: any) {
        console.error('Erro ao buscar imóvel:', error);
        showMessage(error.message || 'Erro ao buscar dados do imóvel', 'error');
        return null;
      }
    }

    // Calcular comissão automaticamente quando o percentual OU valor do aluguel muda
    if (fieldName === 'agency_commission' || fieldName === 'rent_amount') {
      const rentAmount = fieldName === 'rent_amount' 
        ? parseMoney(value) 
        : parseMoney(formValues?.rent_amount || 0);
      
      const commissionPercent = fieldName === 'agency_commission'
        ? parseFloat(value) || 0
        : parseFloat(formValues?.agency_commission || 0);
      
      const commissionAmount = rentAmount * (commissionPercent / 100);
      
      return {
        commission_amount: formatMoney(commissionAmount)
      };
    }

    // Se mudou o aluguel ou condomínio, recalcular IPTU
    if (fieldName === 'rent_amount' || fieldName === 'condo_fee') {
      const rentAmount = fieldName === 'rent_amount' 
        ? parseMoney(value) 
        : parseMoney(formValues?.rent_amount || 0);
      
      const condoFee = fieldName === 'condo_fee'
        ? parseMoney(value)
        : parseMoney(formValues?.condo_fee || 0);
      
      const iptuValue = calculateIPTU(rentAmount, condoFee);
      
      return {
        property_tax: formatMoney(iptuValue)
      };
    }

    return null;
  };

  // Função para validar um step
  const validateStep = (stepIndex: number, data: any): boolean => {
    const stepFields = steps[stepIndex].fields;
    
    for (const field of stepFields) {
      if (field.required && !field.hidden) {
        const value = data[field.field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return false;
        }
      }
    }
    
    return true;
  };

  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Dados da Locação',
      icon: <FileText size={20} />,
      fields: [
        {
          field: 'contract_number',
          label: 'Número do Contrato',
          type: 'number',
          required: true,
          placeholder: 'Ex: 2024/001',
          autoFocus: true,
          icon: <Hash size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'start_date',
          label: 'Data de Início',
          type: 'date',
          required: true,
          icon: <Calendar size={20} />,
        },
        {
          field: 'end_date',
          label: 'Data de Término',
          type: 'date',
          required: true,
          icon: <Calendar size={20} />,
        },
        {
          field: 'property_id',
          label: 'Imóvel',
          type: 'select',
          required: true,
          options: loadingData 
            ? [{ label: 'Carregando imóveis...', value: '' }]
            : properties.map((property) => ({ 
                label: property.title, 
                value: property.id 
              })),
          icon: <Home size={20} />,
          className: 'col-span-full',
        },
        // Campos ocultos para os IDs (necessários para o submit)
        {
          field: 'type_id',
          label: '',
          type: 'text',
          hidden: true,
        },
        {
          field: 'owner_id',
          label: '',
          type: 'text',
          hidden: true,
        },
        // Campos de exibição (somente leitura)
        {
          field: 'type_display',
          label: 'Tipo do Imóvel',
          type: 'text',
          required: true,
          icon: <Building size={20} />,
          disabled: true,
          readOnly: true,
          placeholder: 'Selecione um imóvel primeiro',
        },
        {
          field: 'owner_display',
          label: 'Proprietário',
          type: 'text',
          required: true,
          icon: <User size={20} />,
          disabled: true,
          readOnly: true,
          placeholder: 'Selecione um imóvel primeiro',
        },
        {
          field: 'tenant_id',
          label: 'Inquilino',
          type: 'select',
          required: true,
          options: loadingData 
            ? [{ label: 'Carregando inquilinos...', value: '' }]
            : tenants.map((tenant) => ({ 
                label: tenant.name, 
                value: tenant.id 
              })),
          icon: <User size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'notes',
          label: 'Observações Gerais',
          type: 'textarea',
          placeholder: 'Observações sobre a locação',
          rows: 3,
          icon: <FileText size={20} />,
          className: 'col-span-full',
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
          mask: 'money',
          icon: <DollarSign size={20} />,
        },
        {
          field: 'condo_fee',
          label: 'Valor do Condomínio',
          type: 'text',
          placeholder: 'R$ 0,00',
          mask: 'money',
          icon: <Building size={20} />,
        },
        {
          field: 'property_tax',
          label: 'Valor do IPTU (Calculado Automaticamente)',
          type: 'text',
          placeholder: 'R$ 0,00',
          mask: 'money',
          icon: <File size={20} />,
          readOnly: true,
          disabled: true,
          className: 'bg-gray-50',
        },
        {
          field: 'extra_charges',
          label: 'Taxas Extras',
          type: 'text',
          placeholder: 'R$ 0,00',
          mask: 'money',
          icon: <Calculator size={20} />,
        },
        {
          field: 'agency_commission',
          label: 'Comissão Imobiliária (%)',
          type: 'number',
          placeholder: '5',
          maxLength: 3,
          icon: <Percent size={20} />,
        },
        {
          field: 'commission_amount',
          label: 'Valor Comissão',
          type: 'text',
          placeholder: 'R$ 0,00',
          mask: 'money',
          icon: <DollarSign size={20} />,
          readOnly: true,
          disabled: true,
          className: 'bg-gray-50',
        },
        {
          field: 'rent_due_day',
          label: 'Vencimento Aluguel',
          type: 'number',
          required: true,
          placeholder: '5',
          min: 1,
          max: 31,
          icon: <Calendar size={20} />,
        },
        {
          field: 'tax_due_day',
          label: 'Vencimento IPTU',
          type: 'number',
          placeholder: '10',
          min: 1,
          max: 31,
          icon: <Calendar size={20} />,
        },
        {
          field: 'condo_due_day',
          label: 'Vencimento Condomínio',
          type: 'number',
          placeholder: '10',
          min: 1,
          max: 31,
          icon: <Calendar size={20} />,
        },
      ],
    },
  ], [properties, tenants, loadingData]);

  // Handler de submit
  const handleSubmit = async (data: any) => {
    try {
      if (!data.property_id) {
        throw new Error('Selecione um imóvel para continuar');
      }

      // Calcular IPTU final antes de enviar
      const rentAmount = parseMoney(data.rent_amount || 0);
      const condoFee = parseMoney(data.condo_fee || 0);
      const finalIPTU = calculateIPTU(rentAmount, condoFee);

      // Preparar payload no formato esperado pelo back-end
      const payload = {
        property_id: data.property_id,
        type_id: data.type_id,
        owner_id: data.owner_id,
        tenant_id: data.tenant_id,
        contract_number: data.contract_number,
        start_date: data.start_date,
        end_date: data.end_date,
        rent_amount: rentAmount,
        condo_fee: data.condo_fee ? parseMoney(data.condo_fee) : null,
        property_tax: finalIPTU, // Usar o IPTU calculado
        extra_charges: data.extra_charges ? parseMoney(data.extra_charges) : null,
        agency_commission: data.agency_commission ? parseFloat(data.agency_commission) : null,
        commission_amount: data.commission_amount ? parseMoney(data.commission_amount) : null,
        rent_due_day: parseInt(data.rent_due_day) || 5,
        tax_due_day: data.tax_due_day ? parseInt(data.tax_due_day) : null,
        condo_due_day: data.condo_due_day ? parseInt(data.condo_due_day) : null,
      };

      console.log('📊 Dados da locação preparados:', payload);

      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      
      const createRes = await fetch(`${API_URL}/leases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await createRes.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Erro ao fazer parse da resposta:', e);
        throw new Error('Resposta inválida do servidor');
      }

      if (!createRes.ok) {
        console.error('❌ Erro da API:', result);
        
        if (createRes.status === 400 && result.errors) {
          const validationErrors = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          throw new Error(`Erros de validação: ${validationErrors}`);
        }
        
        throw new Error(result.message || `Erro ${createRes.status}: ${responseText}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Erro desconhecido ao criar locação');
      }

      return result.data || result;

    } catch (error: any) {
      console.error('❌ Erro no handleSubmit:', error);
      throw new Error(`Erro ao criar locação: ${error.message}`);
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps(prev => [...prev, stepIndex]);
    }
  };

  const canNavigateToStep = (targetStep: number, currentStep: number, data: any): boolean => {
    // Sempre permite voltar
    if (targetStep < currentStep) return true;
    
    // Para avançar, verifica se o step atual é válido
    if (targetStep > currentStep) {
      return validateStep(currentStep, data);
    }
    
    return true;
  };

  const onSubmitSuccess = () => {
    showMessage('Locação criada com sucesso!', 'success');
    router.push('/dashboard/locacoes');
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <DynamicFormManager
      resource="leases"
      title="Locação"
      basePath="/dashboard/locacoes"
      mode="create"
      steps={steps}
      onSubmit={handleSubmit}
      onSubmitSuccess={onSubmitSuccess}
      onFieldChange={handleFieldChange}
      completedSteps={completedSteps}
      onStepComplete={handleStepComplete}
      canNavigateToStep={canNavigateToStep}
      onFormValuesChange={setFormValues}
    />
  );
}