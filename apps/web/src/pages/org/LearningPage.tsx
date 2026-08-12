import { useLocation, useNavigate } from 'react-router-dom';
import { BookMarked, GraduationCap, Video, FileQuestion, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

export const LearningPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/videos')
    ? 'videos'
    : location.pathname.endsWith('/assignments')
    ? 'assignments'
    : location.pathname.endsWith('/content')
    ? 'content'
    : 'courses';

  const learningTabs = [
    { id: 'courses', label: 'Courses', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'content', label: 'Content Library', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/org/learning/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Curriculum Management
            </h1>
            <Badge variant="secondary">Org Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Publish courses, manage video libraries, configure cohort assignments, and track content usage.
          </p>
        </div>
      </div>

      <Tabs tabs={learningTabs} activeTab={currentTab} onChange={handleTabChange} variant="underline" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[var(--color-deep-saffron)]" />
            <CardTitle>
              {currentTab === 'courses' && 'Cohort Course Catalog'}
              {currentTab === 'videos' && 'Video Resource Repository'}
              {currentTab === 'assignments' && 'Student Assignments & Grading'}
              {currentTab === 'content' && 'Global Content Library'}
            </CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-deep-saffron)]">{location.pathname}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Organizational Learning Slot ({currentTab.toUpperCase()}) — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
