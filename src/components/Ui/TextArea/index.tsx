// src/components/Ui/TextArea/index.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface TextAreaProps {
  id: string;
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  svg?: React.ReactNode;
  tabIndex?: number;
  disabled?: boolean;
  rows?: number;
  error?: string;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean; // Nova propriedade para auto-focus
}

export default function TextArea({
  id,
  label,
  required = false,
  value = '',
  onChange,
  placeholder,
  svg,
  tabIndex,
  disabled = false,
  rows = 3,
  error,
  className = '',
  maxLength,
  autoFocus = false, // Nova propriedade
  ...props
}: TextAreaProps) {
  const [currentLength, setCurrentLength] = useState(value.length);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Efeito para auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Atualizar contador quando value muda
  useEffect(() => {
    setCurrentLength(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (maxLength && e.target.value.length > maxLength) {
      return;
    }
    if (onChange) {
      onChange(e);
    }
    setCurrentLength(e.target.value.length);
  };

  return (
    <div className="flex flex-col w-full">
      <label htmlFor={id} className="flex items-center gap-2 mb-2">
        {svg && <span className="text-[#666666]">{svg}</span>}
        <span className="text-[14px] font-medium text-[#111111B2]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          tabIndex={tabIndex}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 border-2 rounded-lg
            text-[14px] font-normal text-[#111111B2]
            placeholder:text-[#CCCCCC]
            resize-none focus:outline-none
            transition-all duration-200
            pr-20
            ${disabled 
              ? 'bg-[#EDEDED] border-[#CCCCCC] cursor-not-allowed text-[#666666]' 
              : 'bg-white border-[#CCCCCC] hover:border-[#999999] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6] focus:ring-opacity-30'
            }
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Contador de caracteres dentro do textarea */}
        {maxLength && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            <span className={`
              text-[14px] font-medium
              ${currentLength > maxLength 
                ? 'text-red-500' 
                : currentLength > maxLength * 0.8 
                  ? 'text-amber-500' 
                  : 'text-[#666666]'
              }
            `}>
              {currentLength}
            </span>
            <span className="text-[14px] text-[#666666]">/</span>
            <span className="text-[14px] text-[#666666]">{maxLength}</span>
          </div>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <p className="text-[12px] text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}