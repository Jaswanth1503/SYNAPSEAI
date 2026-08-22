import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Briefcase, UserCheck, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

export const PlacementsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/eligibility')
    ? 'eligibility'
    : location.pathname.endsWith('/pipeline')
    ? 'pipeline'
    : location.pathname.endsWith('/statistics')
    ? 'statistics'
    : 'applications';

  const placementTabs = [
    { id: 'applications', label: 'Applications', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'eligibility', label: 'Eligibility', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'pipeline', label: 'Recruitment Pipeline', icon: <Target className="w-4 h-4" /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/org/placements/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Placement Cell Engine
            </h1>
            <Badge variant="secondary">Org Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Manage corporate recruitment drives, student job applications, and placement statistics.
          </p>
        </div>
      </div>

      <Tabs tabs={placementTabs} activeTab={currentTab} onChange={handleTabChange} variant="underline" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--color-deep-saffron)]" />
            <CardTitle>
              {currentTab === 'applications' && 'Active Job Drive Applications'}
              {currentTab === 'eligibility' && 'Company Eligibility & Criteria Rules'}
              {currentTab === 'pipeline' && 'Recruitment Stage Funnel & Shortlists'}
              {currentTab === 'statistics' && 'Annual Campus Placement Statistics'}
            </CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-deep-saffron)]">{location.pathname}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Placement Engine Slot ({currentTab.toUpperCase()}) — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
