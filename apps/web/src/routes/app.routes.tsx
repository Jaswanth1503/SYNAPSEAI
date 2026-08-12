import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Personal Portal Pages
import { DashboardPage } from '../pages/personal/DashboardPage';
import { LearnPage } from '../pages/personal/LearnPage';
import { PracticePage } from '../pages/personal/PracticePage';
import { CareerPage } from '../pages/personal/CareerPage';
import { WorkspacePage } from '../pages/personal/WorkspacePage';

// Organizational Portal Pages
import { OverviewPage } from '../pages/org/OverviewPage';
import { LearningPage } from '../pages/org/LearningPage';
import { StudentsPage } from '../pages/org/StudentsPage';
import { AnalyticsPage } from '../pages/org/AnalyticsPage';
import { PlacementsPage } from '../pages/org/PlacementsPage';
import { CertificatesPage } from '../pages/org/CertificatesPage';
import { CommunicationPage } from '../pages/org/CommunicationPage';
import { SettingsPage } from '../pages/org/SettingsPage';

// Root Layout wrapping router inside AuthProvider
const RootAuthLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    element: <RootAuthLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/personal/dashboard" replace />,
      },
      // Public Auth Routes
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      // Protected Personal Portal Routes
      {
        path: '/personal',
        element: (
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/personal/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          {
            path: 'learn',
            children: [
              { index: true, element: <Navigate to="/personal/learn/courses" replace /> },
              { path: 'courses', element: <LearnPage /> },
              { path: 'videos', element: <LearnPage /> },
              { path: 'saved', element: <LearnPage /> },
            ],
          },
          {
            path: 'practice',
            children: [
              { index: true, element: <Navigate to="/personal/practice/coding" replace /> },
              { path: 'coding', element: <PracticePage /> },
              { path: 'quizzes', element: <PracticePage /> },
            ],
          },
          {
            path: 'career',
            children: [
              { index: true, element: <Navigate to="/personal/career/roadmap" replace /> },
              { path: 'roadmap', element: <CareerPage /> },
              { path: 'skills', element: <CareerPage /> },
            ],
          },
          { path: 'workspace', element: <WorkspacePage /> },
        ],
      },

      // Protected Organizational Portal Routes
      {
        path: '/org',
        element: (
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/org/overview" replace /> },
          { path: 'overview', element: <OverviewPage /> },
          {
            path: 'learning',
            children: [
              { index: true, element: <Navigate to="/org/learning/courses" replace /> },
              { path: 'courses', element: <LearningPage /> },
              { path: 'videos', element: <LearningPage /> },
              { path: 'assignments', element: <LearningPage /> },
              { path: 'content', element: <LearningPage /> },
            ],
          },
          {
            path: 'students',
            children: [
              { index: true, element: <Navigate to="/org/students/members" replace /> },
              { path: 'members', element: <StudentsPage /> },
              { path: 'cohorts', element: <StudentsPage /> },
              { path: 'progress', element: <StudentsPage /> },
            ],
          },
          {
            path: 'analytics',
            children: [
              { index: true, element: <Navigate to="/org/analytics/learning" replace /> },
              { path: 'learning', element: <AnalyticsPage /> },
              { path: 'quiz', element: <AnalyticsPage /> },
              { path: 'skill-gap', element: <AnalyticsPage /> },
            ],
          },
          {
            path: 'placements',
            children: [
              { index: true, element: <Navigate to="/org/placements/applications" replace /> },
              { path: 'applications', element: <PlacementsPage /> },
              { path: 'eligibility', element: <PlacementsPage /> },
              { path: 'pipeline', element: <PlacementsPage /> },
              { path: 'statistics', element: <PlacementsPage /> },
            ],
          },
          {
            path: 'certificates',
            children: [
              { index: true, element: <Navigate to="/org/certificates/issue" replace /> },
              { path: 'issue', element: <CertificatesPage /> },
              { path: 'manage', element: <CertificatesPage /> },
              { path: 'verify', element: <CertificatesPage /> },
            ],
          },
          {
            path: 'communication',
            children: [
              { index: true, element: <Navigate to="/org/communication/announcements" replace /> },
              { path: 'announcements', element: <CommunicationPage /> },
              { path: 'notifications', element: <CommunicationPage /> },
            ],
          },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/personal/dashboard" replace />,
      },
    ],
  },
]);
