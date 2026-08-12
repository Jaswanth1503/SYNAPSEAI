import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Code2, Target, Plus, PlayCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { videoApi, VideoRecord } from '../../services/video.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const fetchedVideos = await videoApi.listVideos();
        if (isMounted) {
          setVideos(fetchedVideos);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard video list:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'pending':
        return <Badge variant="secondary">Queued</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Header section with real user profile greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Welcome back, {user?.fullName || 'Student'}!
            </h1>
            <Badge variant="primary">Personal Workspace</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {user?.email} • Account Role: <span className="text-[var(--color-forsythia)] capitalize">{user?.role || 'Student'}</span>
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/personal/learn/videos')}
        >
          Upload New Video
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] text-[var(--color-forsythia)] border border-[var(--color-border)]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                Uploaded Videos
              </p>
              {isLoading ? (
                <Skeleton variant="text" className="w-16 h-6 mt-1" />
              ) : (
                <p className="text-xl font-bold text-[var(--color-arctic-powder)] font-header">
                  {videos.length}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] text-[var(--color-deep-saffron)] border border-[var(--color-border)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                Active Courses
              </p>
              <p className="text-xl font-bold text-[var(--color-arctic-powder)] font-header">
                3
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] text-[var(--color-mystic-mint)] border border-[var(--color-border)]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                Coding Sessions
              </p>
              <p className="text-xl font-bold text-[var(--color-arctic-powder)] font-header">
                12
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] text-[var(--color-forsythia)] border border-[var(--color-border)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                Roadmap Progress
              </p>
              <p className="text-xl font-bold text-[var(--color-arctic-powder)] font-header">
                68%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Videos Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>My Uploaded Videos</CardTitle>
            <CardDescription>
              Real videos stored in Cloudinary and processed asynchronously by BullMQ.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            Live API Data
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3 py-4">
              <Skeleton variant="rectangular" className="h-16 w-full" />
              <Skeleton variant="rectangular" className="h-16 w-full" />
            </div>
          ) : videos.length === 0 ? (
            <EmptyState
              icon={<Video className="w-10 h-10 text-[var(--color-text-muted)]" />}
              title="No Videos Uploaded Yet"
              description="Upload your first lecture video to unlock AI notes and playback processing."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/personal/learn/videos')}
                >
                  Upload Video
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              {videos.map((vid) => (
                <div
                  key={vid._id}
                  className="flex flex-col justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-oceanic-noir)] hover:border-[var(--color-forsythia)] transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(vid.status)}
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {new Date(vid.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-header text-sm font-bold text-[var(--color-arctic-powder)] line-clamp-2">
                      {vid.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]">
                    <span className="text-[11px] text-[var(--color-text-secondary)] font-mono truncate max-w-[150px]">
                      {vid.chapters?.length || 0} chapters
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<PlayCircle className="w-4 h-4 text-[var(--color-forsythia)]" />}
                      onClick={() => navigate(`/personal/learn/videos`)}
                    >
                      Play
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note on Fast-Follow Analytics Aggregation */}
      <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[11px] text-[var(--color-text-muted)]">
        <Sparkles className="w-4 h-4 text-[var(--color-forsythia)] shrink-0" />
        <span>
          <strong>Architecture Note:</strong> Dedicated multi-collection analytics aggregation endpoint (<code className="font-mono text-[var(--color-forsythia)]">GET /api/v1/analytics/personal/dashboard</code>) is flagged as a fast-follow. Dashboard is currently rendering live authenticated profile and video API data.
        </span>
      </div>
    </div>
  );
};
