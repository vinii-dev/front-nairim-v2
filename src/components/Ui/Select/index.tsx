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

  const containerRef = useRef<HTMLDivElement>(null);
  const optionsListRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const isMouseDownRef = useRef(false);

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
    
    if (containerRef.current) containerRef.current.focus();
  };

  const toggleOpen = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleFocus = () => {
    if (!disabled && !isOpen && !isMouseDownRef.current) {
      setIsOpen(true);
    }
    isMouseDownRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    isMouseDownRef.current = true;
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (e.key === 'Tab' && isOpen) {
      e.preventDefault(); 
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
      setTimeout(() => optionRefs.current[0]?.focus(), 0);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number, option: Option) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionSelect(option);
    } 
    else if (e.key === 'Tab') {
      if (index < options.length - 1) {
        e.preventDefault();
        optionRefs.current[index + 1]?.focus();
      } 
      else {
        setIsOpen(false);
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
      
      <div
        ref={containerRef}
        className={`
          ${disabled ? 'bg-[#EDEDED] cursor-not-allowed outline-none' : 'bg-white border-[#CCCCCC] cursor-pointer outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'} 
          border rounded-lg py-2 px-4 flex justify-between items-center relative text-[14px] text-[#111111B2] h-[40px] w-full
        `}
        onClick={toggleOpen}
        onMouseDown={handleMouseDown}
        tabIndex={disabled ? undefined : tabIndex}
        onKeyDown={handleContainerKeyDown}
        onFocus={handleFocus} 
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

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
              tabIndex={0} 
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