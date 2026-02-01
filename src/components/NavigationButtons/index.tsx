// src/components/Admin/NavigationButtons.tsx
'use client';

import Link from 'next/link';

interface NavigationButtonsProps {
  nextUrl?: string;
  submitButton?: boolean;
  textSubmitButton?: string;
  svg?: React.ReactNode;
  loading?: boolean;
  textLoading?: string;
  formComplete?: boolean;
  tabIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  isLastStep?: boolean;
}

export default function NavigationButtons({
  nextUrl,
  submitButton,
  textSubmitButton,
  svg,
  loading,
  textLoading,
  formComplete,
  tabIndex,
  onNext,
  onPrevious,
  showPrevious,
  showNext,
  isLastStep,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center gap-5 mt-3 border-t-2 pt-3 border-[#11111180] w-full justify-end">
      {showPrevious && (
        <button
          type="button"
          onClick={onPrevious}
          className="flex justify-center items-center max-w-[250px] w-full h-[50px] bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg text-[16px] font-medium text-white border border-gray-400 drop-shadow-soft"
        >
          Anterior
        </button>
      )}
      
      {showNext && !isLastStep && (
        <button
          type="button"
          onClick={onNext}
          className="flex justify-center items-center max-w-[250px] w-full h-[50px] bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] rounded-lg text-[16px] font-medium text-white border border-[#8B5CF6] drop-shadow-purple-soft"
        >
          Próximo
        </button>
      )}
      
      {submitButton && (
        <button
          tabIndex={tabIndex}
          disabled={loading || formComplete}
          type="submit"
          className={`flex justify-center gap-3 items-center max-w-[250px] w-full h-[50px] bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] rounded-lg text-[16px] font-medium text-white border border-[#8B5CF6] drop-shadow-purple-soft ${(loading || formComplete) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {svg}
          <p>{loading ? textLoading : textSubmitButton}</p>
        </button>
      )}
      
      {nextUrl && (
        <Link
          href={nextUrl}
          className="flex justify-center items-center max-w-[250px] w-full h-[50px] bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] rounded-lg text-[16px] font-medium text-white border border-[#8B5CF6] drop-shadow-purple-soft"
        >
          Próximo
        </Link>
      )}
    </div>
  );
}