import { ReactNode } from "react";
import Link from "next/link";

export interface SectionProps {
  children: ReactNode;
  title: string;
  href?: string;
  hrefText?: string;
}

export default function Section({ children, title, href, hrefText }: SectionProps) {
  return (
    <section className="font-poppins bg-white flex flex-col p-2">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold text-gray-800 ml-12">{title}</h1>
        {href && hrefText && (
          <Link 
            href={href} 
            className="bg-[#D9D9D9] px-5 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            {hrefText}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}