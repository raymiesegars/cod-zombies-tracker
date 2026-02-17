'use client';

import { createContext, useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type TabsVariant = 'default' | 'separate';

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant?: TabsVariant;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  defaultValue?: string;
  value?: string;
  children: React.ReactNode;
  className?: string;
  onChange?: (value: string) => void;
  variant?: TabsVariant;
}

export function Tabs({ defaultValue, value, children, className, onChange, variant }: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue ?? value ?? '');

  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalTab;

  const handleTabChange = (newValue: string) => {
    if (!isControlled) setInternalTab(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  const context = useContext(TabsContext);
  const variant = context?.variant;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-bunker-700 bg-bunker-800',
        variant === 'separate'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-3 rounded-lg border-bunker-700/80 bg-bunker-800/60'
          : 'gap-1 p-1',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { activeTab, setActiveTab, variant } = useTabs();
  const isActive = activeTab === value;

  if (variant === 'separate') {
    return (
      <button
        type="button"
        onClick={() => setActiveTab(value)}
        className={cn(
          'w-full min-w-0 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 text-center',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blood-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bunker-900',
          isActive
            ? 'border-blood-500/80 bg-blood-950/50 text-white shadow-sm'
            : 'border-bunker-600 bg-bunker-800 text-bunker-300 hover:border-bunker-500 hover:bg-bunker-700/70 hover:text-bunker-200',
          className
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative px-4 py-2 text-sm font-medium rounded-md transition-colors',
        isActive ? 'text-white' : 'text-bunker-400 hover:text-bunker-200',
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-tab"
          className="absolute inset-0 bg-blood-950/40 border border-blood-800/40 rounded-md"
          transition={{ type: 'spring', duration: 0.3 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabs();

  if (activeTab !== value) return null;

  return <div className={className}>{children}</div>;
}
