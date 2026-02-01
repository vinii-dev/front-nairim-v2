/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDynamicForm.ts
import { FormFieldDef } from '@/types/types';
import { useState, useEffect } from 'react';

interface UseDynamicFormProps {
  resource: string;
  id?: string;
  fields: FormFieldDef[];
  mode: 'create' | 'edit' | 'view';
  transformData?: (data: any) => any;
}

export function useDynamicForm({ resource, id, fields, mode, transformData }: UseDynamicFormProps) {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData, setInitialData] = useState<any>(null);

  // Inicializar valores do formulário
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialValues[field.field] = field.defaultValue;
      } else {
        switch (field.type) {
          case 'checkbox':
          case 'boolean':
            initialValues[field.field] = false;
            break;
          case 'number':
            initialValues[field.field] = 0;
            break;
          default:
            initialValues[field.field] = '';
        }
      }
    });
    setFormValues(initialValues);
  }, [fields]);

  // Buscar dados para edição/visualização
  useEffect(() => {
    if (mode !== 'create' && id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/${resource}/${id}`);
          
          if (!response.ok) {
            throw new Error('Erro ao buscar dados');
          }

          const data = await response.json();
          setInitialData(data);

          // Transformar dados se necessário
          const formData = transformData ? transformData(data) : data;
          
          const newValues = { ...formValues };
          fields.forEach(field => {
            const value = formData[field.field];
            if (value !== undefined) {
              newValues[field.field] = value;
            }
          });
          
          setFormValues(newValues);

        } catch (error) {
          console.error(`Erro ao buscar dados de ${resource}:`, error);
          throw error;
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [mode, id, resource]);

  // Validar campo
  const validateField = (field: FormFieldDef, value: any): string | null => {
    if (field.hidden || field.disabled) return null;
    
    if (field.required && (value === '' || value === null || value === undefined)) {
      return `${field.label} é obrigatório`;
    }

    if (value && value.toString().trim() !== '') {
      if (field.validation?.pattern && !field.validation.pattern.test(value.toString())) {
        return field.validation.patternMessage || 'Formato inválido';
      }

      if (field.validation?.minLength && value.toString().length < field.validation.minLength) {
        return `Mínimo ${field.validation.minLength} caracteres`;
      }

      if (field.validation?.maxLength && value.toString().length > field.validation.maxLength) {
        return `Máximo ${field.validation.maxLength} caracteres`;
      }

      if (field.validation?.custom) {
        const customError = field.validation.custom(value, formValues);
        if (customError) return customError;
      }

      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Email inválido';
      }

      if (field.field === 'password_confirm' && value !== formValues['password']) {
        return 'As senhas não coincidem';
      }
    }

    return null;
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.hidden) return;
      
      const error = validateField(field, formValues[field.field]);
      if (error) {
        newErrors[field.field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar valor do campo
  const handleChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Limpar erro ao digitar
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  return {
    loading,
    formValues,
    errors,
    initialData,
    validateForm,
    handleChange,
    setFormValues,
    setLoading,
  };
}