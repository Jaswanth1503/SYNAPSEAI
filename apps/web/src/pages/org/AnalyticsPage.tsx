import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BarChart2, FileQuestion, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

export const AnalyticsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/quiz')
    ? 'quiz'
    : location.pathname.endsWith('/skill-gap')
    ? 'skill-gap'
    : 'learning';

  const analyticsTabs = [
    { id: 'learning', label: 'Learning Metrics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz Performance', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'skill-gap', label: 'Skill Gap Matrix', icon: <Target className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/org/analytics/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Institutional Analytics
            </h1>
            <Badge variant="secondary">Org Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Deep dive into cohort engagement, assessment scores, and industry skill readiness gaps.
          </p>
        </div>
      </div>

      <Tabs tabs={analyticsTabs} activeTab={currentTab} onChange={handleTabChange} variant="underline" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--color-deep-saffron)]" />
            <CardTitle>
              {currentTab === 'learning' && 'Overall Cohort Learning Engagement Metrics'}
              {currentTab === 'quiz' && 'Assessment & Quiz Performance Analytics'}
              {currentTab === 'skill-gap' && 'Curriculum Skill Gap Matrix & Recommendations'}
            </CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-deep-saffron)]">{location.pathname}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Institutional Analytics Slot ({currentTab.toUpperCase()}) — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
