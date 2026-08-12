import { useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, LineChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

export const StudentsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/cohorts')
    ? 'cohorts'
    : location.pathname.endsWith('/progress')
    ? 'progress'
    : 'members';

  const studentTabs = [
    { id: 'members', label: 'Members Roster', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'cohorts', label: 'Cohorts', icon: <Users className="w-4 h-4" /> },
    { id: 'progress', label: 'Student Progress', icon: <LineChart className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/org/students/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Student Management
            </h1>
            <Badge variant="secondary">Org Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Track student rosters, assign cohorts, and monitor individual learning milestones.
          </p>
        </div>
      </div>

      <Tabs tabs={studentTabs} activeTab={currentTab} onChange={handleTabChange} variant="underline" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-deep-saffron)]" />
            <CardTitle>
              {currentTab === 'members' && 'Registered Student Roster'}
              {currentTab === 'cohorts' && 'College & Batch Cohorts'}
              {currentTab === 'progress' && 'Real-time Student Progress Radar'}
            </CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-deep-saffron)]">{location.pathname}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Student Management Slot ({currentTab.toUpperCase()}) — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
