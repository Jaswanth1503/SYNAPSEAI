import { useLocation, useNavigate } from 'react-router-dom';
import { Code2, Terminal, FileQuestion } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

export const PracticePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/quizzes') ? 'quizzes' : 'coding';

  const practiceTabs = [
    { id: 'coding', label: 'Coding Sandbox', icon: <Terminal className="w-4 h-4" /> },
    { id: 'quizzes', label: 'Quizzes & Assessments', icon: <FileQuestion className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/personal/practice/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Practice Center
            </h1>
            <Badge variant="primary">Personal Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Sharpen your technical skills with interactive coding sandboxes and adaptive quizzes.
          </p>
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <Tabs
        tabs={practiceTabs}
        activeTab={currentTab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* Content Slot View */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[var(--color-forsythia)]" />
            <CardTitle>
              {currentTab === 'coding' && 'Interactive Code Execution Sandbox'}
              {currentTab === 'quizzes' && 'Adaptive Skill Quizzes & Assessments'}
            </CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-forsythia)]">{location.pathname}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Practice Feature Slot ({currentTab.toUpperCase()}) — Ready for Phase 2+ Execution Engine ]
        </CardContent>
      </Card>
    </div>
  );
};
