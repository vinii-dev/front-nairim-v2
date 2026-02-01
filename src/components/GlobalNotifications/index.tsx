"use client";

import { usePopupContext } from "@/contexts/PopupContext";
import { useMessageContext } from "@/contexts/MessageContext";
import { useEffect } from "react";
import Popup from "../Popup";
import Message from "../Message";

export default function GlobalNotifications() {
  const { message, hideMessage } = useMessageContext();
  const { popup, hidePopup } = usePopupContext();

  // Fechar popup ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popup.visible) {
        hidePopup();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popup.visible, hidePopup]);

  return (
    <>
      <Message
        message={message.text}
        type={message.type}
        visible={message.visible}
        onClose={hideMessage}
      />
      
      <Popup
        visible={popup.visible}
        title={popup.title}
        content={popup.content}
        onConfirm={() => {
          popup.onConfirm?.();
          hidePopup();
        }}
        onCancel={() => {
          popup.onCancel?.();
          hidePopup();
        }}
      />
    </>
  );
}