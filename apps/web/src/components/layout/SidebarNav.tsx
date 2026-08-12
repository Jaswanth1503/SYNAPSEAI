import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { useSidebar } from '../../context/SidebarContext';
import { NavItem } from './NavItem';
import { NavItemGroup } from './NavItemGroup';

export interface SidebarNavProps {
  onItemClick?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ onItemClick }) => {
  const { portalConfig } = usePortal();
  const { isCollapsed } = useSidebar();

  return (
    <nav className="flex flex-col gap-1.5 px-3 py-4 overflow-y-auto flex-1 scrollbar-thin">
      {portalConfig.navItems.map((item) => {
        if (item.children && item.children.length > 0) {
          return (
            <NavItemGroup
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              onChildClick={onItemClick}
            />
          );
        }

        return (
          <NavItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />
        );
      })}
    </nav>
  );
};
