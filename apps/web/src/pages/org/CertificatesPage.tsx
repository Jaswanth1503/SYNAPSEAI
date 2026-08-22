import { useLocation, useNavigate } from 'react-router-dom';
import { Award, Settings, FileCheck2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

export const CertificatesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/manage')
    ? 'manage'
    : location.pathname.endsWith('/verify')
    ? 'verify'
    : 'issue';

  const certTabs = [
    { id: 'issue', label: 'Issue Certificates', icon: <Award className="w-4 h-4" /> },
    { id: 'manage', label: 'Manage Templates', icon: <Settings className="w-4 h-4" /> },
    { id: 'verify', label: 'Verification Portal', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/org/certificates/${tabId}`);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Certificate Management
            </h1>
            <Badge variant="secondary">Org Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Generate tamper-proof completion certificates, manage custom SVG templates, and verify credentials.
          </p>
        </div>
      </div>

      <Tabs tabs={certTabs} activeTab={currentTab} onChange={handleTabChange} variant="underline" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--color-deep-saffron)]" />
            <CardTitle>
              {currentTab === 'issue' && 'Batch Certificate Issuance Engine'}
              {currentTab === 'manage' && 'Certificate Design Templates'}
              {currentTab === 'verify' && 'Public Credential Verification Portal'}
            </CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-deep-saffron)]">{location.pathname}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Certificate Engine Slot ({currentTab.toUpperCase()}) — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
