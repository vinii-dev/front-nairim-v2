export type OwnerType = 'fisica' | 'juridica';

export interface OwnerFormData {
  tipo?: OwnerType;
  name: string;
  internal_code?: string;
  occupation?: string;
  marital_status?: string;
  cpf?: string;
  cnpj?: string;
  state_registration?: string;
  municipal_registration?: string;
  addresses?: Array<{
    zip_code: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    country?: string;
  }>;
  contacts?: Array<{
    contact: string;
    phone: string;
    email?: string;
    whatsapp?: boolean;
  }>;
}
