import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Poppins } from 'next/font/google';
import { PopupProvider } from "@/contexts/PopupContext";
import { MessageProvider } from "@/contexts/MessageContext";
import GlobalNotifications from "@/components/GlobalNotifications";
import { FilterProvider } from "./context";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'], 
  variable: '--font-poppins',
  display: 'swap',
});


export const metadata: Metadata = {
  title: "Nairim Holding",
  description: "Empresa especializada na venda de imóveis, oferecendo soluções completas para quem deseja adquirir casas, apartamentos, terrenos e propriedades comerciais. Nosso compromisso é conectar clientes a empreendimentos de alto padrão, garantindo segurança, transparência e excelência em cada negociação.",
  icons: "/favicon.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`antialiased ${poppins.variable}  ${poppins.className}`}
      >
        <AuthProvider>
          <PopupProvider>
            <MessageProvider>
              <FilterProvider>
              {children}
              </FilterProvider>
              <GlobalNotifications />
            </MessageProvider>
          </PopupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
