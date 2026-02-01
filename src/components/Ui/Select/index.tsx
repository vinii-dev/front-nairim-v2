/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Label from '../Label';
import { ChevronDown } from 'lucide-react';

export interface Option {
  label: string;
  value: string | number;
}

export interface SelectProps {
  options: Option[];
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (value: string | number) => void;
  label?: string;
  required?: boolean;
  svg?: React.ReactNode;
  id?: string;
  tabIndex?: number;
  disabled?: boolean;
  placeholder?: string;
}

export default function Select({ 
  options, 
  defaultValue, 
  onChange, 
  label, 
  required, 
  svg, 
  id, 
  tabIndex, 
  disabled, 
  value,
  placeholder = "Selecione...",
  ...props 
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number>(value || defaultValue || '');
  const [selectedLabel, setSelectedLabel] = useState<string>(
    value !== undefined && value !== '' 
      ? options.find(opt => String(opt.value) === String(value))?.label || placeholder
      : defaultValue !== undefined && defaultValue !== ''
        ? options.find(opt => String(opt.value) === String(defaultValue))?.label || placeholder
        : placeholder
  );

  const selectRef = useRef<HTMLSelectElement>(null); 
  const customSelectRef = useRef<HTMLDivElement>(null);

  // Atualizar quando value mudar
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
      const foundLabel = options.find(opt => String(opt.value) === String(value))?.label || placeholder;
      setSelectedLabel(foundLabel);
    }
  }, [value, options, placeholder]);

  // Atualizar quando defaultValue mudar (apenas se value não estiver definido)
  useEffect(() => {
    if (defaultValue !== undefined && !value) {
      setSelectedValue(defaultValue);
      const foundLabel = options.find(opt => String(opt.value) === String(defaultValue))?.label || placeholder;
      setSelectedLabel(foundLabel);
    }
  }, [defaultValue, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { 
      if (customSelectRef.current && !customSelectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: Option) => {
    setSelectedValue(option.value);
    setSelectedLabel(option.label);
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }

    if (selectRef.current) {
      selectRef.current.value = String(option.value);
    }
  };

  const toggleSelect = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative font-poppins w-full min-w-[300px] max-w-[300px] flex-1" ref={customSelectRef}>
      <select
        ref={selectRef}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10 hidden"
        value={String(selectedValue)}
        onChange={(e) => {
          const option = options.find(opt => String(opt.value) === e.target.value);
          if (option) {
            handleOptionClick(option);
          }
        }}
        aria-hidden="true"
        tabIndex={tabIndex}
        disabled={disabled}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>

      <Label id={id} label={label} required={required} svg={svg} />
      <div
        className={`
          ${disabled ? 'bg-[#EDEDED] cursor-not-allowed' : 'bg-white border border-[#CCCCCC] cursor-pointer'} 
          rounded-lg py-2 px-4 flex justify-between items-center relative text-[14px] text-[#111111B2] h-[40px] w-full
        `}
        onClick={toggleSelect}
        tabIndex={disabled ? -1 : tabIndex}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown 
          size={20} 
          color="#666" 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && !disabled && (
        <ul className="absolute z-50 w-full bg-white border border-[#CCCCCC] rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto text-[14px] text-[#111111B2]">
          {options.map((option) => (
            <li
              key={String(option.value)}
              className={`
                py-2 px-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150
                ${String(selectedValue) === String(option.value) ? 'bg-purple-50 text-purple-700 font-semibold' : ''}
              `}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}