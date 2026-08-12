import { Building2, Users, BookOpen, Target, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const OverviewPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Organization Overview
            </h1>
            <Badge variant="secondary">Org Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Manage cohort curricula, student analytics, recruitment drives, and certificate issuances.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-[var(--color-nocturnal-expedition)] rounded-[var(--radius-md)] text-[var(--color-deep-saffron)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Total Students</p>
              <h4 className="font-header text-xl font-bold text-[var(--color-arctic-powder)] mt-0.5">1,240 Active</h4>
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-[var(--color-nocturnal-expedition)] rounded-[var(--radius-md)] text-[var(--color-forsythia)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Cohort Courses</p>
              <h4 className="font-header text-xl font-bold text-[var(--color-arctic-powder)] mt-0.5">16 Published</h4>
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-[var(--color-nocturnal-expedition)] rounded-[var(--radius-md)] text-[#34D399]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Placement Drives</p>
              <h4 className="font-header text-xl font-bold text-[var(--color-arctic-powder)] mt-0.5">8 Ongoing</h4>
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-[var(--color-nocturnal-expedition)] rounded-[var(--radius-md)] text-[var(--color-deep-saffron)]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Certificates Issued</p>
              <h4 className="font-header text-xl font-bold text-[var(--color-arctic-powder)] mt-0.5">850 Total</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Slot */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--color-deep-saffron)]" />
            <CardTitle>Organization Cohorts Summary</CardTitle>
          </div>
          <CardDescription>
            Feature Slot Boundary — Organizational Portal Overview Shell View
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
          [ Organizational Overview & Cohort Management Slot — Ready for Phase 2+ Integration ]
        </CardContent>
      </Card>
    </div>
  );
};
