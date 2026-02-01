"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePopup } from "@/hooks/usePopup";

const PopupContext = createContext<ReturnType<typeof usePopup> | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const popup = usePopup();
  return (
    <PopupContext.Provider value={popup}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopupContext = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopupContext must be used within a PopupProvider");
  }
  return context;
};