/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DynamicFormManager from '@/components/DynamicFormManager';
import { FormStep } from '@/types/types';
import { useMessageContext } from '@/contexts/MessageContext';
import { useRouter, useParams } from 'next/navigation';
import { 
  Home, MapPin, DollarSign, Upload, Building2, 
  Key, FileText, BedDouble, Bath, Car, Ruler, Sofa,
  HomeIcon, User, Building, DollarSign as Dollar,
  Calendar, File,
  MapPinIcon,
  Hash,
  Globe
} from 'lucide-react';


const parseMetric = (value: string) => {
  if (!value) return 0;
  const cleaned = value.replace(' m²', '').replace(' m', '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

const parseMoney = (value: string) => {
  if (!value) return 0;
  
  const cleaned = value
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

const formatMoney = (value: number | string) => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatMetricValue = (value: number | string) => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  return num.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

const isDocumentItem = (item: any): boolean => {
  return item && 
    typeof item === 'object' && 
    'file_name' in item && 
    'file_url' in item &&
    !isFileInstance(item);
};

const isFileInstance = (item: any): item is File => {
  return item && 
    typeof item === 'object' && 
    'name' in item && 
    'size' in item && 
    'type' in item;
};

export default function EditarImovelPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { user } = useAuth();
  const { showMessage } = useMessageContext();
  const router = useRouter();
  
  const [owners, setOwners] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Buscar dados para selects
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ownersRes, typesRes, agenciesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/owners`),
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/property-types`),
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/agencies`),
        ]);

        if (!ownersRes.ok || !typesRes.ok || !agenciesRes.ok) {
          throw new Error('Erro ao buscar dados iniciais');
        }

        const ownersData = await ownersRes.json();
        const typesData = await typesRes.json();
        const agenciesData = await agenciesRes.json();

        const ownersList = ownersData.data || ownersData || [];
        const typesList = typesData.data || typesData || [];
        const agenciesList = agenciesData.data || agenciesData || [];

        setOwners(ownersList);
        setPropertyTypes(typesList);
        setAgencies(agenciesList);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        showMessage('Erro ao carregar dados iniciais', 'error');
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, [showMessage]);

  // Buscar dados do imóvel
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) {
        console.error('ID do imóvel não encontrado');
        return;
      }

      try {
        setLoadingProperty(true);
        console.log('🔍 Buscando dados do imóvel ID:', id);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/properties/${id}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status} ao buscar dados do imóvel`);
        }

        const data = await response.json();
        console.log('📊 Dados recebidos do imóvel:', data);
        
        if (data.success && data.data) {
          setPropertyData(data.data);
          setCompletedSteps([0, 1, 2, 3]);
          console.log('✅ Dados do imóvel carregados com sucesso');
        } else {
          throw new Error(data.message || 'Erro ao carregar dados do imóvel');
        }
      } catch (error: any) {
        console.error('❌ Erro ao buscar dados do imóvel:', error.message);
        showMessage(`Erro ao carregar dados do imóvel: ${error.message}`, 'error');
        router.push('/dashboard/imoveis');
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchPropertyData();
  }, [id, router, showMessage]);

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

  // Função para transformar os dados da API para o formato do formulário
  const transformData = (apiResponse: any) => {
    console.log('🔄 transformData chamado com:', apiResponse);
    
    // A API retorna { success: true, data: {...}, message: ... }
    const data = apiResponse.data || apiResponse;
    
    if (!data) {
      console.error('❌ Dados não encontrados na resposta da API');
      return {};
    }
    
    console.log('📊 Dados extraídos para transformação:', data);
    
    const address = data.addresses?.[0]?.address || {};
    const values = data.values?.[0] || {};

    const getDocumentTypeName = (type: string) => {
      const typeMap: Record<string, string> = {
        'IMAGE': 'Imagem',
        'REGISTRATION': 'Matrícula',
        'PROPERTY_RECORD': 'Registro',
        'TITLE_DEED': 'Escritura',
        'OTHER': 'Outro Documento'
      };
      return typeMap[type] || type;
    };
    
    // Extrair nome do arquivo do caminho
    const extractFileName = (filePath: string) => {
      if (!filePath) return 'Arquivo';
      const parts = filePath.split('/');
      const fileNameWithTimestamp = parts[parts.length - 1];
      // Remove o timestamp (ex: 1769815258758-)
      const fileName = fileNameWithTimestamp.replace(/^\d+-/, '');
      return decodeURIComponent(fileName);
    };

    // Transformar os dados para o formato esperado pelo formulário
    const transformed = {
      // Dados básicos do imóvel
      title: data.title || '',
      bedrooms: data.bedrooms?.toString() || '',
      bathrooms: data.bathrooms?.toString() || '',
      half_bathrooms: data.half_bathrooms?.toString() || '',
      garage_spaces: data.garage_spaces?.toString() || '',
      area_total: formatMetricValue(data.area_total || ''),
      area_built: formatMetricValue(data.area_built || ''),
      frontage: formatMetricValue(data.frontage || ''),
      floor_number: data.floor_number?.toString() || '',
      tax_registration: data.tax_registration || '',
      owner_id: data.owner_id || '',
      type_id: data.type_id || '',
      agency_id: data.agency_id || '',
      furnished: data.furnished?.toString() || 'false',
      notes: data.notes || '',
      
      // Endereço
      zip_code: address.zip_code || '',
      street: address.street || '',
      number: address.number || '',
      district: address.district || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'Brasil',
      
      // Valores
      purchase_value: formatMoney(values.purchase_value || ''),
      rental_value: formatMoney(values.rental_value || ''),
      condo_fee: formatMoney(values.condo_fee || ''),
      property_tax: formatMoney(values.property_tax || ''),
      status: values.status || 'AVAILABLE',
      reference_date: values.reference_date ? values.reference_date.split('T')[0] : '',
      values_notes: values.notes || '',
      sale_value: formatMoney(values.sale_value || ''),
      extra_charges: formatMoney(values.extra_charges || ''),
      
      // Arquivos - FORMATO CORRETO baseado no retorno da API (IGUAL AO VISUALIZAR)
      arquivosImagens: data.documents
        ?.filter((doc: any) => doc.type === 'IMAGE')
        .map((doc: any) => ({
          id: doc.id,
          file_name: doc.description || extractFileName(doc.file_path),
          file_url: doc.file_path,
          type: doc.type,
          mime_type: doc.file_type,
        })) || [],
        
      arquivosMatricula: data.documents
        ?.filter((doc: any) => doc.type === 'REGISTRATION')
        .map((doc: any) => ({
          id: doc.id,
          file_name: doc.description || extractFileName(doc.file_path),
          file_url: doc.file_path,
          type: doc.type,
          mime_type: doc.file_type,
        })) || [],
        
      arquivosRegistro: data.documents
        ?.filter((doc: any) => doc.type === 'PROPERTY_RECORD')
        .map((doc: any) => ({
          id: doc.id,
          file_name: doc.description || extractFileName(doc.file_path),
          file_url: doc.file_path,
          type: doc.type,
          mime_type: doc.file_type,
        })) || [],
        
      arquivosEscritura: data.documents
        ?.filter((doc: any) => doc.type === 'TITLE_DEED')
        .map((doc: any) => ({
          id: doc.id,
          file_name: doc.description || extractFileName(doc.file_path),
          file_url: doc.file_path,
          type: doc.type,
          mime_type: doc.file_type,
        })) || [],
        
      arquivosOutros: data.documents
        ?.filter((doc: any) => 
          !['IMAGE', 'REGISTRATION', 'PROPERTY_RECORD', 'TITLE_DEED'].includes(doc.type)
        )
        .map((doc: any) => ({
          id: doc.id,
          file_name: doc.description || extractFileName(doc.file_path),
          file_url: doc.file_path,
          type: doc.type,
          mime_type: doc.file_type,
        })) || [],
    };

    console.log('✅ Dados transformados para edição:', {
      ...transformed,
      arquivosImagens: transformed.arquivosImagens.map((img: any) => ({
        ...img,
        file_url: img.file_url?.substring(0, 50) + '...'
      }))
    });
    return transformed;
  };

  const steps: FormStep[] = useMemo(() => [
    {
      title: 'Dados do Imóvel',
      icon: <Home size={20} />,
      fields: [
        {
          field: 'title',
          label: 'Nome Fantasia',
          type: 'text',
          required: true,
          placeholder: 'Nome para o imóvel',
          autoFocus: true,
          icon: <HomeIcon size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'bedrooms',
          label: 'Quartos',
          type: 'number',
          required: true,
          placeholder: 'Quantidade de quartos',
          showIncrementButtons: true,
          min: 0,
          icon: <BedDouble size={20} />,
        },
        {
          field: 'bathrooms',
          label: 'Banheiros',
          type: 'number',
          required: true,
          placeholder: 'Quantidade de banheiros',
          showIncrementButtons: true,
          min: 0,
          icon: <Bath size={20} />,
        },
        {
          field: 'half_bathrooms',
          label: 'Lavabos',
          type: 'number',
          required: true,
          placeholder: 'Quantidade de lavabos',
          showIncrementButtons: true,
          min: 0,
          icon: <Bath size={20} />,
        },
        {
          field: 'garage_spaces',
          label: 'Vagas na Garagem',
          type: 'number',
          required: true,
          placeholder: 'Quantidade de vagas',
          showIncrementButtons: true,
          min: 0,
          icon: <Car size={20} />,
        },
        {
          field: 'floor_number',
          label: 'Número do Andar',
          type: 'number',
          required: true,
          placeholder: 'Número do andar',
          showIncrementButtons: true,
          min: 0,
          icon: <Building size={20} />,
        },
        {
          field: 'area_total',
          label: 'Área Total (m²)',
          type: 'text',
          required: true,
          placeholder: 'Área total em m²',
          mask: 'metros2',
          icon: <Ruler size={20} />,
        },
        {
          field: 'area_built',
          label: 'Área Construída (m²)',
          type: 'text',
          required: true,
          placeholder: 'Área construída em m²',
          mask: 'metros2',
          icon: <Ruler size={20} />,
        },
        {
          field: 'frontage',
          label: 'Testada (m)',
          type: 'text',
          required: true,
          placeholder: 'Testada em metros',
          mask: 'metros',
          icon: <Ruler size={20} />,
        },
        {
          field: 'tax_registration',
          label: 'Registro Fiscal',
          type: 'text',
          required: true,
          placeholder: 'Número do registro fiscal',
          icon: <FileText size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'owner_id',
          label: 'Proprietário',
          type: 'select',
          required: true,
          options: loadingData 
            ? [{ label: 'Carregando...', value: '' }]
            : owners.map((owner) => ({ 
                label: owner.name || owner.trade_name || owner.legal_name || 'Sem nome', 
                value: owner.id 
              })),
          icon: <User size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'type_id',
          label: 'Tipo do imóvel',
          type: 'select',
          required: true,
          options: loadingData 
            ? [{ label: 'Carregando...', value: '' }]
            : propertyTypes.map((type) => ({ 
                label: type.description || type.name || 'Sem descrição', 
                value: type.id 
              })),
          icon: <Building2 size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'agency_id',
          label: 'Imobiliária',
          type: 'select',
          required: true,
          options: loadingData 
            ? [{ label: 'Carregando...', value: '' }]
            : agencies.map((agency) => ({ 
                label: agency.trade_name || agency.legal_name || agency.name || 'Sem nome', 
                value: agency.id 
              })),
          icon: <Building size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'furnished',
          label: 'Mobiliado',
          type: 'select',
          required: true,
          options: [
            { label: 'Sim', value: 'true' },
            { label: 'Não', value: 'false' },
          ],
          icon: <Sofa size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'notes',
          label: 'Observações',
          type: 'textarea',
          placeholder: 'Escreva detalhes não especificados anteriormente',
          rows: 3,
          icon: <FileText size={20} />,
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
      title: 'Valores e Condições',
      icon: <DollarSign size={20} />,
      fields: [
        {
          field: 'purchase_value',
          label: 'Valor do Imóvel (Compra)',
          type: 'text',
          required: true,
          placeholder: 'R$ 500.000,00',
          mask: 'money',
          icon: <Dollar size={20} />,
        },
        {
          field: 'rental_value',
          label: 'Valor Aluguel',
          type: 'text',
          required: true,
          placeholder: 'R$ 3.000,00',
          mask: 'money',
          icon: <Key size={20} />,
        },
        {
          field: 'condo_fee',
          label: 'Valor Condomínio',
          type: 'text',
          required: true,
          placeholder: 'R$ 500,00',
          mask: 'money',
          icon: <Building size={20} />,
        },
        {
          field: 'property_tax',
          label: 'Valor IPTU',
          type: 'text',
          required: true,
          placeholder: 'R$ 200,00',
          mask: 'money',
          icon: <FileText size={20} />,
        },
        {
          field: 'status',
          label: 'Status Atual',
          type: 'select',
          required: true,
          options: [
            { label: 'Disponível', value: 'AVAILABLE' },
            { label: 'Ocupado', value: 'OCCUPIED' },
          ],
          icon: <Key size={20} />,
        },
        {
          field: 'reference_date',
          label: 'Data de Referência',
          type: 'date',
          required: true,
          icon: <Calendar size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'sale_value',
          label: 'Valor de Venda',
          type: 'text',
          placeholder: 'R$ 600.000,00',
          mask: 'money',
          icon: <Dollar size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'extra_charges',
          label: 'Encargos / Custos Extras',
          type: 'text',
          placeholder: 'R$ 0,00',
          mask: 'money',
          icon: <Dollar size={20} />,
          className: 'col-span-full',
        },
        {
          field: 'values_notes',
          label: 'Observações',
          type: 'textarea',
          placeholder: 'Anotações adicionais sobre os valores',
          rows: 3,
          icon: <FileText size={20} />,
          className: 'col-span-full',
        },
      ],
    },
    {
      title: 'Mídias',
      icon: <Upload size={20} />,
      fields: [
        {
          field: 'arquivosImagens',
          label: 'Imagens',
          type: 'file',
          accept: 'image/*',
          multiple: true,
          textButton: 'Selecionar Imagens',
          placeholder: 'Nenhum arquivo selecionado',
          icon: <Upload size={20} />,
          className: 'col-span-full block w-full h-full',
          maxFiles: 20,
        },
        {
          field: 'arquivosMatricula',
          label: 'Matrícula',
          type: 'file',
          accept: '.pdf',
          multiple: false,
          textButton: 'Escolher arquivos',
          className: 'flex-1 w-full',
          placeholder: 'Nenhum arquivo selecionado',
          icon: <File size={20} />,
        },
        {
          field: 'arquivosRegistro',
          label: 'Registro',
          type: 'file',
          accept: '.pdf',
          multiple: false,
          textButton: 'Escolher arquivos',
          className: 'flex-1 w-full',
          placeholder: 'Nenhum arquivo selecionado',
          icon: <FileText size={20} />,
        },
        {
          field: 'arquivosEscritura',
          label: 'Escritura',
          type: 'file',
          accept: '.pdf',
          multiple: false,
          textButton: 'Escolher arquivos',
          className: 'flex-1 w-full',
          placeholder: 'Nenhum arquivo selecionado',
          icon: <FileText size={20} />,
        }
      ],
    },
  ], [owners, propertyTypes, agencies, loadingData]);


  const handleSubmit = async (data: any) => {
    try {
      // Criar FormData para enviar tudo junto
      const formData = new FormData();
      
      // Separar dados em 3 objetos JSON
      const propertyDataObj = {
        title: data.title,
        bedrooms: parseInt(data.bedrooms) || 0,
        bathrooms: parseInt(data.bathrooms) || 0,
        half_bathrooms: parseInt(data.half_bathrooms) || 0,
        garage_spaces: parseInt(data.garage_spaces) || 0,
        area_total: parseMetric(data.area_total),
        area_built: parseMetric(data.area_built),
        frontage: parseMetric(data.frontage),
        furnished: data.furnished === 'true',
        floor_number: parseInt(data.floor_number) || 0,
        tax_registration: data.tax_registration,
        notes: data.notes,
        owner_id: data.owner_id,
        type_id: data.type_id,
        agency_id: data.agency_id,
      };

      const addressData = {
        zip_code: data.zip_code,
        street: data.street,
        number: data.number,
        district: data.district,
        city: data.city,
        state: data.state,
        country: data.country || 'Brasil',
      };

      const valuesData = {
        purchase_value: parseMoney(data.purchase_value),
        rental_value: parseMoney(data.rental_value),
        condo_fee: parseMoney(data.condo_fee),
        property_tax: parseMoney(data.property_tax),
        status: data.status,
        notes: data.values_notes,
        reference_date: data.reference_date || new Date().toISOString().split('T')[0],
        sale_value: parseMoney(data.sale_value) || 0,
        extra_charges: parseMoney(data.extra_charges) || 0,
      };

      console.log('📊 Dados preparados para edição:', {
        propertyData: propertyDataObj,
        addressData,
        valuesData,
        userId: user?.id || ''
      });

      // Adicionar dados como JSON string
      formData.append('propertyData', JSON.stringify(propertyDataObj));
      formData.append('addressData', JSON.stringify(addressData));
      formData.append('valuesData', JSON.stringify(valuesData));
      formData.append('userId', user?.id || '');

      // Função para processar campos de arquivo e detectar remoções
      const processFileField = (fieldName: string, fieldData: any[] = []): File[] => {
        // Filtrar apenas novos arquivos (Files)
        const newFiles = fieldData.filter(item => 
          item && 
          typeof item === 'object' && 
          'name' in item && 
          'size' in item && 
          'type' in item
        ) as File[];
        
        return newFiles;
      };

      // Rastrear documentos que foram removidos
      const removedDocumentIds: string[] = [];

      // Para cada tipo de documento, verificar quais foram removidos
      const documentTypes = [
        { field: 'arquivosImagens', type: 'IMAGE' },
        { field: 'arquivosMatricula', type: 'REGISTRATION' },
        { field: 'arquivosRegistro', type: 'PROPERTY_RECORD' },
        { field: 'arquivosEscritura', type: 'TITLE_DEED' }
      ];

      documentTypes.forEach(({ field, type }) => {
        const currentDocuments = data[field] || [];
        
        // Obter documentos originais deste tipo
        const originalDocuments = (propertyData?.documents || []).filter((doc: any) => doc.type === type) || [];
        
        // Obter IDs dos documentos atuais (que não foram removidos)
        const currentDocumentIds = currentDocuments
          .filter((item: any) => 
            item && 
            typeof item === 'object' && 
            'id' in item && 
            'file_name' in item && 
            'file_url' in item
          )
          .map((doc: any) => doc.id);
        
        // Identificar documentos originais que não estão mais presentes
        const removedIds = originalDocuments
          .filter((doc: any) => !currentDocumentIds.includes(doc.id))
          .map((doc: any) => doc.id);
        
        removedDocumentIds.push(...removedIds);
      });

      // Adicionar lista de documentos removidos ao FormData
      if (removedDocumentIds.length > 0) {
        formData.append('removedDocuments', JSON.stringify(removedDocumentIds));
        console.log('🗑️ Documentos removidos:', removedDocumentIds);
      }

      // Adicionar apenas arquivos novos
      const newImages = processFileField('arquivosImagens', data.arquivosImagens);
      const newMatricula = processFileField('arquivosMatricula', data.arquivosMatricula);
      const newRegistro = processFileField('arquivosRegistro', data.arquivosRegistro);
      const newEscritura = processFileField('arquivosEscritura', data.arquivosEscritura);

      console.log('📤 Arquivos novos a enviar:', {
        imagens: newImages.length,
        matricula: newMatricula.length,
        registro: newRegistro.length,
        escritura: newEscritura.length
      });

      newImages.forEach((file: File) => {
        formData.append('arquivosImagens', file);
      });
      
      newMatricula.forEach((file: File) => {
        formData.append('arquivosMatricula', file);
      });
      
      newRegistro.forEach((file: File) => {
        formData.append('arquivosRegistro', file);
      });
      
      newEscritura.forEach((file: File) => {
        formData.append('arquivosEscritura', file);
      });

      console.log('📤 Enviando para o endpoint de atualização...');
      
      const API_URL = process.env.NEXT_PUBLIC_URL_API;
      
      // Usar o novo endpoint de update unificado
      const updateRes = await fetch(`${API_URL}/properties/update-unified/${id}`, {
        method: 'PUT',
        body: formData,
      });

      console.log('📥 Resposta recebida:', updateRes.status, updateRes.statusText);

      const responseText = await updateRes.text();
      console.log('📄 Conteúdo da resposta:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Erro ao fazer parse da resposta:', e);
        throw new Error('Resposta inválida do servidor');
      }

      if (!updateRes.ok) {
        console.error('❌ Erro da API:', result);
        
        if (updateRes.status === 400 && result.errors) {
          const validationErrors = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          throw new Error(`Erros de validação: ${validationErrors}`);
        }
        
        throw new Error(result.message || `Erro ${updateRes.status}: ${responseText}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Erro desconhecido ao atualizar imóvel');
      }

      return result.data || result;

    } catch (error: any) {
      console.error('❌ Erro no handleSubmit:', error);
      throw new Error(`Erro ao atualizar imóvel: ${error.message}`);
    }
  };

  const onSubmitSuccess = (_data: any) => {
    showMessage('Imóvel atualizado com sucesso!', 'success');
    router.push('/dashboard/imoveis');
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
    // Implemente a lógica de validação se necessário
    return true;
  };

  if (loadingData || loadingProperty) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <DynamicFormManager
      resource="properties"
      title="Imóvel"
      basePath="/dashboard/imoveis"
      mode="edit"
      id={id}
      steps={steps}
      onSubmit={handleSubmit}
      onSubmitSuccess={onSubmitSuccess}
      onFieldChange={handleFieldChange}
      transformData={transformData}
      completedSteps={completedSteps}
      onStepComplete={handleStepComplete}
      canNavigateToStep={canNavigateToStep}
    />
  );
}