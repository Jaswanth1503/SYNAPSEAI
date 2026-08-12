import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, UploadCloud, PlayCircle, Clock, FileText, RefreshCw, BookOpen, Bookmark, AlertCircle } from 'lucide-react';
import { videoApi, VideoRecord } from '../../services/video.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';

export const LearnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active sub-tab state synced with route URL
  const activeTab = location.pathname.endsWith('/videos')
    ? 'videos'
    : location.pathname.endsWith('/saved')
    ? 'saved'
    : 'courses';

  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Videos & Setup Polling for pending/processing videos
  const fetchVideos = async () => {
    try {
      const list = await videoApi.listVideos();
      setVideos(list);

      // Auto-select first video if none selected
      if (!selectedVideo && list.length > 0) {
        setSelectedVideo(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Poll server every 5 seconds if there are videos in 'pending' or 'processing' state
  useEffect(() => {
    const hasUnready = videos.some((v) => v.status === 'pending' || v.status === 'processing');
    if (!hasUnready) return;

    const interval = setInterval(() => {
      fetchVideos();
    }, 5000);

    return () => clearInterval(interval);
  }, [videos]);

  const handleTabChange = (tabId: string) => {
    navigate(`/personal/learn/${tabId}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!titleInput) {
        setTitleInput(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a video file to upload.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      if (titleInput) {
        formData.append('title', titleInput);
      }

      setUploadProgress(60);
      const newVideo = await videoApi.uploadVideo(formData);
      setUploadProgress(100);

      // Refresh list & select newly uploaded video
      await fetchVideos();
      setSelectedVideo(newVideo);

      // Reset Modal Form
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setTitleInput('');
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Video upload failed.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">Ready for Playback</Badge>;
      case 'processing':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Processing AI
          </Badge>
        );
      case 'pending':
        return <Badge variant="secondary">Queued in BullMQ</Badge>;
      case 'failed':
        return <Badge variant="error">Processing Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
            Learn & Video Hub
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Stream ready video lectures, track processing queues, and explore course modules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UploadCloud className="w-4 h-4" />}
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload New Video
        </Button>
      </div>

      {/* Sub-Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        tabs={[
          { id: 'videos', label: 'Videos & Playback', icon: <Video className="w-4 h-4" /> },
          { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'saved', label: 'Saved Notes', icon: <Bookmark className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Videos & Playback */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Player & Notes (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedVideo?.title || 'Select a Video from Library'}</CardTitle>
                  {selectedVideo && getStatusBadge(selectedVideo.status)}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton variant="rectangular" className="w-full aspect-video rounded-[var(--radius-md)]" />
                ) : !selectedVideo ? (
                  <EmptyState
                    icon={<Video className="w-12 h-12 text-[var(--color-text-muted)]" />}
                    title="No Video Selected"
                    description="Choose a video from your library on the right to start playback."
                  />
                ) : selectedVideo.status === 'ready' ? (
                  <div className="flex flex-col gap-4">
                    {/* HTML5 Video Player — Enabled strictly for status === 'ready' */}
                    <div className="relative aspect-video rounded-[var(--radius-md)] overflow-hidden bg-black border border-[var(--color-border)]">
                      <video
                        key={selectedVideo._id}
                        controls
                        autoPlay={false}
                        className="w-full h-full object-contain"
                        src={selectedVideo.videoUrl}
                      >
                        Your browser does not support HTML5 video playback.
                      </video>
                    </div>

                    {/* Chapters Section */}
                    {selectedVideo.chapters && selectedVideo.chapters.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-header text-sm font-semibold text-[var(--color-arctic-powder)] mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[var(--color-forsythia)]" /> Video Chapters
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedVideo.chapters.map((chap, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs"
                            >
                              <span className="font-mono text-[var(--color-forsythia)] font-semibold">
                                {Math.floor(chap.startTime / 60)}:{String(chap.startTime % 60).padStart(2, '0')} - {Math.floor(chap.endTime / 60)}:{String(chap.endTime % 60).padStart(2, '0')}
                              </span>
                              <p className="font-semibold text-[var(--color-arctic-powder)] mt-0.5">{chap.title}</p>
                              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{chap.summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Notes Section */}
                    {selectedVideo.notesMarkdown && (
                      <div className="mt-2 p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs">
                        <h4 className="font-header text-sm font-semibold text-[var(--color-arctic-powder)] mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--color-deep-saffron)]" /> Generated Notes
                        </h4>
                        <pre className="whitespace-pre-wrap font-body text-[var(--color-text-secondary)] leading-relaxed">
                          {selectedVideo.notesMarkdown}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Processing & Pending State Guard — Prevents playback until ready */
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--color-oceanic-noir)] rounded-[var(--radius-md)] border border-[var(--color-border)] min-h-[300px]">
                    <RefreshCw className="w-10 h-10 text-[var(--color-forsythia)] animate-spin mb-3" />
                    <h3 className="font-header text-base font-semibold text-[var(--color-arctic-powder)]">
                      Playback Locked — Video Processing
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] max-w-md mt-1 mb-3">
                      This video is currently queued in BullMQ (Status: <strong className="text-[var(--color-forsythia)]">{selectedVideo.status}</strong>). HTML5 Video Playback will unlock automatically once Whisper transcription and Claude notes generation complete.
                    </p>
                    <Badge variant="warning">Auto-refreshing status every 5s</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Video Library List (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Video Library ({videos.length})</CardTitle>
                <CardDescription>Select a video to view status or stream.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton variant="rectangular" className="h-16 w-full" />
                    <Skeleton variant="rectangular" className="h-16 w-full" />
                  </div>
                ) : videos.length === 0 ? (
                  <EmptyState
                    icon={<Video className="w-8 h-8 text-[var(--color-text-muted)]" />}
                    title="No Videos Available"
                    description="Upload your first video to unlock playback."
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<UploadCloud className="w-4 h-4" />}
                        onClick={() => setIsUploadModalOpen(true)}
                      >
                        Upload Video
                      </Button>
                    }
                  />
                ) : (
                  videos.map((vid) => (
                    <div
                      key={vid._id}
                      onClick={() => setSelectedVideo(vid)}
                      className={`p-3 rounded-[var(--radius-md)] border transition-all duration-200 cursor-pointer ${
                        selectedVideo?._id === vid._id
                          ? 'bg-[var(--color-oceanic-noir)] border-[var(--color-forsythia)] ring-1 ring-[var(--color-forsythia)]'
                          : 'bg-[var(--color-bg-surface-hover)] border-[var(--color-border)] hover:border-[var(--color-border-subtle)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-header text-xs font-bold text-[var(--color-arctic-powder)] truncate">
                          {vid.title}
                        </span>
                        {getStatusBadge(vid.status)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
                        <span>{new Date(vid.createdAt).toLocaleDateString()}</span>
                        {vid.status === 'ready' ? (
                          <span className="flex items-center gap-1 text-[var(--color-forsythia)] font-semibold">
                            <PlayCircle className="w-3.5 h-3.5" /> Play
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                            <AlertCircle className="w-3.5 h-3.5" /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: My Courses Placeholder */}
      {activeTab === 'courses' && (
        <Card>
          <CardHeader>
            <CardTitle>My Enrolled Courses</CardTitle>
            <CardDescription>Structured learning paths and course modules.</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
            [ Course Modules & Enrolled Content Slot — Ready for Phase 5 Integration ]
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Saved Notes Placeholder */}
      {activeTab === 'saved' && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Video Notes & Bookmarks</CardTitle>
            <CardDescription>Bookmarked timestamps and exported notes.</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-xs text-[var(--color-text-muted)]">
            [ Bookmarked Notes & Video Clips Slot — Ready for Phase 3 Integration ]
          </CardContent>
        </Card>
      )}

      {/* Upload Video Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => !isUploading && setIsUploadModalOpen(false)}
        title="Upload Video Lecture"
      >
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
          {uploadError && (
            <Alert type="error" title="Upload Failed">
              {uploadError}
            </Alert>
          )}

          <Input
            label="Video Title"
            type="text"
            placeholder="e.g. Distributed Queues and Vector Databases"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            disabled={isUploading}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Select Video File (.mp4, .mov, .webm)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-forsythia)] bg-[var(--color-oceanic-noir)] rounded-[var(--radius-md)] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200"
            >
              <UploadCloud className="w-8 h-8 text-[var(--color-forsythia)] mb-2" />
              <p className="text-xs font-semibold text-[var(--color-arctic-powder)]">
                {selectedFile ? selectedFile.name : 'Click to browse video file'}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'MP4, MOV, WEBM up to 100MB'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span>Uploading to Cloudinary...</span>
                <span className="font-mono text-[var(--color-forsythia)]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-oceanic-noir)] overflow-hidden border border-[var(--color-border)]">
                <div
                  className="h-full bg-[var(--color-forsythia)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUploading}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload & Queue AI
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
