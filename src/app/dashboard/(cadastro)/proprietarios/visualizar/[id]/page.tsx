/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import {
  User, MapPin, Phone, FileText, Hash,
  Briefcase, Heart, Globe,
  User as UserIcon, MapPin as MapPinIcon,
  Phone as PhoneIcon, Mail as MailIcon,
  Building as BuildingIcon, Smartphone
} from 'lucide-react';

export default function VisualizarProprietarioPage() {
  const params = useParams();
  const id = params.id as string;

  // Transformar dados da API para o formulário
  const transformData = (apiData: any) => {
    console.log('🔄 Transformando dados da API (visualização):', apiData);
    
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

    console.log('📋 Dados transformados:', transformed);
    return transformed;
  };

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
          autoFocus: false,
          icon: <UserIcon size={20} />,
          validation: {
            minLength: 3,
            maxLength: 200,
          },
          className: 'col-span-full',
          readOnly: true,
        },
        {
          field: 'internal_code',
          label: 'Código Interno',
          type: 'text',
          placeholder: 'Código interno',
          icon: <Hash size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.internal_code || formValues.internal_code.trim() === '',
        },
        {
          field: 'occupation',
          label: 'Profissão',
          type: 'text',
          placeholder: 'Profissão',
          icon: <Briefcase size={20} />,
          className: 'col-span-full',
          readOnly: true,
          hidden: (formValues: any) => !formValues.occupation || formValues.occupation.trim() === '',
        },
        {
          field: 'marital_status',
          label: 'Estado Civil',
          type: 'text',
          placeholder: 'Estado civil',
          icon: <Heart size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.marital_status || formValues.marital_status.trim() === '',
        },
        {
          field: 'cpf',
          label: 'CPF',
          type: 'text',
          placeholder: '000.000.000-00',
          mask: 'cpf',
          icon: <FileText size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.cpf || formValues.cpf.trim() === '',
        },
        {
          field: 'cnpj',
          label: 'CNPJ',
          type: 'text',
          placeholder: '00.000.000/0000-00',
          mask: 'cnpj',
          icon: <FileText size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.cnpj || formValues.cnpj.trim() === '',
        },
        {
          field: 'state_registration',
          label: 'Inscrição Estadual',
          type: 'text',
          placeholder: 'Digite a inscrição estadual',
          icon: <BuildingIcon size={20} />,
          readOnly: true,
          hidden: (formValues: any) => !formValues.state_registration || formValues.state_registration.trim() === '',
        },
        {
          field: 'municipal_registration',
          label: 'Inscrição Municipal',
          type: 'text',
          placeholder: 'Digite a inscrição municipal',
          icon: <BuildingIcon size={20} />,
          readOnly: true,
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
          readOnly: true,
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
      ],
    },
  ], []);

  return (
    <DynamicFormManager
      resource="owners"
      title="Proprietário"
      basePath="/dashboard/proprietarios"
      mode="view"
      id={id}
      steps={steps}
      transformData={transformData}
    />
  );
}