const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-nairim-v2-production.up.railway.app';

export interface ApiResponse<T> {
  items?: T[];
  properties?: T[];
  count?: number;
  success?: boolean;
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  [key: string]: any; // Permite propriedades adicionais
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  half_bathrooms: number;
  garage_spaces: number;
  area_total: number;
  area_built: number;
  frontage: number;
  furnished: boolean;
  floor_number: number;
  tax_registration: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  owner_id: string;
  type_id: string;
  agency_id: string;
  address: {
    id: string;
    zip_code: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    country: string;
  };
  values: {
    purchase_value: number;
    rental_value: number;
    condo_fee: number;
    property_tax: number;
    status: 'AVAILABLE' | 'RENTED' | 'SOLD' | 'MAINTENANCE';
    notes?: string;
    reference_date: string;
  };
  documents?: Array<{
    id: string;
    url: string;
    type: string;
    filename: string;
  }>;
  // Campos adicionais para suportar a estrutura atual dos componentes
  type?: {
    id: string;
    description: string;
    name?: string;
  };
  property_type?: string;
  images?: string[];
  photos?: string[];
  rental_value?: number;
  sale_value?: number;
  condo_fee?: number;
  has_condominium?: boolean;
  garage?: number;
  parking_spaces?: number;
  area?: number;
  land_area?: number;
  suites?: number;
  year_built?: number;
  construction_year?: number;
  garden?: boolean;
  has_garden?: boolean;
  pool?: boolean;
  has_pool?: boolean;
  barbecue?: boolean;
  has_barbecue?: boolean;
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  status?: string;
  property_type?: string;
  transaction_type?: string;
  min_price?: number;
  max_price?: number;
  city?: string;
  state?: string;
  district?: string;
  zip_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  garage_spaces?: number;
  garage?: number;
  min_area?: number;
  max_area?: number;
  furnished?: boolean;
  search?: string;
  // Novos campos para suportar filtros adicionais
  floor?: number;
  lavabo?: number;
  facade_condition?: string;
  available_from?: string;
}

export const propertyService = {
  async getAllProperties(filters: PropertyFilters = {}): Promise<ApiResponse<Property>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Adiciona parâmetros de filtro
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `${API_URL}/properties?${queryParams}`;
      console.log('Fetching properties from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Erro ao buscar propriedades: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Error in getAllProperties:', error);
      throw error;
    }
  },
  
  async getPropertyById(id: string): Promise<Property> {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar propriedade');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  },
  
  async getPropertyDocuments(propertyId: string) {
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}/documents`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar documentos da propriedade');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getPropertyDocuments:', error);
      throw error;
    }
  },
  
  async getPropertyTypes() {
    try {
      const response = await fetch(`${API_URL}/property-types`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar tipos de propriedade');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getPropertyTypes:', error);
      throw error;
    }
  }
};