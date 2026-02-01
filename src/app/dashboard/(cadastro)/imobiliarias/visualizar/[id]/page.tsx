/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import {
  Building2, MapPin, Phone, FileText,
  User, Hash, Globe, Mail,
  Building, MapPin as MapPinIcon,
  Phone as PhoneIcon, Mail as MailIcon,
  Smartphone, Home
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function VisualizarImobiliariaPage() {
  const params = useParams();
  const id = params.id as string;

  const transformData = (apiData: any) => {
    console.log('🔄 Transformando dados da API:', apiData);
    
    if (!apiData) return {};
    
    const address = apiData.addresses?.[0]?.address || {};
    const contact = apiData.contacts?.[0]?.contact || {};
    
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
      contact_name: contact.contact || '',
      phone: contact.phone || '',
      cellphone: contact.cellphone || '', // ← NOVO CAMPO
      email: contact.email || '',
      // REMOVIDO: whatsapp: contact.whatsapp || false,
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
          placeholder: 'Nome comercial da imobiliária',
          autoFocus: true,
          icon: <Building size={20} />,
          validation: {
            minLength: 3,
            maxLength: 100,
          },
          className: 'col-span-full',
          readOnly: true,
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
          readOnly: true,
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
          readOnly: true,
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          placeholder: 'Digite a inscrição estadual',
          icon: <FileText size={20} />,
          readOnly: true,
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          placeholder: 'Digite a inscrição municipal',
          icon: <FileText size={20} />,
          readOnly: true,
        },
        {
          field: 'license_number',
          label: 'CRECI',
          type: 'text',
          required: true,
          placeholder: 'Número do registro CRECI',
          icon: <FileText size={20} />,
          className: 'col-span-full',
          readOnly: true,
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
          readOnly: true,
        },
        {
          field: 'street',
          label: 'Rua',
          type: 'text',
          required: true,
          placeholder: 'Rua das Flores',
          icon: <MapPinIcon size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'number',
          label: 'Número',
          type: 'text',
          required: true,
          placeholder: '123',
          icon: <Hash size={20} />,
          readOnly: true,
        },
        {
          field: 'district',
          label: 'Bairro',
          type: 'text',
          required: true,
          placeholder: 'Centro',
          icon: <MapPinIcon size={20} />,
          readOnly: true,
        },
        {
          field: 'city',
          label: 'Cidade',
          type: 'text',
          required: true,
          placeholder: 'São Paulo',
          icon: <MapPinIcon size={20} />,
          readOnly: true,
        },
        {
          field: 'state',
          label: 'Estado',
          type: 'text',
          required: true,
          placeholder: 'SP',
          icon: <Globe size={20} />,
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
          readOnly: true,
        },
        {
          field: 'complement',
          label: 'Complemento',
          type: 'text',
          placeholder: 'Apto, Sala, Bloco, etc.',
          icon: <Home size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
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
          readOnly: true,
        },
        {
          field: 'phone',
          label: 'Telefone',
          type: 'tel',
          placeholder: '(11) 9999-9999',
          mask: 'telefone',
          icon: <PhoneIcon size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'cellphone',
          label: 'Celular',
          type: 'tel',
          placeholder: '(11) 99999-9999',
          mask: 'telefone',
          icon: <Smartphone size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'email',
          label: 'E-mail',
          type: 'email',
          placeholder: 'contato@imobiliaria.com',
          icon: <MailIcon size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        // REMOVIDO: campo whatsapp
      ],
    },
  ], []);

  return (
    <DynamicFormManager
      resource="agencies"
      title="Imobiliária"
      basePath="/dashboard/imobiliarias"
      mode="view"
      id={id}
      steps={steps}
      transformData={transformData}
    />
  );
}