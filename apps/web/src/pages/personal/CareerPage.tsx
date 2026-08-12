import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Map, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

export const CareerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/skills') ? 'skills' : 'roadmap';

  const careerTabs = [
    { id: 'roadmap', label: 'Career Roadmap', icon: <Map className="w-4 h-4" /> },
    { id: 'skills', label: 'Skill Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/personal/career/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Career Preparation
            </h1>
            <Badge variant="primary">Personal Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Build your personalized career roadmap, track target job roles, and analyze skill readiness.
          </p>
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <Tabs
        tabs={careerTabs}
        activeTab={currentTab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* Content Slot View */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--color-forsythia)]" />
            <CardTitle>
              {currentTab === 'roadmap' && 'Personalized AI Career Path & Milestones'}
              {currentTab === 'skills' && 'Comprehensive Skill Radar & Gap Analytics'}
            </CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-forsythia)]">{location.pathname}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Career Feature Slot ({currentTab.toUpperCase()}) — Ready for Phase 2+ Career Engine ]
        </CardContent>
      </Card>
    </div>
  );
};
