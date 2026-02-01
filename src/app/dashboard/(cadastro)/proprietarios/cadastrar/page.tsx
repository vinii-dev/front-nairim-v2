/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMessageContext } from '@/contexts/MessageContext';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import { OwnerType } from '@/types/owner';
import {
  User, MapPin, Phone, FileText, Hash,
  Briefcase, Heart, Building, Globe,
  User as UserIcon, MapPin as MapPinIcon,
  Phone as PhoneIcon, Mail as MailIcon,
  Building as BuildingIcon, Smartphone
} from 'lucide-react';

export default function CadastrarProprietarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showMessage } = useMessageContext();
  
  // Verificar se o tipo foi selecionado via query params
  const tipoParam = searchParams.get('tipo') as OwnerType;
  const [tipoSelecionado, setTipoSelecionado] = useState<OwnerType | null>(null);

  useEffect(() => {
    if (!tipoParam || !['fisica', 'juridica'].includes(tipoParam)) {
      // Se não tiver tipo válido, redirecionar para listagem
      showMessage('Selecione o tipo de proprietário primeiro', 'error');
      router.push('/dashboard/proprietarios');
      return;
    }
    
    setTipoSelecionado(tipoParam);
  }, [tipoParam, router, showMessage]);

  // Handler para mudança de campo - CEP
  const handleFieldChange = async (fieldName: string, value: any) => {
    console.log('handleFieldChange:', fieldName, value);
    
    if (fieldName === 'zip_code' && value) {
      const cleanCEP = value.replace(/\D/g, '');
      
      if (cleanCEP.length === 8) {
        try {
          showMessage('Buscando CEP...', 'info');
          
          const response = await fetch(`/api/cep?cep=${cleanCEP}&country=BR`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.error) {
            showMessage(data.error, 'error');
            return {
              street: '',
              district: '',
              city: '',
              state: '',
              country: 'Brasil',
            };
          } else {
            showMessage('Endereço preenchido automaticamente!', 'success');
            
            return {
              street: data.logradouro || '',
              district: data.bairro || '',
              city: data.localidade || '',
              state: data.uf || '',
              country: data.pais || 'Brasil',
            };
          }
        } catch (error: any) {
          console.error('Erro ao buscar CEP:', error);
          showMessage(error.message || 'Erro ao buscar CEP. Tente novamente.', 'error');
          return null;
        }
      } else if (cleanCEP.length < 8) {
        return {
          street: '',
          district: '',
          city: '',
          state: '',
          country: 'Brasil',
        };
      }
    }
    return null;
  };

  // Handler para submit (create)
  const handleSubmit = async (data: any) => {
    try {
      console.log('📤 Enviando dados do proprietário...', data);
      
      // Determinar tipo baseado nos campos preenchidos
      const tipo = tipoSelecionado || (data.cpf ? 'fisica' : 'juridica');
      console.log('Tipo detectado:', tipo);
      
      // Formatar os dados baseado no tipo
      const formattedData: any = {
        name: data.name,
        internal_code: data.internal_code || null,
        addresses: [
          {
            zip_code: data.zip_code?.replace(/\D/g, ''),
            street: data.street,
            number: data.number,
            district: data.district,
            city: data.city,
            state: data.state,
            country: data.country || 'Brasil',
          }
        ],
        contacts: [
          {
            contact: data.contact_name || null,
            phone: data.phone?.replace(/\D/g, ''),
            email: data.email,
            cellphone: data.cellphone?.replace(/\D/g, '') || null,
          }
        ]
      };

      // Adicionar campos baseado no tipo
      if (tipo === 'fisica') {
        formattedData.occupation = data.occupation || null;
        formattedData.marital_status = data.marital_status || null;
        formattedData.cpf = data.cpf ? data.cpf.replace(/\D/g, '') : null;
        // Limpar campos de PJ
        formattedData.cnpj = null;
        formattedData.state_registration = null;
        formattedData.municipal_registration = null;
      } else if (tipo === 'juridica') {
        formattedData.cnpj = data.cnpj ? data.cnpj.replace(/\D/g, '') : null;
        formattedData.state_registration = data.state_registration || null;
        formattedData.municipal_registration = data.municipal_registration || null;
        // Limpar campos de PF
        formattedData.occupation = null;
        formattedData.marital_status = null;
        formattedData.cpf = null;
      }

      console.log('📊 Dados formatados para envio:', JSON.stringify(formattedData, null, 2));

      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      const response = await fetch(`${API_URL}/owners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const responseText = await response.text();
      console.log('📥 Resposta do servidor:', response.status, responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Erro ao parsear resposta:', e);
        throw new Error('Resposta inválida do servidor: ' + responseText);
      }

      if (!response.ok) {
        console.error('Erro na resposta:', result);
        if (response.status === 400 && result.errors) {
          throw new Error(`Erro de validação: ${result.errors.join(', ')}`);
        }
        if (response.status === 409) {
          if (result.message?.includes('CPF')) {
            throw new Error('CPF já cadastrado para outro proprietário');
          }
          if (result.message?.includes('CNPJ')) {
            throw new Error('CNPJ já cadastrado para outro proprietário');
          }
        }
        throw new Error(result.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return result;

    } catch (error: any) {
      console.error('❌ Erro no submit:', error);
      throw new Error(`Erro ao salvar proprietário: ${error.message}`);
    }
  };

  // Definir steps baseado no tipo
  const steps: FormStep[] = useMemo(() => {
    if (!tipoSelecionado) return [];

    const baseSteps: FormStep[] = [
      {
        title: 'Dados do Proprietário',
        icon: <User size={20} />,
        fields: [
          {
            field: 'name',
            label: tipoSelecionado === 'fisica' ? 'Nome Completo' : 'Razão Social',
            type: 'text',
            required: true,
            placeholder: tipoSelecionado === 'fisica' ? 'Nome completo' : 'Razão social da empresa',
            autoFocus: true,
            icon: <UserIcon size={20} />,
            validation: {
              minLength: 3,
              maxLength: 200,
            },
            className: 'col-span-full',
          },
          {
            field: 'internal_code',
            label: 'Código Interno',
            type: 'text',
            placeholder: 'Código interno',
            icon: <Hash size={20} />,
          },
          ...(tipoSelecionado === 'fisica' ? [
            {
              field: 'occupation',
              label: 'Profissão',
              type: 'text',
              required: true,
              placeholder: 'Profissão',
              icon: <Briefcase size={20} />,
              className: 'col-span-full',
            } as any,
            {
              field: 'marital_status',
              label: 'Estado Civil',
              type: 'text',
              required: true,
              placeholder: 'Estado civil',
              icon: <Heart size={20} />,
            } as any,
            {
              field: 'cpf',
              label: 'CPF',
              type: 'text',
              required: true,
              placeholder: '000.000.000-00',
              mask: 'cpf',
              icon: <FileText size={20} />,
            } as any,
          ] : []),
          ...(tipoSelecionado === 'juridica' ? [
            {
              field: 'cnpj',
              label: 'CNPJ',
              type: 'text',
              required: true,
              placeholder: '00.000.000/0000-00',
              mask: 'cnpj',
              icon: <FileText size={20} />,
            } as any,
            {
              field: 'state_registration',
              label: 'Inscrição Estadual',
              type: 'text',
              required: true,
              placeholder: 'Digite a inscrição estadual',
              icon: <BuildingIcon size={20} />,
            } as any,
            {
              field: 'municipal_registration',
              label: 'Inscrição Municipal',
              type: 'text',
              required: true,
              placeholder: 'Digite a inscrição municipal',
              icon: <BuildingIcon size={20} />,
            } as any,
          ] : []),
        ],
      },
      {
        title: 'Endereço',
        icon: <MapPin size={20} />,
        fields: [
          {
            field: 'zip_code',
            label: 'CEP',
            type: 'text',
            required: true,
            placeholder: '00000-000',
            mask: 'cep',
            icon: <MapPinIcon size={20} />,
            className: 'col-span-full',
          },
          {
            field: 'street',
            label: 'Rua',
            type: 'text',
            required: true,
            placeholder: 'Rua das Flores',
            icon: <MapPinIcon size={20} />,
            disabled: true,
            readOnly: true,
            className: 'col-span-full',
          },
          {
            field: 'number',
            label: 'Número',
            type: 'text',
            required: true,
            placeholder: '123',
            icon: <Hash size={20} />,
          },
          {
            field: 'district',
            label: 'Bairro',
            type: 'text',
            required: true,
            placeholder: 'Centro',
            icon: <MapPinIcon size={20} />,
            disabled: true,
            readOnly: true,
          },
          {
            field: 'city',
            label: 'Cidade',
            type: 'text',
            required: true,
            placeholder: 'São Paulo',
            icon: <MapPinIcon size={20} />,
            disabled: true,
            readOnly: true,
          },
          {
            field: 'state',
            label: 'Estado',
            type: 'text',
            required: true,
            placeholder: 'SP',
            icon: <Globe size={20} />,
            disabled: true,
            readOnly: true,
          },
          {
            field: 'country',
            label: 'País',
            type: 'text',
            required: true,
            placeholder: 'Brasil',
            defaultValue: 'Brasil',
            icon: <Globe size={20} />,
            disabled: true,
            readOnly: true,
          }
        ],
      },
      {
        title: 'Contato',
        icon: <Phone size={20} />,
        fields: [
          {
            field: 'contact_name',
            label: 'Nome do Contato',
            type: 'text',
            placeholder: 'Nome da pessoa para contato',
            icon: <UserIcon size={20} />,
            className: 'col-span-full',
          },
          {
            field: 'phone',
            label: 'Telefone',
            type: 'tel',
            placeholder: '(11) 9999-9999',
            mask: 'telefone',
            icon: <PhoneIcon size={20} />,
            className: 'col-span-full',
          },
          {
            field: 'cellphone',
            label: 'Celular',
            type: 'tel',
            placeholder: '(11) 99999-9999',
            mask: 'telefone',
            icon: <Smartphone size={20} />,
            className: 'col-span-full',
          },
          {
            field: 'email',
            label: 'E-mail',
            type: 'email',
            placeholder: 'contato@imobiliaria.com',
            icon: <MailIcon size={20} />,
            className: 'col-span-full',
          },
        ],
      },
    ];

    return baseSteps;
  }, [tipoSelecionado]);

  const onSubmitSuccess = (data: any) => {
    const message = 'Proprietário criado com sucesso!';
    showMessage(message, 'success');
    router.push('/dashboard/proprietarios');
  };

  // Se não há tipo selecionado, mostrar loading
  if (!tipoSelecionado) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <DynamicFormManager
      resource="owners"
      title="Proprietário"
      basePath="/dashboard/proprietarios"
      mode="create"
      steps={steps}
      onSubmit={handleSubmit}
      onSubmitSuccess={onSubmitSuccess}
      onFieldChange={handleFieldChange}
    />
  );
}