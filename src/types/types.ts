/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      created_at: string;
    };
    token: string;
    expiresIn: string;
  };
  message: string;
}

export type ColumnType = 'text' | 'date' | 'number' | 'currency' | 'boolean' | 'custom';

export interface ColumnDef {
  field: string;
  label: string;
  sortParam?: string;
  type?: ColumnType;
  formatter?: 'currency' | 'date' | 'cpfCnpj' | 'phone' | 'boolean' | 'gender' | 'address' | 'propertyStatus' | 'cep';
  nestedField?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface Option {
  label: string;
  value: string | number;
}

// Atualizar a interface FormFieldDef para aceitar função no hidden
export interface FormFieldDef {
  field: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password' | 'select' | 'textarea' | 'checkbox' | 'boolean' | 'file' | 'custom';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Option[];
  validation?: {
    pattern?: RegExp;
    patternMessage?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any, formValues: any) => string | null;
  };
  gridCols?: number;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean | ((formValues: any) => boolean); // Permitir função ou boolean
  mask?: 'cpf' | 'cnpj' | 'cep' | 'telefone' | 'money' | 'metros2' | 'metros';
  maxLength?: number;
  showIncrementButtons?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
  
  // Para tipo 'file'
  multiple?: boolean;
  accept?: string;
  buttonText?: string;
  textButton?: string;
  maxFiles?: number;
  
  // Para tipo 'number'
  min?: number;
  max?: number;
  
  // Para tipo 'textarea'
  rows?: number;

  // Para tipo 'custom'
  render?: (value: any, formValues?: any) => React.ReactNode;
}

export interface FormStep {
  title: string;
  icon?: React.ReactNode;
  fields: FormFieldDef[];
}

export interface DynamicFormConfig {
  resource: string;
  title: string;
  basePath: string;
  mode: 'create' | 'edit' | 'view';
  id?: string;
  steps?: FormStep[];
  fields?: FormFieldDef[];
  onSubmitSuccess?: (data: any) => void;
  onCancel?: () => void;
  transformData?: (data: any) => any;
  transformResponse?: (data: any) => any;
}