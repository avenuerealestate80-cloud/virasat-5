import { createContext, useContext, useState, type ReactNode } from 'react';

interface CompareContextType {
  compareIds: string[];
  toggleCompare: (id: string) => void;
  isComparing: (id: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('compareIds');
    return stored ? JSON.parse(stored) : [];
  });

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((i) => i !== id);
      } else {
        if (prev.length >= 3) return prev;
        next = [...prev, id];
      }
      localStorage.setItem('compareIds', JSON.stringify(next));
      return next;
    });
  };

  const isComparing = (id: string) => compareIds.includes(id);
  const clearCompare = () => {
    setCompareIds([]);
    localStorage.removeItem('compareIds');
  };

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, isComparing, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
