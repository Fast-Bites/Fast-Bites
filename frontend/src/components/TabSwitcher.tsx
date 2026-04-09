import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="h-12 flex justify-between rounded-xl border border-white/20 bg-white/8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`w-full rounded-lg text-lg font-normal transition-colors ${
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;
