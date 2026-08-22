import { FolderKanban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const WorkspacePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              My Workspace
            </h1>
            <Badge variant="primary">Personal Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Organize your notes, personal code snippets, and custom project sandboxes.
          </p>
        </div>
      </div>

      {/* Content Slot View */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[var(--color-forsythia)]" />
            <CardTitle>Personal Workspace Dashboard</CardTitle>
          </div>
          <CardDescription>
            Active Route Path: <code className="font-mono text-[var(--color-forsythia)]">/personal/workspace</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Workspace Notes & Sandboxes Feature Slot — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
