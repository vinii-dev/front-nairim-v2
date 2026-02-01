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
  Briefcase, Heart, Globe,
  User as UserIcon, MapPin as MapPinIcon,
  Phone as PhoneIcon, Mail as MailIcon,
  Building as BuildingIcon, Smartphone
} from 'lucide-react';

export default function EditarProprietarioPage() {
  const params = useParams();
  const id = params.id as string;
  
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

  // Handler para submit (edit)
  const handleSubmit = async (data: any) => {
    try {
      console.log('✏️ Atualizando proprietário...', data);
      
      // Determinar tipo baseado nos campos preenchidos
      const tipo = data.cpf ? 'fisica' : 'juridica';
      console.log('Tipo detectado para edição:', tipo);
      
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

      console.log('📊 Dados formatados para edição:', JSON.stringify(formattedData, null, 2));

      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      const response = await fetch(`${API_URL}/owners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const responseText = await response.text();
      console.log('📥 Resposta da edição:', response.status, responseText);

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
      console.error('❌ Erro na edição:', error);
      throw new Error(`Erro ao atualizar proprietário: ${error.message}`);
    }
  };

  // Transformar dados da API para o formulário
  const transformData = (apiData: any) => {
    console.log('🔄 Transformando dados da API (edição):', apiData);
    
    if (!apiData) return {};
    
    const address = apiData.addresses?.[0]?.address || {};
    const contact = apiData.contacts?.[0]?.contact || {};
    
    const transformed = {
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
      contact_name: contact.contact || '',
      phone: contact.phone || '',
      cellphone: contact.cellphone || '',
      email: contact.email || '',
    };

    console.log('📋 Dados transformados para edição:', transformed);
    return transformed;
  };

  // Definir steps - IMPORTANTE: manter a lógica de hidden para campos vazios
  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Dados do Proprietário',
      icon: <User size={20} />,
      fields: [
        {
          field: 'name',
          label: 'Nome/Razão Social',
          type: 'text',
          required: true,
          placeholder: 'Nome ou razão social',
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
          hidden: (formValues: any) => !formValues.internal_code || formValues.internal_code.trim() === '',
        },
        {
          field: 'occupation',
          label: 'Profissão',
          type: 'text',
          placeholder: 'Profissão',
          icon: <Briefcase size={20} />,
          className: 'col-span-full',
          hidden: (formValues: any) => !formValues.occupation || formValues.occupation.trim() === '',
        },
        {
          field: 'marital_status',
          label: 'Estado Civil',
          type: 'text',
          placeholder: 'Estado civil',
          icon: <Heart size={20} />,
          hidden: (formValues: any) => !formValues.marital_status || formValues.marital_status.trim() === '',
        },
        {
          field: 'cpf',
          label: 'CPF',
          type: 'text',
          placeholder: '000.000.000-00',
          mask: 'cpf',
          icon: <FileText size={20} />,
          hidden: (formValues: any) => !formValues.cpf || formValues.cpf.trim() === '',
        },
        {
          field: 'cnpj',
          label: 'CNPJ',
          type: 'text',
          placeholder: '00.000.000/0000-00',
          mask: 'cnpj',
          icon: <FileText size={20} />,
          hidden: (formValues: any) => !formValues.cnpj || formValues.cnpj.trim() === '',
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          placeholder: 'Digite a inscrição estadual',
          icon: <BuildingIcon size={20} />,
          hidden: (formValues: any) => !formValues.state_registration || formValues.state_registration.trim() === '',
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          placeholder: 'Digite a inscrição municipal',
          icon: <BuildingIcon size={20} />,
          hidden: (formValues: any) => !formValues.municipal_registration || formValues.municipal_registration.trim() === '',
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
          icon: <UserIcon size={20} />,
          className: 'col-span-full',
          hidden: (formValues: any) => !formValues.contact_name || formValues.contact_name.trim() === '',
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
    showMessage('Proprietário atualizado com sucesso!', 'success');
    router.push('/dashboard/proprietarios');
  };

  return (
    <DynamicFormManager
      resource="owners"
      title="Proprietário"
      basePath="/dashboard/proprietarios"
      mode="edit"
      id={id}
      steps={steps}
      onSubmit={handleSubmit}
      onSubmitSuccess={onSubmitSuccess}
      onFieldChange={handleFieldChange}
      transformData={transformData}
    />
  );
}