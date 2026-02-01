/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useMultiStepForm.ts
import { FormFieldDef, FormStep } from '@/types/types';
import { useState, useEffect } from 'react';

interface UseMultiStepFormProps {
  steps?: FormStep[];
  fields?: FormFieldDef[];
  mode: 'create' | 'edit' | 'view';
  transformData?: (data: any) => any;
  fetchedData?: any;
}

export function useMultiStepForm({
  steps,
  fields,
  mode,
  transformData,
  fetchedData
}: UseMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepValidations, setStepValidations] = useState<boolean[]>([]);

  // Determinar os campos atuais
  const currentFields = steps ? steps[currentStep]?.fields : fields || [];

  // Inicializar valores do formulário
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    
    const allFields = steps ? steps.flatMap(step => step.fields) : fields || [];
    
    allFields.forEach(field => {
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
  }, [steps, fields]);

  // Atualizar com dados buscados
  useEffect(() => {
    if (fetchedData && mode !== 'create') {
      const dataToUse = transformData ? transformData(fetchedData) : fetchedData;
      
      const updatedValues: Record<string, any> = {};
      const allFields = steps ? steps.flatMap(step => step.fields) : fields || [];
      
      allFields.forEach(field => {
        const value = dataToUse[field.field];
        if (value !== undefined) {
          updatedValues[field.field] = value;
        }
      });
      
      setFormValues(prev => ({ ...prev, ...updatedValues }));
    }
  }, [fetchedData, mode, transformData, steps, fields]);

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

  // Validar etapa atual
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    currentFields.forEach(field => {
      if (field.hidden) return;
      
      const error = validateField(field, formValues[field.field]);
      if (error) {
        newErrors[field.field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar todas as etapas
  const validateAllSteps = (): boolean => {
    const allFields = steps ? steps.flatMap(step => step.fields) : fields || [];
    const newErrors: Record<string, string> = {};
    
    allFields.forEach(field => {
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

  // Navegar para próxima etapa
  const nextStep = (): boolean => {
    if (!steps) return true;
    
    if (validateCurrentStep()) {
      const newValidations = [...stepValidations];
      newValidations[currentStep] = true;
      setStepValidations(newValidations);
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        return true;
      }
    }
    return false;
  };

  // Navegar para etapa anterior
  const prevStep = () => {
    if (steps && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    formValues,
    errors,
    currentFields,
    allFields: steps ? steps.flatMap(step => step.fields) : fields || [],
    steps: steps || [],
    hasSteps: !!steps,
    validateCurrentStep,
    validateAllSteps,
    handleChange,
    nextStep,
    prevStep,
    setFormValues,
  };
}