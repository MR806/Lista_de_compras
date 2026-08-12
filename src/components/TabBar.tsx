import { ShoppingBag, Package, Store, Settings } from 'lucide-react';

export type TabId = 'listas' | 'produtos' | 'lojas' | 'definicoes';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: TabId; label: string; icon: typeof ShoppingBag }[] = [
    { id: 'listas', label: 'Listas', icon: ShoppingBag },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'lojas', label: 'Lojas', icon: Store },
    { id: 'definicoes', label: 'Definições', icon: Settings },
  ];

  return (
    <nav className="ios-tab-bar" aria-label="Navegação Principal">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`ios-tab-item ${isActive ? 'ios-tab-item-active' : ''}`}
            aria-selected={isActive}
            role="tab"
          >
            <Icon size={22} className="ios-tab-icon" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
