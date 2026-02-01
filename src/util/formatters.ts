export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const formatGender = (gender: string): string => {
  switch (gender) {
    case 'MALE': return 'Masculino';
    case 'FEMALE': return 'Feminino';
    case 'OTHER': return 'Outro';
    default: return gender;
  }
};

export const formatRole = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'Administrador';
    case 'DEFAULT': return 'Padrão';
    default: return role;
  }
};

export const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num);
};

export const formatCPFCNPJ = (value: string) => {
  if (!value) return '-';
  
  // Remove caracteres não numéricos
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length === 11) {
    // Formato CPF: 000.000.000-00
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanValue.length === 14) {
    // Formato CNPJ: 00.000.000/0000-00
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return value;
};

export const formatPhone = (value: string) => {
  if (!value) return '-';
  
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length === 11) {
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanValue.length === 10) {
    return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return value;
};

export const formatBoolean = (value: boolean) => {
  return value ? 'Sim' : 'Não';
};

export const formatCEP = (cep: string): string => {
  if (!cep) return '-';
  
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');
  
  // Formata no padrão XXXXX-XXX
  if (cleanCep.length === 8) {
    return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  // Se não tiver 8 dígitos, retorna o valor original
  return cep;
};