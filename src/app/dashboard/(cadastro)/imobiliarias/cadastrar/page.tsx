/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import { useMessageContext } from '@/contexts/MessageContext';
import { useRouter } from 'next/navigation';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import {
  Building2, MapPin, Phone, FileText,
  User, Hash, Globe, Mail,
  Building, MapPin as MapPinIcon,
  Phone as PhoneIcon, Mail as MailIcon, CheckCircle,
  Smartphone
} from 'lucide-react';

export default function CadastrarImobiliariaPage() {
  const { showMessage } = useMessageContext();
  const router = useRouter();

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

  const handleSubmit = async (data: any) => {
    try {
      console.log('📤 Enviando dados da imobiliária...', data);
      
      // Formatar os dados para o endpoint
      const formattedData = {
        trade_name: data.trade_name,
        legal_name: data.legal_name,
        cnpj: data.cnpj?.replace(/\D/g, ''),
        state_registration: data.state_registration || null,
        municipal_registration: data.municipal_registration || null,
        license_number: data.license_number,
        addresses: [
          {
            zip_code: data.zip_code?.replace(/\D/g, ''),
            street: data.street,
            number: data.number,
            district: data.district,
            city: data.city,
            state: data.state,
            country: data.country || 'Brasil',
            complement: data.complement || null,
          }
        ],
        contacts: [
          {
            contact: data.contact_name || null,
            phone: data.phone?.replace(/\D/g, ''),
            cellphone: data.cellphone?.replace(/\D/g, ''), // ← NOVO CAMPO
            email: data.email,
            // REMOVIDO: whatsapp: data.whatsapp || false,
          }
        ]
      };

      console.log('📊 Dados formatados:', formattedData);

      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      const method = 'POST';
      const url = `${API_URL}/agencies`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const responseText = await response.text();
      console.log('📥 Resposta:', response.status, responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        if (response.status === 409 && result.message?.includes('CNPJ')) {
          throw new Error('CNPJ já cadastrado para outra imobiliária');
        }
        throw new Error(result.message || `Erro ${response.status}`);
      }

      return result;

    } catch (error: any) {
      console.error('❌ Erro no submit:', error);
      throw new Error(`Erro ao salvar imobiliária: ${error.message}`);
    }
  };

  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Dados da Imobiliária',
      icon: <Building2 size={20} />,
      fields: [
        {
          field: 'trade_name',
          label: 'Nome Fantasia',
          type: 'text',
          required: true,
          placeholder: 'Nome comercial da imobiliária',
          autoFocus: true,
          icon: <Building size={20} />,
          validation: {
            minLength: 3,
            maxLength: 100,
          },
          className: 'col-span-full',
        },
        {
          field: 'legal_name',
          label: 'Razão Social',
          type: 'text',
          required: true,
          placeholder: 'Nome jurídico completo',
          icon: <FileText size={20} />,
          validation: {
            minLength: 3,
            maxLength: 200,
          },
          className: 'col-span-full',
        },
        {
          field: 'cnpj',
          label: 'CNPJ',
          type: 'text',
          required: true,
          placeholder: '00.000.000/0000-00',
          mask: 'cnpj',
          icon: <Hash size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          placeholder: 'Digite a inscrição estadual',
          icon: <FileText size={20} />,
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          placeholder: 'Digite a inscrição municipal',
          icon: <FileText size={20} />,
        },
        {
          field: 'license_number',
          label: 'CRECI',
          type: 'text',
          required: true,
          placeholder: 'Número do registro CRECI',
          icon: <CheckCircle size={20} />,
          className: 'col-span-full',
        },
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
          icon: <User size={20} />,
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
  ], []);

  const onSubmitSuccess = (data: any) => {
    showMessage('Imobiliária salva com sucesso!', 'success');
    router.push('/dashboard/imobiliarias');
  };

  return (
    <DynamicFormManager
      resource="agencies"
      title="Imobiliária"
      basePath="/dashboard/imobiliarias"
      mode="create"
      steps={steps}
      onSubmit={handleSubmit}
      onSubmitSuccess={onSubmitSuccess}
      onFieldChange={handleFieldChange}
    />
  );
}