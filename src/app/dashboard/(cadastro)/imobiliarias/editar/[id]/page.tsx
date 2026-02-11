/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import { useMessageContext } from '@/contexts/MessageContext';
import { useParams, useRouter } from 'next/navigation';
import DynamicFormManager from '@/components/DynamicFormManager';
import ContactManager from '@/components/ContactManager';
import { FormStep } from '@/types/types';
import {
  Building2, MapPin, Phone, FileText,
  Hash, Globe, Building, MapPin as MapPinIcon, CheckCircle
} from 'lucide-react';

export default function EditarImobiliariaPageClient() {
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
          showMessage(error.message || 'Erro ao buscar CEP.', 'error');
          return null;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (data: any) => {
    try {
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
        contacts: data.contacts?.map((c: any) => ({
            contact: c.contact || null,
            phone: c.phone?.replace(/\D/g, '') || null,
            email: c.email || null,
            cellphone: c.cellphone?.replace(/\D/g, '') || null,
        })) || []
      };

      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      const response = await fetch(`${API_URL}/agencies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 && result.message?.includes('CNPJ')) {
          throw new Error('CNPJ já cadastrado para outra imobiliária');
        }
        throw new Error(result.message || `Erro ${response.status}`);
      }

      return result;

    } catch (error: any) {
      throw new Error(`Erro ao atualizar imobiliária: ${error.message}`);
    }
  };

  const transformData = (apiData: any) => {
    if (!apiData) return {};
    const address = apiData.addresses?.[0]?.address || {};
    
    return {
      trade_name: apiData.trade_name || '',
      legal_name: apiData.legal_name || '',
      cnpj: apiData.cnpj || '',
      state_registration: apiData.state_registration || '',
      municipal_registration: apiData.municipal_registration || '',
      license_number: apiData.license_number || '',
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
      title: 'Dados da Imobiliária',
      icon: <Building2 size={20} />,
      fields: [
        {
          field: 'trade_name',
          label: 'Nome Fantasia',
          type: 'text',
          required: true,
          placeholder: 'Nome comercial',
          autoFocus: true,
          icon: <Building size={20} />,
          validation: { minLength: 3, maxLength: 100 },
          className: 'col-span-full',
        },
        {
          field: 'legal_name',
          label: 'Razão Social',
          type: 'text',
          required: true,
          placeholder: 'Nome jurídico',
          icon: <FileText size={20} />,
          validation: { minLength: 3, maxLength: 200 },
          className: 'col-span-full',
        },
        {
          field: 'cnpj',
          label: 'CNPJ',
          type: 'text',
          required: true,
          mask: 'cnpj',
          icon: <Hash size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          icon: <FileText size={20} />,
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          icon: <FileText size={20} />,
        },
        {
          field: 'license_number',
          label: 'CRECI',
          type: 'text',
          required: true,
          icon: <CheckCircle size={20} />,
          className: 'col-span-full',
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
              resourceType="agencies"
            />
          )
        }
      ],
    },
  ], []);

  const onSubmitSuccess = () => {
    showMessage('Imobiliária atualizada com sucesso!', 'success');
    router.push('/dashboard/imobiliarias');
  };

  return (
    <DynamicFormManager
      resource="agencies"
      title="Imobiliária"
      basePath="/dashboard/imobiliarias"
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