import { Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Organization Settings
            </h1>
            <Badge variant="secondary">Org Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Configure institutional profile, branding, team member access control, and API integrations.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--color-deep-saffron)]" />
            <CardTitle>Institutional Profile & Security Settings</CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-deep-saffron)]">/org/settings</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Organization Settings & Access Control Slot — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
