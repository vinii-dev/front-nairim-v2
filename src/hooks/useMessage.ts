import { useState, useCallback } from "react";

export type MessageType = 'success' | 'error' | 'info';

export interface MessageState {
  text: string;
  type: MessageType;
  visible: boolean;
}

export const useMessage = () => {
  const [message, setMessage] = useState<MessageState>({ 
    text: '', 
    type: 'info', 
    visible: false 
  });

  const showMessage = useCallback((text: string, type: MessageType) => {
    setMessage({ text, type, visible: true });
    setTimeout(() => {
      setMessage(prev => ({ ...prev, visible: false }));
    }, 5000);
  }, []);

  const hideMessage = useCallback(() => {
    setMessage(prev => ({ ...prev, visible: false }));
  }, []);

  return { message, showMessage, hideMessage };
};