/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import {
  User, MapPin, Phone, FileText, Hash,
  Briefcase, Heart, User as UserIcon,
  MapPin as MapPinIcon, Phone as PhoneIcon, Mail as MailIcon,
  Building, Globe, Smartphone
} from 'lucide-react';

export default function VisualizarInquilinoPage() {
  const params = useParams();
  const id = params.id as string;

  // Transformar dados da API para o formulário
  const transformData = (apiData: any) => {
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
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'internal_code',
          label: 'Código Interno',
          type: 'text',
          icon: <Hash size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.internal_code || formValues.internal_code.trim() === '',
        },
        // CAMPOS PF
        {
          field: 'occupation',
          label: 'Profissão',
          type: 'text',
          required: true,
          icon: <Briefcase size={20} />,
          className: 'col-span-full',
          readOnly: true,
          hidden: (formValues: any) => !formValues.occupation || formValues.occupation.trim() === '',
        },
        {
          field: 'marital_status',
          label: 'Estado Civil',
          type: 'text',
          required: true,
          icon: <Heart size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.marital_status || formValues.marital_status.trim() === '',
        },
        {
          field: 'cpf',
          label: 'CPF',
          type: 'text',
          mask: 'cpf',
          icon: <FileText size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.cpf || formValues.cpf.trim() === '',
        },
        // CAMPOS PJ
        {
          field: 'cnpj',
          label: 'CNPJ',
          type: 'text',
          mask: 'cnpj',
          icon: <FileText size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.cnpj || formValues.cnpj.trim() === '',
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          icon: <Building size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.municipal_registration || formValues.municipal_registration.trim() === '',
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          icon: <Building size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.state_registration || formValues.state_registration.trim() === '',
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
          icon: <MapPinIcon size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'number',
          label: 'Número',
          type: 'text',
          required: true,
          icon: <Hash size={20} />,
          readOnly: true,
        },
        {
          field: 'district',
          label: 'Bairro',
          type: 'text',
          required: true,
          icon: <MapPinIcon size={20} />,
          readOnly: true,
        },
        {
          field: 'city',
          label: 'Cidade',
          type: 'text',
          required: true,
          icon: <MapPinIcon size={20} />,
          readOnly: true,
        },
        {
          field: 'state',
          label: 'Estado',
          type: 'text',
          required: true,
          icon: <Globe size={20} />,
          readOnly: true,
        },
        {
          field: 'country',
          label: 'País',
          type: 'text',
          required: true,
          defaultValue: 'Brasil',
          icon: <Globe size={20} />,
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
          icon: <UserIcon size={20} />,
          className: 'col-span-full',
          readOnly: true,
          // REMOVIDO: hidden: (formValues: any) => !formValues.contact_name,
        },
        {
          field: 'phone',
          label: 'Telefone',
          type: 'tel',
          mask: 'telefone',
          icon: <PhoneIcon size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'cellphone',
          label: 'Celular',
          type: 'tel',
          mask: 'telefone',
          icon: <Smartphone size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'email',
          label: 'E-mail',
          type: 'email',
          icon: <MailIcon size={20} />,
          className: 'col-span-full',
          readOnly: true,
        },
      ],
    },
  ], []);

  return (
    <DynamicFormManager
      resource="tenants"
      title="Inquilino"
      basePath="/dashboard/inquilinos"
      mode="view"
      id={id}
      steps={steps}
      transformData={transformData}
    />
  );
}