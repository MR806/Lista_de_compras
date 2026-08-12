import { useEffect } from 'react';

interface ActionSheetOption {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export function ActionSheet({ isOpen, onClose, title, options }: ActionSheetProps) {
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
    <div
      className="ios-sheet-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '10px 16px 24px 16px',
      }}
    >
      <div
        className="ios-action-sheet-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          animation: 'iosSheetSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Bloco de Opções */}
        <div
          style={{
            background: 'var(--ios-glass-tabbar)',
            backdropFilter: 'var(--ios-backdrop-blur)',
            WebkitBackdropFilter: 'var(--ios-backdrop-blur)',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid var(--ios-glass-border)',
          }}
        >
          {title && (
            <div
              style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--ios-label-secondary)',
                borderBottom: '0.5px solid var(--ios-card-border)',
              }}
            >
              {title}
            </div>
          )}

          {options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                option.onClick();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'transparent',
                border: 'none',
                borderBottom: idx < options.length - 1 ? '0.5px solid var(--ios-card-border)' : 'none',
                color: option.destructive ? 'var(--ios-red)' : 'var(--ios-blue)',
                fontSize: '17px',
                fontWeight: '500',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Botão Cancelar separado */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            background: 'var(--ios-card-bg)',
            borderRadius: '14px',
            border: '1px solid var(--ios-card-border)',
            color: 'var(--ios-blue)',
            fontSize: '17px',
            fontWeight: '600',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--ios-shadow-subtle)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
