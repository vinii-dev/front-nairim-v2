// src/components/Ui/Form.tsx
'use client';

interface FormProps {
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  svg?: React.ReactNode;
}

export default function Form({
  onSubmit,
  children,
  className,
  title,
  svg,
}: FormProps) {
  return (
    <div className="flex flex-col">
      {title && (
        <h1 className="flex items-center gap-2 my-2 text-[#4236C5] text-[24px] font-poppins">
          {svg && svg}
          <span>{title}</span>
        </h1>
      )}
      <form
        onSubmit={onSubmit}
        className={className ? className : "flex flex-col gap-5"}
      >
        {children}
      </form>
    </div>
  );
}