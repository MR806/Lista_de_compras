import { useEffect, ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ios-sheet-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ios-sheet-content" onClick={(e) => e.stopPropagation()}>
        <div className="ios-sheet-drag-handle" />
        
        <div className="ios-sheet-header">
          <button type="button" className="ios-sheet-cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <h2 className="ios-sheet-title">{title}</h2>
          <div style={{ width: '60px' }} /> {/* Espaçador para balançar título */}
        </div>

        <div className="ios-sheet-body">
          {children}
        </div>
      </div>
    </div>
  );
}
