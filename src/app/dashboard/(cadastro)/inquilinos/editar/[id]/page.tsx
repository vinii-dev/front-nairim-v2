/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useMessageContext } from '@/contexts/MessageContext';
import { useRouter } from 'next/navigation';
import DynamicFormManager from '@/components/DynamicFormManager';
import ContactManager from '@/components/ContactManager';
import { FormStep } from '@/types/types';
import {
  User, MapPin, Phone, FileText, Hash,
  Briefcase, Heart, User as UserIcon,
  MapPin as MapPinIcon,
  Building as BuildingIcon, Globe
} from 'lucide-react';

export default function EditarInquilinoPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { showMessage } = useMessageContext();
  const router = useRouter();

  const handleFieldChange = async (fieldName: string, value: any) => {
    if (fieldName === 'zip_code' && value) {
      const cleanCEP = value.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        try {
          showMessage('Buscando CEP...', 'info');
          const response = await fetch(`/api/cep?cep=${cleanCEP}&country=BR`);
          if (!response.ok) throw new Error(`Erro ${response.status}`);
          const data = await response.json();
          if (data.error) {
            showMessage(data.error, 'error');
            return null;
          } else {
            showMessage('Endereço atualizado!', 'success');
            return {
              street: data.logradouro || '',
              district: data.bairro || '',
              city: data.localidade || '',
              state: data.uf || '',
              country: data.pais || 'Brasil',
            };
          }
        } catch (error: any) {
          showMessage(error.message || 'Erro ao buscar CEP.', 'error');
          return null;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (data: any) => {
    try {
      const tipo = data.cpf ? 'fisica' : 'juridica';
      
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
            complement: data.complement || null,
          }
        ],
        contacts: data.contacts?.map((c: any) => ({
            contact: c.contact || null,
            phone: c.phone?.replace(/\D/g, '') || null,
            email: c.email || null,
            cellphone: c.cellphone?.replace(/\D/g, '') || null,
        })) || []
      };

      if (tipo === 'fisica') {
        formattedData.occupation = data.occupation || null;
        formattedData.marital_status = data.marital_status || null;
        formattedData.cpf = data.cpf ? data.cpf.replace(/\D/g, '') : null;
        formattedData.cnpj = null;
        formattedData.state_registration = null;
        formattedData.municipal_registration = null;
      } else {
        formattedData.cnpj = data.cnpj ? data.cnpj.replace(/\D/g, '') : null;
        formattedData.state_registration = data.state_registration || null;
        formattedData.municipal_registration = data.municipal_registration || null;
        formattedData.occupation = null;
        formattedData.marital_status = null;
        formattedData.cpf = null;
      }

      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      const response = await fetch(`${API_URL}/tenants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          if (result.message?.includes('CPF')) throw new Error('CPF já cadastrado');
          if (result.message?.includes('CNPJ')) throw new Error('CNPJ já cadastrado');
        }
        throw new Error(result.message || `Erro ${response.status}`);
      }

      return result;

    } catch (error: any) {
      throw new Error(`Erro ao atualizar: ${error.message}`);
    }
  };

  const transformData = (apiData: any) => {
    if (!apiData) return {};
    const address = apiData.addresses?.[0]?.address || {};
    
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
      contacts: apiData.contacts?.map((c: any) => ({
        contact: c.contact?.contact || c.contact || '', 
        phone: c.contact?.phone || c.phone || '',
        cellphone: c.contact?.cellphone || c.cellphone || '',
        email: c.contact?.email || c.email || '',
      })) || []
    };
  };

  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Dados do Inquilino',
      icon: <User size={20} />,
      fields: [
        {
          field: 'name',
          label: 'Nome/Razão Social',
          type: 'text',
          required: true,
          placeholder: 'Nome',
          icon: <UserIcon size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'internal_code',
          label: 'Código Interno',
          type: 'text',
          icon: <Hash size={20} />,
          hidden: (formValues: any) => !formValues.internal_code || formValues.internal_code.trim() === '',
        },
        {
          field: 'occupation',
          label: 'Profissão',
          type: 'text',
          icon: <Briefcase size={20} />,
          className: 'col-span-full',
          hidden: (formValues: any) => !formValues.occupation,
        },
        {
          field: 'marital_status',
          label: 'Estado Civil',
          type: 'text',
          icon: <Heart size={20} />,
          hidden: (formValues: any) => !formValues.marital_status,
        },
        {
          field: 'cpf',
          label: 'CPF',
          type: 'text',
          mask: 'cpf',
          icon: <FileText size={20} />,
          hidden: (formValues: any) => !formValues.cpf,
        },
        {
          field: 'cnpj',
          label: 'CNPJ',
          type: 'text',
          mask: 'cnpj',
          icon: <FileText size={20} />,
          hidden: (formValues: any) => !formValues.cnpj,
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          icon: <BuildingIcon size={20} />,
          hidden: (formValues: any) => !formValues.state_registration,
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          icon: <BuildingIcon size={20} />,
          hidden: (formValues: any) => !formValues.municipal_registration,
        },
      ],
    },
    {
      title: 'Endereço',
      icon: <MapPin size={20} />,
      fields: [
        { field: 'zip_code', label: 'CEP', type: 'text', required: true, mask: 'cep', icon: <MapPinIcon size={20} />, className: 'col-span-full' },
        { field: 'street', label: 'Rua', type: 'text', required: true, icon: <MapPinIcon size={20} />, disabled: true, readOnly: true, className: 'col-span-full' },
        { field: 'number', label: 'Número', type: 'text', required: true, icon: <Hash size={20} /> },
        { field: 'complement', label: 'Complemento', type: 'text', icon: <Hash size={20} /> },
        { field: 'district', label: 'Bairro', type: 'text', required: true, icon: <MapPinIcon size={20} />, disabled: true, readOnly: true },
        { field: 'city', label: 'Cidade', type: 'text', required: true, icon: <MapPinIcon size={20} />, disabled: true, readOnly: true },
        { field: 'state', label: 'Estado', type: 'text', required: true, icon: <Globe size={20} />, disabled: true, readOnly: true },
        { field: 'country', label: 'País', type: 'text', required: true, defaultValue: 'Brasil', icon: <Globe size={20} />, disabled: true, readOnly: true }
      ],
    },
    {
      title: 'Contatos',
      icon: <Phone size={20} />,
      fields: [
        {
          field: 'contacts',
          label: 'Lista de Contatos',
          type: 'custom',
          className: 'col-span-full',
          render: (value: any, formValues: any, onChange: any) => (
            <ContactManager 
              value={value} 
              onChange={onChange} 
              resourceType="tenants"
            />
          )
        }
      ],
    },
  ], []);

  const onSubmitSuccess = () => {
    showMessage('Inquilino atualizado com sucesso!', 'success');
    router.push('/dashboard/inquilinos');
  };

  return (
    <DynamicFormManager
      resource="tenants"
      title="Inquilino"
      basePath="/dashboard/inquilinos"
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