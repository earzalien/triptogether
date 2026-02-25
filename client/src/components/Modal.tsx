import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import "../pages/styles/Modal.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 🔒 Bloque le scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ⌨️ Fermeture via Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      aria-modal="true"
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
    >
      <div
        className="modal-content"
        ref={modalRef}
        tabIndex={-1}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="modal-inner">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
