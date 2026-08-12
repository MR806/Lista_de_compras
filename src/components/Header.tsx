import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Header({ title, subtitle, actionLabel, onAction }: HeaderProps) {
  return (
    <header className="ios-header">
      <div>
        <h1 className="ios-header-title">{title}</h1>
        {subtitle && <p className="ios-header-subtitle">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button type="button" className="ios-action-btn" onClick={onAction}>
          <Plus size={18} />
          <span>{actionLabel}</span>
        </button>
      )}
    </header>
  );
}
