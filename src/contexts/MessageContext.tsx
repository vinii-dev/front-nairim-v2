"use client";

import { createContext, useContext, ReactNode } from "react";
import { useMessage } from "@/hooks/useMessage";

const MessageContext = createContext<ReturnType<typeof useMessage> | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const message = useMessage();
  return (
    <MessageContext.Provider value={message}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
};