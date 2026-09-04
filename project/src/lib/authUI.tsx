import { createContext, useContext, useState, type ReactNode } from 'react';
import AuthModal from '../components/AuthModal';

type Mode = 'signin' | 'signup' | 'forgot';

interface AuthUIContextType {
  openAuth: (mode?: Mode) => void;
  closeAuth: () => void;
}

const AuthUIContext = createContext<AuthUIContextType | undefined>(undefined);

export function AuthUIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('signin');

  const openAuth = (m: Mode = 'signin') => {
    setMode(m);
    setIsOpen(true);
  };
  const closeAuth = () => setIsOpen(false);

  return (
    <AuthUIContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuth} defaultMode={mode} />
    </AuthUIContext.Provider>
  );
}

export function useAuthUI() {
  const ctx = useContext(AuthUIContext);
  if (!ctx) throw new Error('useAuthUI must be used within AuthUIProvider');
  return ctx;
}
