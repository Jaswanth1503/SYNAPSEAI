import React from 'react';
import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSidebar } from '../../context/SidebarContext';
import { Breadcrumb } from './Breadcrumb';

export const MainContent: React.FC = () => {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={twMerge(
        clsx(
          'pt-16 min-h-screen transition-all duration-300 ease-in-out flex flex-col',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )
      )}
    >
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        <Breadcrumb />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </main>
  );
};
