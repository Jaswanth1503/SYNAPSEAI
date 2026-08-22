import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Video,
  Bookmark,
  Code2,
  Terminal,
  FileQuestion,
  Briefcase,
  Map,
  BarChart2,
  FolderKanban,
  Building2,
  BookMarked,
  Users,
  BarChart3,
  Target,
  Award,
  MessageSquare,
  Settings,
  UserCheck,
  LineChart,
  FileCheck2,
  Send,
  LucideIcon,
} from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  children?: Omit<NavItemConfig, 'children'>[];
}

export type PortalType = 'personal' | 'organizational';

export interface PortalConfig {
  id: PortalType;
  name: string;
  shortName: string;
  basePath: string;
  accentColor: string;
  navItems: NavItemConfig[];
}

export const PERSONAL_PORTAL_NAV: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/personal/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'learn',
    label: 'Learn',
    path: '/personal/learn',
    icon: BookOpen,
    children: [
      {
        id: 'learn-courses',
        label: 'My Courses',
        path: '/personal/learn/courses',
        icon: GraduationCap,
      },
      {
        id: 'learn-videos',
        label: 'Videos',
        path: '/personal/learn/videos',
        icon: Video,
      },
      {
        id: 'learn-saved',
        label: 'Saved Items',
        path: '/personal/learn/saved',
        icon: Bookmark,
      },
    ],
  },
  {
    id: 'practice',
    label: 'Practice',
    path: '/personal/practice',
    icon: Code2,
    children: [
      {
        id: 'practice-coding',
        label: 'Coding Sandbox',
        path: '/personal/practice/coding',
        icon: Terminal,
      },
      {
        id: 'practice-quizzes',
        label: 'Quizzes',
        path: '/personal/practice/quizzes',
        icon: FileQuestion,
      },
    ],
  },
  {
    id: 'career',
    label: 'Career',
    path: '/personal/career',
    icon: Briefcase,
    children: [
      {
        id: 'career-roadmap',
        label: 'Career Roadmap',
        path: '/personal/career/roadmap',
        icon: Map,
      },
      {
        id: 'career-skills',
        label: 'Skill Analytics',
        path: '/personal/career/skills',
        icon: BarChart2,
      },
    ],
  },
  {
    id: 'workspace',
    label: 'My Workspace',
    path: '/personal/workspace',
    icon: FolderKanban,
  },
];

export const ORG_PORTAL_NAV: NavItemConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/org/overview',
    icon: Building2,
  },
  {
    id: 'learning',
    label: 'Learning',
    path: '/org/learning',
    icon: BookMarked,
    children: [
      { id: 'learning-courses', label: 'Courses', path: '/org/learning/courses', icon: GraduationCap },
      { id: 'learning-videos', label: 'Videos', path: '/org/learning/videos', icon: Video },
      { id: 'learning-assignments', label: 'Assignments', path: '/org/learning/assignments', icon: FileQuestion },
      { id: 'learning-content', label: 'Content Library', path: '/org/learning/content', icon: BookOpen },
    ],
  },
  {
    id: 'students',
    label: 'Students',
    path: '/org/students',
    icon: Users,
    children: [
      { id: 'students-members', label: 'Members Roster', path: '/org/students/members', icon: UserCheck },
      { id: 'students-cohorts', label: 'Cohorts', path: '/org/students/cohorts', icon: Users },
      { id: 'students-progress', label: 'Student Progress', path: '/org/students/progress', icon: LineChart },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/org/analytics',
    icon: BarChart3,
    children: [
      { id: 'analytics-learning', label: 'Learning Metrics', path: '/org/analytics/learning', icon: BarChart2 },
      { id: 'analytics-quiz', label: 'Quiz Performance', path: '/org/analytics/quiz', icon: FileQuestion },
      { id: 'analytics-skillgap', label: 'Skill Gap Matrix', path: '/org/analytics/skill-gap', icon: Target },
    ],
  },
  {
    id: 'placements',
    label: 'Placements',
    path: '/org/placements',
    icon: Target,
    children: [
      { id: 'placements-apps', label: 'Applications', path: '/org/placements/applications', icon: Briefcase },
      { id: 'placements-eligibility', label: 'Eligibility Criteria', path: '/org/placements/eligibility', icon: UserCheck },
      { id: 'placements-pipeline', label: 'Recruitment Pipeline', path: '/org/placements/pipeline', icon: Target },
      { id: 'placements-stats', label: 'Placement Statistics', path: '/org/placements/statistics', icon: BarChart3 },
    ],
  },
  {
    id: 'certificates',
    label: 'Certificates',
    path: '/org/certificates',
    icon: Award,
    children: [
      { id: 'certificates-issue', label: 'Issue Certificates', path: '/org/certificates/issue', icon: Award },
      { id: 'certificates-manage', label: 'Manage Templates', path: '/org/certificates/manage', icon: Settings },
      { id: 'certificates-verify', label: 'Verification Portal', path: '/org/certificates/verify', icon: FileCheck2 },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    path: '/org/communication',
    icon: MessageSquare,
    children: [
      { id: 'comm-announcements', label: 'Announcements', path: '/org/communication/announcements', icon: Send },
      { id: 'comm-notifications', label: 'Notifications', path: '/org/communication/notifications', icon: MessageSquare },
    ],
  },
  {
    id: 'settings',
    label: 'Org Settings',
    path: '/org/settings',
    icon: Settings,
  },
];

export const PORTAL_CONFIGS: Record<PortalType, PortalConfig> = {
  personal: {
    id: 'personal',
    name: 'Personal Portal',
    shortName: 'Personal',
    basePath: '/personal/dashboard',
    accentColor: 'var(--portal-personal-accent)',
    navItems: PERSONAL_PORTAL_NAV,
  },
  organizational: {
    id: 'organizational',
    name: 'Organizational Portal',
    shortName: 'Org Portal',
    basePath: '/org/overview',
    accentColor: 'var(--portal-org-accent)',
    navItems: ORG_PORTAL_NAV,
  },
};
