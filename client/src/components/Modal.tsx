import { useEffect } from "react";
import type { ReactNode } from "react";
import "../pages/styles/Modal.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="modal-content">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <div className="modal-inner">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
