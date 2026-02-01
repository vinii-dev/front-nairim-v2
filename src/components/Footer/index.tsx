'use client'

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050505] border-t border-white/[0.02] overflow-hidden">
      
      {/* Detalhe de Iluminação - Glow de Canto Cirúrgico */}
      <div className="absolute bottom-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#C9B37E]/[0.015] blur-[60px] md:blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-20 pt-20 md:pt-40 pb-12 md:pb-16">
        
        {/* Grid Principal - O "Dashboard" de Rodapé */}
        <div className="grid gap-12 md:gap-20 md:grid-cols-4 xl:grid-cols-12 mb-20 md:mb-40 items-start">

          {/* MARCA & IDENTIDADE INSTITUCIONAL */}
          <div className="md:col-span-6 space-y-8 md:space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
              className="flex justify-center md:justify-start"
            >
              <Image
                src="/logo.svg"
                alt="Mavellium Protocol"
                width={180}
                height={52}
                className="h-8 md:h-22 w-auto brightness-110"
              />
            </motion.div>
            
            <div className="flex flex-col gap-4 md:gap-6 border-l border-purple-800/50 pl-6 md:pl-8 sm:items-center md:items-start">
              <p className="text-[10px] md:text-[13px] text-[#666] font-light leading-[1.8] md:leading-[2.5] max-w-md text-center md:text-left">
                A Mavellium Standard opera na intersecção entre engenharia de sistemas e medicina de elite, consolidando soberania digital para instituições que não admitem o comum.
              </p>
            </div>
          </div>

          {/* PROTOCOLO E ADMISSÃO */}
          <div className="md:col-span-3 space-y-6 md:space-y-10">
            <h4 className="text-[8px] md:text-[15px] text-purple-800 tracking-[0.3em] opacity-60 text-center md:text-left">
              Protocol Access
            </h4>
            <nav className="flex flex-col gap-4 md:gap-6">
              {[
                { name: 'The Method', href: '#metodo' },
                { name: 'Architecture', href: '#engenharia' },
                { name: 'Admissions Inquiry', href: '/inquiry' }
              ].map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className="group flex items-center gap-4 text-[9px] md:text-[10px] tracking-[0.3em] text-[#888] hover:text-white transition-all duration-500 font-bold justify-center md:justify-start"
                >
                  <span className="w-0 group-hover:w-4 md:group-hover:w-6 h-[1px] bg-purple-800 transition-all duration-500" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* CONCIERGE & LOCALIZAÇÃO TÉCNICA */}
          <div className="md:col-span-3 space-y-6 md:space-y-10">
            <h4 className="text-[8px] md:text-[15px] tracking-[0.3em] text-purple-800 opacity-60 text-center md:text-left">
              Direct Contact
            </h4>
            <div className="space-y-6 md:space-y-8 text-center md:text-left">
              <div className="flex flex-col gap-2">
                <span className="text-[7px] md:text-[8px] tracking-[0.3em] md:tracking-[0.4em] text-white/20 uppercase font-bold">Secure Line</span>
                <a href="mailto:contato@mavellium.com.br" className="text-[9px] md:text-[11px] tracking-[0.1em] md:tracking-[0.2em] text-white font-medium hover:text-[#C9B37E] transition-colors break-all">
                  contato@mavellium.com.br
                </a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[7px] md:text-[8px] tracking-[0.3em] md:tracking-[0.4em] text-white/20 uppercase font-bold">HQ Coordinates</span>
                <span className="text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] text-white/40 uppercase leading-relaxed font-light">
                  Geneva • São Paulo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BASE LEGAL - A SENTENÇA FINAL */}
        <div className="pt-12 md:pt-20 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative">
          
          {/* Marcador Central de Fluxo - Apenas no desktop */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-20 h-px bg-purple-800/40" />

          {/* Copyright */}
          <div className="order-2 md:order-1 flex items-center justify-center md:justify-start">
            <p className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-[#888] font-black text-center">
              © {currentYear} Nairim Holding
            </p>
          </div>

          {/* Links de termos */}
          <div className="order-1 md:order-2 flex gap-8 md:gap-16 justify-center">
            {['Privacidade', 'Termos'].map(link => (
              <Link key={link} href={`/${link.toLowerCase()}`} className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-[#888] hover:text-white transition-all duration-500">
                {link}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}