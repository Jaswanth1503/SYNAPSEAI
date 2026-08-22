import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, PlayCircle, Clock, FileText, RefreshCw, BookOpen, Bookmark, Sparkles, Copy, Check, MessageSquare, Send, Bot, Network, Layers } from 'lucide-react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { videoApi, VideoRecord } from '../../services/video.api';
import { aiApi, VideoSummaryData, AskDoubtResponseData, MindMapNode } from '../../services/ai.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  retrievedSegments?: Array<{ startTime: number; endTime: number; text: string }>;
}

export const LearnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active sub-tab state synced with route URL
  const activeTab = location.pathname.endsWith('/videos')
    ? 'videos'
    : location.pathname.endsWith('/mindmap')
    ? 'mindmap'
    : location.pathname.endsWith('/saved')
    ? 'saved'
    : 'courses';

  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);

  // AI Summarizer Notes State
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<VideoSummaryData | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);

  // AI RAG Doubt Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [questionInput, setQuestionInput] = useState<string>('');
  const [isAskingDoubt, setIsAskingDoubt] = useState<boolean>(false);
  const [doubtError, setDoubtError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Flow Mind Map Generator State (Phase 5 Step 2)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState<boolean>(false);
  const [selectedMindMapVideoId, setSelectedMindMapVideoId] = useState<string>('');
  const [selectedNodeData, setSelectedNodeData] = useState<MindMapNode | null>(null);
  const [mindMapError, setMindMapError] = useState<string | null>(null);

  const tabs = [
    { id: 'courses', label: 'All Courses', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'videos', label: 'Video Player & AI Notes', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'mindmap', label: 'AI Mind Map Canvas', icon: <Network className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Bookmarks', icon: <Bookmark className="w-4 h-4" /> },
  ];

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const data = await videoApi.listVideos();
      setVideos(data);
      if (data.length > 0 && !selectedVideo) {
        setSelectedVideo(data[0]);
        setSelectedMindMapVideoId(data[0]._id);
      }
    } catch (err: any) {
      console.error('[LearnPage] Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Convert MindMapNode array to React Flow Nodes & Edges layout
  const constructReactFlowGraph = (rawNodes: MindMapNode[]) => {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    const rootNodes = rawNodes.filter((n) => n.parentId === null || n.category === 'root');
    const childMap: Record<string, MindMapNode[]> = {};

    rawNodes.forEach((n) => {
      if (n.parentId) {
        if (!childMap[n.parentId]) childMap[n.parentId] = [];
        childMap[n.parentId].push(n);
      }
    });

    let currentY = 80;
    rootNodes.forEach((root) => {
      rfNodes.push({
        id: root.id,
        position: { x: 250, y: currentY },
        data: { label: root.label, meta: root },
        style: {
          background: 'var(--color-nocturnal-expedition)',
          color: 'var(--color-forsythia)',
          border: '2px solid var(--color-forsythia)',
          borderRadius: '10px',
          padding: '12px 20px',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
        },
      });

      const children = childMap[root.id] || [];
      children.forEach((child, cIdx) => {
        const childX = 60 + cIdx * 300;
        const childY = currentY + 160;

        rfNodes.push({
          id: child.id,
          position: { x: childX, y: childY },
          data: { label: child.label, meta: child },
          style: {
            background: 'var(--color-oceanic-noir)',
            color: 'var(--color-arctic-powder)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '12px',
          },
        });

        rfEdges.push({
          id: `e-${root.id}-${child.id}`,
          source: root.id,
          target: child.id,
          animated: true,
          style: { stroke: 'var(--color-forsythia)', strokeWidth: 2 },
        });

        const subChildren = childMap[child.id] || [];
        subChildren.forEach((sub, sIdx) => {
          const subX = childX + (sIdx - (subChildren.length - 1) / 2) * 160;
          const subY = childY + 140;

          rfNodes.push({
            id: sub.id,
            position: { x: subX, y: subY },
            data: { label: sub.label, meta: sub },
            style: {
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-secondary)',
              border: '1px border-[var(--color-border-subtle)]',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '11px',
            },
          });

          rfEdges.push({
            id: `e-${child.id}-${sub.id}`,
            source: child.id,
            target: sub.id,
            style: { stroke: 'var(--color-border)', strokeWidth: 1.5 },
          });
        });
      });

      currentY += 400;
    });

    setNodes(rfNodes);
    setEdges(rfEdges);
  };

  // Generate React Flow Mind Map
  const handleGenerateMindMap = async () => {
    const targetId = selectedMindMapVideoId || selectedVideo?._id || 'demo_video';
    setIsGeneratingMindMap(true);
    setMindMapError(null);

    try {
      const data = await aiApi.generateMindMap(targetId);
      constructReactFlowGraph(data.nodes);
    } catch (err: any) {
      setMindMapError(err.response?.data?.message || err.message || 'Failed to generate mind map');
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mindmap' && nodes.length === 0) {
      handleGenerateMindMap();
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    navigate(`/personal/learn/${tabId}`);
  };

  const handleGenerateNotes = async () => {
    if (!selectedVideo) return;
    setIsSummarizing(true);
    setSummaryError(null);

    try {
      const data = await aiApi.summarizeVideo(selectedVideo._id);
      setSummaryData(data);
    } catch (err: any) {
      setSummaryError(err.response?.data?.message || err.message || 'Failed to generate AI notes.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSendDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || !selectedVideo || isAskingDoubt) return;

    const userText = questionInput.trim();
    setQuestionInput('');
    setDoubtError(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAskingDoubt(true);

    try {
      const res: AskDoubtResponseData = await aiApi.askDoubt(selectedVideo._id, userText);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedSegments: res.retrievedSegments,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setDoubtError(err.response?.data?.message || err.message || 'Failed to fetch doubt response.');
    } finally {
      setIsAskingDoubt(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!titleInput) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitleInput(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a video file.');
      return;
    }
    if (!titleInput.trim()) {
      setUploadError('Please provide a title for the video.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('title', titleInput.trim());
      formData.append('video', selectedFile);

      setUploadProgress(40);
      await videoApi.uploadVideo(formData);
      setUploadProgress(100);

      setIsUploadModalOpen(false);
      setTitleInput('');
      setSelectedFile(null);
      fetchVideos();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed. Please check backend server.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Learn & Video Intelligence OS
            </h1>
            <Badge variant="primary">Personal Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Access video lectures, auto-generated AI notes, RAG doubt assistant, and interactive React Flow Mind Maps.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<UploadCloud className="w-4 h-4" />}
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload New Video
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* Sub-Tab 1: All Courses Grid */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col gap-3">
                <Skeleton variant="rectangular" className="h-40 w-full rounded-[var(--radius-md)]" />
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" className="w-1/2" />
              </Card>
            ))
          ) : videos.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<PlayCircle className="w-12 h-12 text-[var(--color-text-muted)]" />}
                title="No Video Lectures Uploaded"
                description="Upload your first lecture video to unlock AI notes, doubt solving, and mind maps."
                action={
                  <Button
                    variant="primary"
                    leftIcon={<UploadCloud className="w-4 h-4" />}
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Upload Video
                  </Button>
                }
              />
            </div>
          ) : (
            videos.map((vid) => (
              <Card
                key={vid._id}
                className="group cursor-pointer hover:border-[var(--color-forsythia)] transition-all flex flex-col justify-between"
                onClick={() => {
                  setSelectedVideo(vid);
                  setSelectedMindMapVideoId(vid._id);
                  navigate('/personal/learn/videos');
                }}
              >
                <div>
                  <div className="aspect-video w-full rounded-[var(--radius-md)] bg-[var(--color-nocturnal-expedition)] flex items-center justify-center relative overflow-hidden mb-3 border border-[var(--color-border-subtle)]">
                    <PlayCircle className="w-12 h-12 text-[var(--color-forsythia)] group-hover:scale-110 transition-transform" />
                    <Badge variant="secondary" className="absolute bottom-2 right-2 font-mono text-[10px]">
                      {vid.status.toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="font-header text-sm font-semibold text-[var(--color-arctic-powder)] group-hover:text-[var(--color-forsythia)] transition-colors line-clamp-2">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated {new Date(vid.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] font-mono">
                  <span>AI Video Notes Ready</span>
                  <span className="text-[var(--color-forsythia)] group-hover:translate-x-1 transition-transform">
                    Watch Lecture &rarr;
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Sub-Tab 2: Video Player & AI Notes Workspace */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Player & Notes (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {selectedVideo ? (
              <Card className="flex flex-col gap-4">
                {/* HTML5 Video Player Container */}
                <div className="aspect-video w-full rounded-[var(--radius-md)] bg-black overflow-hidden relative border border-[var(--color-border)]">
                  {selectedVideo.videoUrl ? (
                    <video
                      ref={videoRef}
                      controls
                      src={selectedVideo.videoUrl}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--color-text-muted)] gap-2">
                      <PlayCircle className="w-12 h-12 text-[var(--color-forsythia)] opacity-60" />
                      <p className="font-semibold text-[var(--color-arctic-powder)]">{selectedVideo.title}</p>
                      <p>Video streaming URL will connect once backend processing completes.</p>
                    </div>
                  )}
                </div>

                {/* Video Info Header */}
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-4">
                  <div>
                    <h2 className="font-header text-lg font-bold text-[var(--color-arctic-powder)]">
                      {selectedVideo.title}
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Status: <strong className="text-[var(--color-forsythia)]">{selectedVideo.status}</strong>
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleGenerateNotes}
                    isLoading={isSummarizing}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Generate AI Notes
                  </Button>
                </div>

                {/* AI Notes Container */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[var(--color-forsythia)]" /> AI Generated Lecture Notes
                    </span>
                    {summaryData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(summaryData.notesMarkdown);
                          setCopiedNotes(true);
                          setTimeout(() => setCopiedNotes(false), 2000);
                        }}
                        leftIcon={copiedNotes ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      >
                        {copiedNotes ? 'Copied!' : 'Copy Notes'}
                      </Button>
                    )}
                  </div>

                  {summaryError && (
                    <Alert type="error" title="Notes Generation Error">
                      {summaryError}
                    </Alert>
                  )}

                  {isSummarizing ? (
                    <div className="p-8 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col items-center justify-center text-center gap-3">
                      <RefreshCw className="w-6 h-6 text-[var(--color-forsythia)] animate-spin" />
                      <p className="text-xs font-semibold text-[var(--color-arctic-powder)]">
                        Claude AI is analyzing transcript and generating structured notes...
                      </p>
                    </div>
                  ) : summaryData ? (
                    <div className="p-5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                      {summaryData.notesMarkdown}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[var(--color-text-muted)] rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)]">
                      Click "Generate AI Notes" to extract structured chapters and key summaries from this lecture.
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={<PlayCircle className="w-12 h-12 text-[var(--color-text-muted)]" />}
                title="No Video Selected"
                description="Select a course from the All Courses tab to watch and analyze."
              />
            )}
          </div>

          {/* Right Column: AI RAG Doubt Assistant (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card className="h-[680px] flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)] shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[var(--color-forsythia)]" /> AI Doubt Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions scoped exclusively to this lecture's content.
                </CardDescription>
              </CardHeader>

              {/* Chat Thread */}
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {doubtError && (
                  <Alert type="error" title="Doubt Error">
                    {doubtError}
                  </Alert>
                )}
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[var(--color-text-muted)] p-4 gap-2">
                    <MessageSquare className="w-8 h-8 text-[var(--color-forsythia)] opacity-40" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">Ask any lecture doubt</p>
                    <p>Answers are strictly grounded in transcript segments.</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 text-xs max-w-[85%] ${
                        msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-[var(--radius-md)] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[var(--color-forsythia)] text-[var(--color-oceanic-noir)] font-semibold'
                            : 'bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] border border-[var(--color-border)]'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <span className="text-[10px] text-[var(--color-text-muted)] px-1">{msg.timestamp}</span>
                    </div>
                  ))
                )}

                {isAskingDoubt && (
                  <div className="self-start p-3 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-forsythia)]" /> Searching transcript segments...
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendDoubt} className="p-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2 shrink-0">
                <Input
                  placeholder="Ask a question about this video..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  disabled={isAskingDoubt || !selectedVideo}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAskingDoubt || !selectedVideo || !questionInput.trim()}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Ask
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: AI Mind Map Interactive Canvas (Phase 5 Step 2) */}
      {activeTab === 'mindmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Controls & Inspector (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="w-4 h-4 text-[var(--color-forsythia)]" /> Mind Map Controls
                </CardTitle>
                <CardDescription>
                  Select lecture video to render interactive node graph.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Target Lecture Video
                </label>
                <select
                  value={selectedMindMapVideoId}
                  onChange={(e) => setSelectedMindMapVideoId(e.target.value)}
                  className="w-full bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 focus:outline-none focus:border-[var(--color-forsythia)]"
                >
                  {videos.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.title}
                    </option>
                  ))}
                </select>

                <Button
                  variant="primary"
                  size="md"
                  className="mt-1"
                  onClick={handleGenerateMindMap}
                  isLoading={isGeneratingMindMap}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Generate AI Mind Map
                </Button>
              </CardContent>
            </Card>

            {/* Selected Node Inspector Drawer */}
            <Card>
              <CardHeader className="pb-2 border-b border-[var(--color-border-subtle)]">
                <CardTitle className="text-xs flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5 text-[var(--color-forsythia)]">
                    <Layers className="w-3.5 h-3.5" /> Node Detail Inspector
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {selectedNodeData ? (
                  <div className="flex flex-col gap-2 text-xs">
                    <span className="font-mono text-[10px] text-[var(--color-forsythia)] uppercase font-bold">
                      Category: {selectedNodeData.category}
                    </span>
                    <h3 className="font-header font-bold text-[var(--color-arctic-powder)] text-sm">
                      {selectedNodeData.label}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed mt-1">
                      {selectedNodeData.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
                    Click any node in the graph on the right to inspect details.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: React Flow Graph Canvas (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="h-[620px] flex flex-col overflow-hidden">
              <CardHeader className="py-2.5 px-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-oceanic-noir)] shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[var(--color-arctic-powder)] flex items-center gap-2">
                    <Network className="w-4 h-4 text-[var(--color-forsythia)]" />
                    React Flow Interactive Mind Map Graph
                  </span>
                  <Badge variant="primary" className="font-mono text-[10px]">
                    @xyflow/react
                  </Badge>
                </div>
              </CardHeader>

              <div className="flex-1 w-full bg-[#0d1b22] relative">
                {mindMapError && (
                  <Alert type="error" title="Mind Map Error" className="m-4 z-20 absolute top-2 left-2 right-2">
                    {mindMapError}
                  </Alert>
                )}
                {isGeneratingMindMap ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-xs text-[var(--color-text-muted)] gap-3">
                    <RefreshCw className="w-8 h-8 text-[var(--color-forsythia)] animate-spin" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">Generating React Flow Graph Layout...</p>
                  </div>
                ) : (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(_evt, node) => {
                      if (node.data && node.data.meta) {
                        setSelectedNodeData(node.data.meta as MindMapNode);
                      }
                    }}
                    fitView
                  >
                    <Background color="var(--color-border)" gap={20} />
                    <Controls />
                  </ReactFlow>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Saved Bookmarks */}
      {activeTab === 'saved' && (
        <EmptyState
          icon={<Bookmark className="w-12 h-12 text-[var(--color-text-muted)]" />}
          title="No Saved Bookmarks Yet"
          description="Bookmark video timestamps and AI notes to revisit them quickly."
        />
      )}

      {/* Upload Video Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Video Lecture"
      >
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
          <Input
            label="Video Title"
            placeholder="e.g. Distributed Queue Systems in Node.js"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            disabled={isUploading}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">Select Video File</label>
            <div
              className="border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-forsythia)] transition-colors bg-[var(--color-oceanic-noir)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-8 h-8 text-[var(--color-forsythia)] mb-2" />
              <p className="text-xs font-semibold text-[var(--color-arctic-powder)]">
                {selectedFile ? selectedFile.name : 'Click to select or drag video file'}
              </p>
              <span className="text-[10px] text-[var(--color-text-muted)] mt-1">MP4, MOV, or WEBM format</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {uploadError && (
            <Alert type="error" title="Upload Failed">
              {uploadError}
            </Alert>
          )}

          {isUploading && (
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-mono text-[10px] text-[var(--color-text-secondary)]">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-bg-surface)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-forsythia)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isUploading}>
              Upload & Process
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
