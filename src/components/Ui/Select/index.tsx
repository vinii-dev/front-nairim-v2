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
  tabIndex = 0, 
  disabled, 
  value,
  placeholder = "Selecione...",
  ...props 
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number>(value || defaultValue || '');
  const [selectedLabel, setSelectedLabel] = useState<string>(placeholder);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsListRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Atualiza label quando value muda
  useEffect(() => {
    const targetValue = value !== undefined ? value : defaultValue;
    if (targetValue !== undefined && targetValue !== '') {
      const found = options.find(opt => String(opt.value) === String(targetValue));
      if (found) {
        setSelectedLabel(found.label);
        setSelectedValue(targetValue);
      }
    }
  }, [value, defaultValue, options, placeholder]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { 
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        optionsListRef.current &&
        !optionsListRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (option: Option) => {
    setSelectedValue(option.value);
    setSelectedLabel(option.label);
    setIsOpen(false);
    
    if (onChange) onChange(option.value);
    
    // Devolve o foco para o container principal (para continuar a navegação do form)
    if (containerRef.current) containerRef.current.focus();
  };

  const toggleOpen = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  // --- LÓGICA DE FOCO E TECLADO ---

  // 1. Ao receber foco (via Tab vindo do campo anterior), ABRE o select
  const handleFocus = () => {
    if (!disabled && !isOpen) {
      setIsOpen(true);
    }
  };

  // 2. Controla o container principal
  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    // Se apertar TAB e estiver ABERTO -> Vai para a primeira opção
    if (e.key === 'Tab' && isOpen) {
      e.preventDefault(); // Impede de ir para o próximo input do form
      // Foca na primeira opção se existir
      if (options.length > 0) {
        optionRefs.current[0]?.focus();
      }
    }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    } 
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      // Pequeno delay para garantir renderização da lista
      setTimeout(() => optionRefs.current[0]?.focus(), 0);
    }
  };

  // 3. Controla a navegação DENTRO das opções
  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number, option: Option) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionSelect(option);
    } 
    else if (e.key === 'Tab') {
      // Se NÃO for o último item, vai para o próximo item da lista
      if (index < options.length - 1) {
        e.preventDefault();
        optionRefs.current[index + 1]?.focus();
      } 
      // Se FOR o último item, deixa o comportamento padrão acontecer 
      // (que é fechar o foco atual e ir para o próximo elemento focalizável do DOM/Formulário)
      else {
        setIsOpen(false);
        // O foco sairá naturalmente do componente aqui
      }
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < options.length) {
        optionRefs.current[nextIndex]?.focus();
      }
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        optionRefs.current[prevIndex]?.focus();
      } else {
        // Se estiver no primeiro e subir, volta para o container
        containerRef.current?.focus();
      }
    }
    else if (e.key === 'Escape') {
      setIsOpen(false);
      containerRef.current?.focus();
    }
  };

  return (
    <div className="relative font-poppins w-full min-w-[300px] flex-1">
      <Label id={id} label={label} required={required} svg={svg} />
      
      {/* Container "Input" do Select */}
      <div
        ref={containerRef}
        className={`
          ${disabled ? 'bg-[#EDEDED] cursor-not-allowed' : 'bg-white border-[#CCCCCC] cursor-pointer'} 
          border rounded-lg py-2 px-4 flex justify-between items-center relative text-[14px] text-[#111111B2] h-[40px] w-full
          outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
        `}
        onClick={toggleOpen}
        tabIndex={disabled ? -1 : tabIndex}
        onKeyDown={handleContainerKeyDown}
        onFocus={handleFocus} // Abre automaticamente ao receber foco
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Lista de Opções */}
      {isOpen && !disabled && (
        <ul 
          ref={optionsListRef}
          className="absolute z-50 w-full bg-white border border-[#CCCCCC] rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto text-[14px]"
        >
          {options.map((option, index) => (
            <li
              key={`${option.value}-${index}`}
              ref={(el) => { optionRefs.current[index] = el; }}
              className={`
                py-2 px-4 cursor-pointer outline-none
                ${String(selectedValue) === String(option.value) ? 'bg-purple-50 text-purple-700 font-semibold' : ''}
                hover:bg-gray-100 focus:bg-purple-100 focus:text-purple-800
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleOptionSelect(option);
              }}
              tabIndex={0} // Necessário para receber foco via .focus()
              onKeyDown={(e) => handleOptionKeyDown(e, index, option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}