/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useMessageContext } from '@/contexts/MessageContext';
import { useRouter } from 'next/navigation';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import {
  User, MapPin, Phone, FileText, Hash,
  Home, Mail, Briefcase, Heart, User as UserIcon,
  MapPin as MapPinIcon, Phone as PhoneIcon, Mail as MailIcon,
  Building, Globe, Home as HomeIcon, Calendar,
  Smartphone
} from 'lucide-react';

export default function InquilinoFormPage() {
  const params = useParams();
  const id = params.id as string | undefined;

  const { showMessage } = useMessageContext();
  const router = useRouter();

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
      console.log('📤 Enviando dados do inquilino...', data);
      
      // Formatar os dados para o endpoint
      const formattedData = {
        name: data.name,
        internal_code: data.internal_code || null,
        occupation: data.occupation,
        marital_status: data.marital_status,
        cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : null,
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
        municipal_registration: data.municipal_registration || null,
        state_registration: data.state_registration || null,
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
            email: data.email,
            cellphone: data.cellphone?.replace(/\D/g, '') || null,
          }
        ]
      };

      console.log('📊 Dados formatados:', formattedData);

      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      
        const response = await fetch(`${API_URL}/tenants`, {
          method: 'POST',
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
          if (response.status === 409) {
            if (result.message?.includes('CPF')) {
              throw new Error('CPF já cadastrado para outro inquilino');
            }
            if (result.message?.includes('CNPJ')) {
              throw new Error('CNPJ já cadastrado para outro inquilino');
            }
          }
          throw new Error(result.message || `Erro ${response.status}`);
        }

        return result;


    } catch (error: any) {
      console.error('❌ Erro no submit:', error);
      throw new Error(`Erro ao salvar inquilino: ${error.message}`);
    }
  };

  // Transformar dados da API para o formulário
  const transformData = (apiData: any) => {
    console.log('🔄 Transformando dados da API (inquilino):', apiData);
    
    if (!apiData) return {};
    
    const address = apiData.addresses?.[0]?.address || {};
    const contact = apiData.contacts?.[0]?.contact || {};
    
    return {
      name: apiData.name || '',
      internal_code: apiData.internal_code || '',
      occupation: apiData.occupation || '',
      marital_status: apiData.marital_status || '',
      cnpj: apiData.cnpj || '',
      cpf: apiData.cpf || '',
      municipal_registration: apiData.municipal_registration || '',
      state_registration: apiData.state_registration || '',
      zip_code: address.zip_code || '',
      street: address.street || '',
      number: address.number || '',
      district: address.district || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'Brasil',
      complement: address.complement || '',
      contact_name: contact.contact || '',
      phone: contact.phone || '',
      cellphone: contact.cellphone || '',
      email: contact.email || '',
    };
  };

  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Dados do Inquilino',
      icon: <User size={20} />,
      fields: [
        {
          field: 'name',
          label: 'Nome',
          type: 'text',
          required: true,
          placeholder: 'Nome completo do inquilino',
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
          placeholder: 'Código interno do inquilino',
          icon: <Hash size={20} />,
        },
        {
          field: 'occupation',
          label: 'Profissão',
          type: 'text',
          required: true,
          placeholder: 'Profissão do inquilino',
          icon: <Briefcase size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'marital_status',
          label: 'Estado Civil',
          type: 'text',
          required: true,
          placeholder: 'Estado civil do inquilino',
          icon: <Heart size={20} />,
        },
        {
          field: 'cpf',
          label: 'CPF',
          type: 'text',
          placeholder: '000.000.000-00',
          mask: 'cpf',
          icon: <FileText size={20} />,
        },
        {
          field: 'cnpj',
          label: 'CNPJ',
          type: 'text',
          placeholder: '00.000.000/0000-00',
          mask: 'cnpj',
          icon: <FileText size={20} />,
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          placeholder: 'Digite a inscrição municipal',
          icon: <Building size={20} />,
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          placeholder: 'Digite a inscrição estadual',
          icon: <Building size={20} />,
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
    const message = 'Inquilino criado com sucesso!';
    showMessage(message, 'success');
    router.push('/dashboard/inquilinos');
  };

  return (
    <DynamicFormManager
      resource="tenants"
      title="Inquilino"
      basePath="/dashboard/inquilinos"
      mode={'create'}
      id={id}
      steps={steps}
      onSubmit={handleSubmit}
      onSubmitSuccess={onSubmitSuccess}
      onFieldChange={handleFieldChange}
      transformData={transformData}
    />
  );
}