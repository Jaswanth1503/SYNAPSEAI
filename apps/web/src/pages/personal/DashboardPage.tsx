import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Code2, Target, Plus, PlayCircle, Sparkles, ArrowUpRight, FileQuestion } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { videoApi, VideoRecord } from '../../services/video.api';
import { careerApi, RecommendationItem } from '../../services/career.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(true);
  const [recsError, setRecsError] = useState<string | null>(null);

  const fetchRecommendationsData = async () => {
    setIsLoadingRecs(true);
    setRecsError(null);
    try {
      const recs = await careerApi.getRecommendations();
      setRecommendations(recs);
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      setRecsError(err.response?.data?.message || err.message || 'Failed to load recommendations');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const fetchedVideos = await videoApi.listVideos();
        if (isMounted) setVideos(fetchedVideos);
      } catch (err) {
        console.error('Failed to fetch dashboard video list:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    fetchRecommendationsData();

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

  const getRecTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-[var(--color-forsythia)]" />;
      case 'coding':
        return <Code2 className="w-4 h-4 text-[var(--color-forsythia)]" />;
      default:
        return <FileQuestion className="w-4 h-4 text-[var(--color-forsythia)]" />;
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

      {/* AI Personalized Recommendation Surface (Phase 5 Step 3) */}
      <Card className="border-[var(--color-forsythia)] bg-gradient-to-br from-[var(--color-oceanic-noir)] to-[var(--color-nocturnal-expedition)]">
        <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-[var(--color-forsythia)]" />
              AI Personalized Recommendations Surface
            </CardTitle>
            <Badge variant="primary" className="font-mono text-xs">
              Based on Phase 4 Skill Gaps
            </Badge>
          </div>
          <CardDescription>
            Targeted recommendations tailored to fill your identified skill gaps and activity history.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingRecs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton variant="rectangular" className="h-32 w-full" />
              <Skeleton variant="rectangular" className="h-32 w-full" />
              <Skeleton variant="rectangular" className="h-32 w-full" />
            </div>
          ) : recsError ? (
            <div className="p-4 rounded-[var(--radius-md)] bg-red-950/40 border border-red-500/50 text-xs flex items-center justify-between text-red-200">
              <span>{recsError}</span>
              <Button variant="secondary" size="sm" onClick={fetchRecommendationsData}>
                Retry Loading
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] hover:border-[var(--color-forsythia)] transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getRecTypeIcon(rec.type)}
                        <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-forsythia)]">
                          {rec.type}
                        </span>
                      </div>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {rec.difficulty}
                      </Badge>
                    </div>

                    <h3 className="font-header text-sm font-semibold text-[var(--color-arctic-powder)] line-clamp-2">
                      {rec.title}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                      {rec.rationale}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
                    <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                      Est. {rec.estimatedMinutes} mins
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                      onClick={() => navigate(rec.targetUrl)}
                    >
                      Action Item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

                    <h3 className="font-header text-sm font-semibold text-[var(--color-arctic-powder)] line-clamp-2 mb-1">
                      {vid.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-border-subtle)] text-xs font-mono">
                    <span className="text-[var(--color-text-muted)] text-[10px]">Ready for Playback</span>
                    <button
                      onClick={() => navigate('/personal/learn/videos')}
                      className="text-[var(--color-forsythia)] hover:underline flex items-center gap-1 font-semibold text-xs"
                    >
                      Watch & Analyze &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
