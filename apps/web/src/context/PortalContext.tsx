import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PortalType, PORTAL_CONFIGS, PortalConfig } from '../config/navigation.config';

export interface PortalContextType {
  activePortal: PortalType;
  portalConfig: PortalConfig;
  setPortal: (portal: PortalType) => void;
  togglePortal: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export interface PortalProviderProps {
  children: ReactNode;
  initialPortal?: PortalType;
}

export const PortalProvider: React.FC<PortalProviderProps> = ({
  children,
  initialPortal = 'personal',
}) => {
  const [activePortal, setActivePortal] = useState<PortalType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/org')) return 'organizational';
      if (path.startsWith('/personal')) return 'personal';
    }
    return initialPortal;
  });

  // Sync state with URL path changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/org') && activePortal !== 'organizational') {
        setActivePortal('organizational');
      } else if (path.startsWith('/personal') && activePortal !== 'personal') {
        setActivePortal('personal');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [activePortal]);

  const setPortal = (portal: PortalType) => {
    setActivePortal(portal);
  };

  const togglePortal = () => {
    setActivePortal((prev) => (prev === 'personal' ? 'organizational' : 'personal'));
  };

  return (
    <PortalContext.Provider
      value={{
        activePortal,
        portalConfig: PORTAL_CONFIGS[activePortal],
        setPortal,
        togglePortal,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = (): PortalContextType => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
