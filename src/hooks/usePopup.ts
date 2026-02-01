import { useState, useCallback, ReactNode } from "react";

export interface PopupState {
  visible: boolean;
  title: string;
  content: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const usePopup = () => {
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    content: null,
  });

  const showPopup = useCallback((
    title: string, 
    content: ReactNode, 
    onConfirm?: () => void, 
    onCancel?: () => void
  ) => {
    setPopup({ visible: true, title, content, onConfirm, onCancel });
  }, []);

  const hidePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, visible: false }));
  }, []);

  return { popup, showPopup, hidePopup };
};