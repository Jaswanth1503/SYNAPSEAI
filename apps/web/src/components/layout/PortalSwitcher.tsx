import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { usePortal } from '../../context/PortalContext';
import { PortalType, PORTAL_CONFIGS } from '../../config/navigation.config';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Badge } from '../ui/Badge';

export const PortalSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { activePortal, setPortal } = usePortal();

  const handlePortalSwitch = (portal: PortalType) => {
    if (portal !== activePortal) {
      setPortal(portal);
      navigate(PORTAL_CONFIGS[portal].basePath);
    }
  };

  const portalOptions = [
    {
      id: 'personal',
      label: 'Personal Portal',
      icon: (
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--color-forsythia)]" />
            <span>Personal Portal</span>
          </div>
          {activePortal === 'personal' && <Check className="w-4 h-4 text-[var(--color-forsythia)]" />}
        </div>
      ),
      onClick: () => handlePortalSwitch('personal'),
    },
    {
      id: 'organizational',
      label: 'Organizational Portal',
      icon: (
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--color-deep-saffron)]" />
            <span>Organizational Portal</span>
          </div>
          {activePortal === 'organizational' && <Check className="w-4 h-4 text-[var(--color-deep-saffron)]" />}
        </div>
      ),
      onClick: () => handlePortalSwitch('organizational'),
    },
  ];

  return (
    <DropdownMenu
      align="left"
      items={portalOptions}
      trigger={
        <div
          role="button"
          tabIndex={0}
          aria-label="Switch active portal"
          className={clsx(
            'flex items-center gap-2.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-oceanic-noir)] hover:bg-[var(--color-bg-surface-hover)] transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forsythia)]'
          )}
        >
          {activePortal === 'personal' ? (
            <User className="w-4 h-4 text-[var(--color-forsythia)] shrink-0" />
          ) : (
            <Building2 className="w-4 h-4 text-[var(--color-deep-saffron)] shrink-0" />
          )}

          <span className="font-header text-xs font-semibold text-[var(--color-arctic-powder)] tracking-tight">
            {activePortal === 'personal' ? 'Personal Portal' : 'Org Portal'}
          </span>

          <Badge
            variant={activePortal === 'personal' ? 'primary' : 'secondary'}
            size="sm"
            className="font-mono text-[9px] uppercase px-1.5 py-0"
          >
            {activePortal === 'personal' ? 'Student' : 'Admin'}
          </Badge>

          <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0 ml-0.5" />
        </div>
      }
    />
  );
};
