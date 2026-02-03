const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-nairim-v2-production.up.railway.app';

export interface ApiResponse<T> {
  items: ApiResponse<Property>;
  properties: ApiResponse<Property>;
  count: number;
  success: ApiResponse<Property>;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  status?: string;
  type_id?: string;
  min_price?: number;
  max_price?: number;
  city?: string;
  bedrooms?: number;
  furnished?: boolean;
  agency_id?: string;
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