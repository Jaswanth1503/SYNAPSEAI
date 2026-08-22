import React from 'react';
import { PortalProvider } from '../../context/PortalContext';
import { SidebarProvider } from '../../context/SidebarContext';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

export interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShellContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-primary)] font-body selection:bg-[var(--color-forsythia)] selection:text-[var(--color-oceanic-noir)]">
      <TopBar />
      <Sidebar />
      <MainContent />
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = () => {
  return (
    <PortalProvider>
      <SidebarProvider>
        <AppShellContent />
      </SidebarProvider>
    </PortalProvider>
  );
};
