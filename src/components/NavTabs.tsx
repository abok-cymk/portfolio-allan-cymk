/**
 * NavTabs
 *
 * Accessible tablist with keyboard navigation (ArrowLeft/Right, Enter/Space).
 * Uses Framer Motion AnimatePresence for panel transitions ≤ 300ms.
 *
 * Requirements: 2.1–2.8
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';

export interface TabDefinition {
  id: string;
  label: string;
  panel: React.ReactNode;
}

interface NavTabsProps {
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function NavTabs({ tabs, activeTab, onTabChange }: NavTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    const n = tabs.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % n;
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + n) % n;
      tabRefs.current[prev]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabs[index].id);
    }
  }

  const activePanel = tabs.find((t) => t.id === activeTab)?.panel;

  return (
    <div>
      {/* Tab list */}
      <nav
        role="tablist"
        aria-label="Portfolio sections"
        className="flex"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => { tabRefs.current[index] = el; }}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="px-5 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderBottom: isActive
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab panels */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return isActive ? (
              <motion.div
                key={tab.id}
                id={`panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activePanel}
              </motion.div>
            ) : (
              <div
                key={tab.id}
                id={`panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab.id}`}
                hidden
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
