import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map, BarChart2, Target, CheckCircle2, AlertTriangle, ArrowUpRight, RefreshCw, Sparkles, Award, Clock, PlayCircle, Layers, FileText, Download, Briefcase, Bot, Send, Trophy, Play, Mic, Video, Camera, Square, Plus, Calendar } from 'lucide-react';
import { careerApi, SkillGapResponseData, CareerRoadmapResponseData } from '../../services/career.api';
import { resumeApi, TailoredResumeResponseData } from '../../services/resume.api';
import { interviewApi, StartInterviewResponseData, SubmitAnswerResponseData } from '../../services/interview.api';
import { jobApi, JobApplicationsResponse, ApplicationStatus } from '../../services/job.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';

export interface TurnRecord {
  questionId: string;
  questionText: string;
  userAnswerText?: string;
  score?: number;
  feedback?: string;
}

export type InterviewMode = 'text' | 'audio' | 'video';

export const CareerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/placement')
    ? 'placement'
    : location.pathname.endsWith('/interview')
    ? 'interview'
    : location.pathname.endsWith('/resume')
    ? 'resume'
    : location.pathname.endsWith('/skills')
    ? 'skills'
    : 'roadmap';

  const careerTabs = [
    { id: 'roadmap', label: 'Career Roadmap', icon: <Map className="w-4 h-4" /> },
    { id: 'skills', label: 'Skill Gap Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'resume', label: 'AI Resume Builder & ATS', icon: <FileText className="w-4 h-4" /> },
    { id: 'interview', label: 'AI Mock Interview', icon: <Bot className="w-4 h-4" /> },
    { id: 'placement', label: 'Placement Tracker', icon: <Briefcase className="w-4 h-4" /> },
  ];

  // Selected Role State
  const [selectedRoleId, setSelectedRoleId] = useState<string>('fullstack_ai');

  // Skill Gap State
  const [gapData, setGapData] = useState<SkillGapResponseData | null>(null);
  const [isLoadingGap, setIsLoadingGap] = useState<boolean>(true);
  const [gapError, setGapError] = useState<string | null>(null);

  // Roadmap Generator State
  const [roadmapData, setRoadmapData] = useState<CareerRoadmapResponseData | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState<boolean>(true);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // Resume Builder & ATS State
  const [fullNameInput, setFullNameInput] = useState<string>('QA Student');
  const [targetCompanyInput, setTargetCompanyInput] = useState<string>('Google');
  const [targetRoleInput, setTargetRoleInput] = useState<string>('Senior Software Engineer');
  const [rawResumeInput, setRawResumeInput] = useState<string>(
    `Developed microservices and REST endpoints using Node.js, Express, and MongoDB. Integrated Redis queues for async background jobs. Improved system performance and wrote unit tests.`
  );
  const [isTailoring, setIsTailoring] = useState<boolean>(false);
  const [tailorData, setTailorData] = useState<TailoredResumeResponseData | null>(null);
  const [tailorError, setTailorError] = useState<string | null>(null);

  // Mock Interview State
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('text');
  const [interviewRoleInput, setInterviewRoleInput] = useState<string>('Full Stack AI Engineer');
  const [interviewCategory, setInterviewCategory] = useState<string>('Technical');
  const [isStartingInterview, setIsStartingInterview] = useState<boolean>(false);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{ questionId: string; questionText: string } | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [historyTurns, setHistoryTurns] = useState<TurnRecord[]>([]);
  const [interviewStatus, setInterviewStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [interviewError, setInterviewError] = useState<string | null>(null);

  // Audio / Video Recording Hardware State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const webCamRef = useRef<HTMLVideoElement | null>(null);

  // Placement Tracker State
  const [placementData, setPlacementData] = useState<JobApplicationsResponse | null>(null);
  const [isLoadingPlacement, setIsLoadingPlacement] = useState<boolean>(true);
  const [placementError, setPlacementError] = useState<string | null>(null);

  // Add Job Application Form State
  const [newCompany, setNewCompany] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Eligible');
  const [newDeadline, setNewDeadline] = useState<string>('');
  const [newMatchScore] = useState<number>(85);
  const [isCreatingJob, setIsCreatingJob] = useState<boolean>(false);

  // Fetch Skill Gap
  const fetchSkillGap = async (roleId: string) => {
    setIsLoadingGap(true);
    setGapError(null);
    try {
      const data = await careerApi.getSkillGapAnalytics(roleId);
      setGapData(data);
    } catch (err: any) {
      setGapError(err.response?.data?.message || err.message || 'Failed to fetch skill gap analytics.');
    } finally {
      setIsLoadingGap(false);
    }
  };

  // Fetch Personalized Career Roadmap
  const fetchRoadmap = async (roleId: string) => {
    setIsLoadingRoadmap(true);
    setRoadmapError(null);
    try {
      const data = await careerApi.getCareerRoadmap(roleId);
      setRoadmapData(data);
    } catch (err: any) {
      setRoadmapError(err.response?.data?.message || err.message || 'Failed to generate career roadmap.');
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  // Fetch Placement Job Applications
  const fetchPlacement = async () => {
    setIsLoadingPlacement(true);
    setPlacementError(null);
    try {
      const data = await jobApi.getJobApplications();
      setPlacementData(data);
    } catch (err: any) {
      setPlacementError(err.response?.data?.message || err.message || 'Failed to fetch placement applications.');
    } finally {
      setIsLoadingPlacement(false);
    }
  };

  // Create Job Application
  const handleCreateJobApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;

    setIsCreatingJob(true);
    try {
      await jobApi.createJobApplication({
        companyName: newCompany,
        roleTitle: newRole,
        status: newStatus,
        applicationDeadline: newDeadline,
        matchScore: newMatchScore,
      });
      setNewCompany('');
      setNewRole('');
      fetchPlacement();
    } catch (err: any) {
      setPlacementError(err.response?.data?.message || err.message || 'Failed to add job application.');
    } finally {
      setIsCreatingJob(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, status: ApplicationStatus) => {
    try {
      await jobApi.updateApplicationStatus(id, status);
      fetchPlacement();
    } catch (err: any) {
      console.error('Failed to update status:', err);
    }
  };

  // Start Camera Stream for Video Mode
  const startCameraStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: interviewMode === 'video',
          audio: true,
        });
        setMediaStream(stream);
        if (webCamRef.current) {
          webCamRef.current.srcObject = stream;
        }
      }
    } catch (err: any) {
      console.warn('[CareerPage] Media recording device access error:', err.message);
    }
  };

  // Stop Camera Stream
  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsRecording(false);
  };

  // Toggle Voice Recognition / Recording
  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      if (!answerInput) {
        setAnswerInput('I would design the microservice architecture using an event-driven BullMQ worker queue connected to Redis...');
      }
    }
  };

  // Start Mock Interview Session
  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewRoleInput) return;

    setIsStartingInterview(true);
    setInterviewError(null);
    setHistoryTurns([]);
    setFinalScore(null);
    setAnswerInput('');

    try {
      const res: StartInterviewResponseData = await interviewApi.startInterview(interviewRoleInput, interviewCategory);
      setActiveInterviewId(res.interviewId);
      setCurrentQuestion(res.question);
      setInterviewStatus('in_progress');

      if (interviewMode === 'video' || interviewMode === 'audio') {
        startCameraStream();
      }
    } catch (err: any) {
      setInterviewError(err.response?.data?.message || err.message || 'Failed to start mock interview session.');
    } finally {
      setIsStartingInterview(false);
    }
  };

  // Submit Answer to Active Interview Question
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterviewId || !answerInput.trim() || !currentQuestion) return;

    const submittedAnswer = answerInput.trim();
    setAnswerInput('');
    setIsSubmittingAnswer(true);
    setInterviewError(null);

    try {
      const res: SubmitAnswerResponseData = await interviewApi.submitAnswer(activeInterviewId, submittedAnswer);

      // Record Turn in History Stack
      const turn: TurnRecord = {
        questionId: currentQuestion.questionId,
        questionText: currentQuestion.questionText,
        userAnswerText: submittedAnswer,
        score: res.score,
        feedback: res.feedback,
      };

      setHistoryTurns((prev) => [...prev, turn]);

      if (res.status === 'completed' || !res.nextQuestion) {
        setInterviewStatus('completed');
        setFinalScore(res.overallScore || res.score);
        setCurrentQuestion(null);
        stopCameraStream();
      } else {
        setCurrentQuestion(res.nextQuestion);
      }
    } catch (err: any) {
      setInterviewError(err.response?.data?.message || err.message || 'Failed to evaluate interview response.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Trigger Resume Tailor & ATS Score Calculation
  const handleTailorResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawResumeInput || !targetCompanyInput || !targetRoleInput) return;

    setIsTailoring(true);
    setTailorError(null);

    try {
      const res = await resumeApi.tailorResume({
        rawResumeText: rawResumeInput,
        targetCompany: targetCompanyInput,
        targetRole: targetRoleInput,
      });
      setTailorData(res);
    } catch (err: any) {
      setTailorError(err.response?.data?.message || err.message || 'Resume tailoring failed.');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  useEffect(() => {
    if (currentTab === 'skills') {
      fetchSkillGap(selectedRoleId);
    } else if (currentTab === 'roadmap') {
      fetchRoadmap(selectedRoleId);
    } else if (currentTab === 'placement') {
      fetchPlacement();
    }
  }, [currentTab, selectedRoleId]);

  const handleTabChange = (tabId: string) => {
    navigate(`/personal/career/${tabId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Offer':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Offer Received
          </Badge>
        );
      case 'Interview':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Interviewing
          </Badge>
        );
      case 'Applied':
      case 'Screening':
        return (
          <Badge variant="primary" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Applied
          </Badge>
        );
      case 'Mastered':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Mastered
          </Badge>
        );
      case 'On Track':
        return (
          <Badge variant="primary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> On Track
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {status}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 font-body print:p-0">
      {/* Page Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Career Preparation & Placement
            </h1>
            <Badge variant="primary">Personal Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Track job applications, deadlines, placement eligibility scores, ATS resumes, and mock interviews.
          </p>
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <Tabs
        tabs={careerTabs}
        activeTab={currentTab}
        onChange={handleTabChange}
        variant="underline"
        className="print:hidden"
      />

      {/* Tab 1: Personalized AI Career Roadmap Generator */}
      {currentTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Role Selector & Milestone Overview (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--color-forsythia)]" /> Target Industry Role
                </CardTitle>
                <CardDescription>
                  Select a role to generate a personalized learning roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Target Role Taxonomy
                  </label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 focus:outline-none focus:border-[var(--color-forsythia)]"
                  >
                    <option value="fullstack_ai">Full Stack AI Engineer</option>
                    <option value="backend_queues">Backend & Queues Architect</option>
                    <option value="ml_rag">AI / ML & RAG Specialist</option>
                  </select>

                  {roadmapData && (
                    <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {roadmapData.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roadmap Overview Card */}
            {roadmapData && !isLoadingRoadmap && (
              <Card className="bg-gradient-to-br from-[var(--color-oceanic-noir)] to-[var(--color-nocturnal-expedition)] border-[var(--color-border)]">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] font-mono uppercase">
                      Est. Completion Time
                    </span>
                    <span className="font-header text-lg font-bold text-[var(--color-forsythia)] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {roadmapData.estimatedWeeks} Weeks ({roadmapData.totalHours} hrs)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] font-mono uppercase">
                      Total Milestones
                    </span>
                    <Badge variant="primary" className="font-mono text-xs">
                      {roadmapData.totalMilestones} Phases
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Ordered Learning Plan & Video Links (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[var(--color-forsythia)]" />
                    Ordered Learning Plan & Platform Video Links
                  </CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => fetchRoadmap(selectedRoleId)}
                  >
                    Regenerate Roadmap
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {roadmapError && (
                  <Alert type="error" title="Roadmap Error" className="mb-4">
                    {roadmapError}
                  </Alert>
                )}

                {isLoadingRoadmap ? (
                  <div className="flex flex-col gap-4">
                    <Skeleton variant="rectangular" className="h-28 w-full" />
                    <Skeleton variant="rectangular" className="h-28 w-full" />
                    <Skeleton variant="rectangular" className="h-28 w-full" />
                  </div>
                ) : roadmapData ? (
                  <div className="flex flex-col gap-4">
                    {roadmapData.roadmapMilestones.map((ms) => (
                      <div
                        key={ms.phaseNumber}
                        className="p-5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs flex flex-col gap-3"
                      >
                        {/* Phase Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-[var(--color-forsythia)] uppercase tracking-wider">
                              {ms.phaseTitle}
                            </span>
                            <h3 className="font-header text-sm font-semibold text-[var(--color-arctic-powder)] mt-0.5">
                              {ms.skillName}
                            </h3>
                          </div>
                          <Badge variant="primary" className="font-mono text-[10px]">
                            Goal: {ms.targetLevel}%
                          </Badge>
                        </div>

                        {/* Objectives List */}
                        <div className="flex flex-col gap-1 text-[var(--color-text-secondary)]">
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">
                            Learning Objectives:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] mt-0.5">
                            {ms.learningObjectives.map((obj, oIdx) => (
                              <li key={oIdx}>{obj}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Linked Platform Video Lecture */}
                        {ms.linkedVideo && (
                          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-between gap-3 mt-1">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <PlayCircle className="w-5 h-5 text-[var(--color-forsythia)] shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">
                                  Linked Platform Video:
                                </span>
                                <p className="font-semibold text-[var(--color-arctic-powder)] truncate text-[11px]">
                                  {ms.linkedVideo.title}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="secondary"
                              size="sm"
                              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                              onClick={() => navigate('/personal/learn/videos')}
                            >
                              Watch Lecture
                            </Button>
                          </div>
                        )}

                        {/* Practice Skill Navigation */}
                        <div className="flex items-center justify-between pt-2 text-[11px]">
                          <span className="text-[var(--color-text-muted)] font-mono">
                            Est. Time: {ms.estimatedHours} Hours
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                            onClick={() => {
                              if (ms.practiceType === 'quiz') {
                                navigate('/personal/practice/quizzes');
                              } else {
                                navigate('/personal/practice/coding');
                              }
                            }}
                          >
                            {ms.practiceType === 'quiz' ? 'Take Skill Quiz' : 'Run Monaco Code Challenge'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Skill Gap Analytics Module */}
      {currentTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Target Role Selection & Match Card (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--color-forsythia)]" /> Target Industry Role
                </CardTitle>
                <CardDescription>
                  Select a role to benchmark your demonstrated Phase 3 skills.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isLoadingGap ? (
                  <Skeleton variant="rectangular" className="h-10 w-full" />
                ) : (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                      Target Role Taxonomy
                    </label>
                    <select
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      className="w-full bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 focus:outline-none focus:border-[var(--color-forsythia)]"
                    >
                      {gapData?.availableRoles.map((r) => (
                        <option key={r.roleId} value={r.roleId}>
                          {r.roleName}
                        </option>
                      ))}
                    </select>

                    {gapData && (
                      <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {gapData.description}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Match Percentage Highlight Card */}
            {gapData && !isLoadingGap && (
              <Card className="bg-gradient-to-br from-[var(--color-oceanic-noir)] to-[var(--color-nocturnal-expedition)] border-[var(--color-border)]">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] font-mono uppercase">
                      Job Readiness Match
                    </span>
                    <h2 className="font-header text-3xl font-bold text-[var(--color-arctic-powder)] mt-1">
                      {gapData.overallMatchPercentage}%
                    </h2>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Based on aggregated quiz & coding sandbox scores.
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-forsythia)] flex items-center justify-center shrink-0">
                    <Award className="w-7 h-7 text-[var(--color-forsythia)]" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Skill Breakdown & Visual Gap Bars (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-[var(--color-forsythia)]" />
                    Skill Gap Breakdown & Benchmarking
                  </CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={() => fetchSkillGap(selectedRoleId)}
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {gapError && (
                  <Alert type="error" title="Skill Gap Error" className="mb-4">
                    {gapError}
                  </Alert>
                )}

                {isLoadingGap ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton variant="rectangular" className="h-20 w-full" />
                    <Skeleton variant="rectangular" className="h-20 w-full" />
                    <Skeleton variant="rectangular" className="h-20 w-full" />
                  </div>
                ) : gapData ? (
                  <div className="flex flex-col gap-4">
                    {gapData.skillBreakdown.map((item) => (
                      <div
                        key={item.skillId}
                        className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-header text-sm font-semibold text-[var(--color-arctic-powder)]">
                                {item.skillName}
                              </span>
                              <Badge variant="secondary" className="font-mono text-[10px]">
                                {item.category}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                              Demonstrated: <strong className="text-[var(--color-forsythia)]">{item.userLevel}%</strong> | Required: <strong className="text-[var(--color-arctic-powder)]">{item.requiredLevel}%</strong>
                            </p>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Dual Progress Bar */}
                        <div className="flex flex-col gap-1">
                          <div className="w-full h-2.5 rounded-full bg-[var(--color-bg-surface)] overflow-hidden border border-[var(--color-border)] relative">
                            {/* Target Required Marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                              style={{ left: `${item.requiredLevel}%` }}
                              title={`Required: ${item.requiredLevel}%`}
                            />
                            {/* User Demonstrated Bar */}
                            <div
                              className={`h-full transition-all duration-500 ${
                                item.userLevel >= item.requiredLevel
                                  ? 'bg-green-500'
                                  : item.userLevel >= item.requiredLevel - 15
                                  ? 'bg-[var(--color-forsythia)]'
                                  : 'bg-[var(--color-deep-saffron)]'
                              }`}
                              style={{ width: `${item.userLevel}%` }}
                            />
                          </div>
                        </div>

                        {/* Recommendation Action Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)] text-[11px]">
                          <span className="text-[var(--color-text-secondary)]">{item.recommendedAction}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                            onClick={() => {
                              if (item.skillId.includes('queues') || item.skillId.includes('rag')) {
                                navigate('/personal/practice/quizzes');
                              } else {
                                navigate('/personal/practice/coding');
                              }
                            }}
                          >
                            Practice Skill
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: AI Resume Builder & ATS Scoring Module */}
      {currentTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Input Controls (1 Col) */}
          <div className="flex flex-col gap-4 print:hidden">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[var(--color-forsythia)]" /> Target Job & Candidate
                </CardTitle>
                <CardDescription>
                  Enter your background and target position to generate Google XYZ format bullet points.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTailorResume} className="flex flex-col gap-3">
                  <Input
                    label="Candidate Full Name"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    disabled={isTailoring}
                  />

                  <Input
                    label="Target Company"
                    value={targetCompanyInput}
                    onChange={(e) => setTargetCompanyInput(e.target.value)}
                    disabled={isTailoring}
                  />

                  <Input
                    label="Target Job Role"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    disabled={isTailoring}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                      Raw Experience / Skills Text
                    </label>
                    <textarea
                      rows={5}
                      value={rawResumeInput}
                      onChange={(e) => setRawResumeInput(e.target.value)}
                      disabled={isTailoring}
                      className="bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 focus:outline-none focus:border-[var(--color-forsythia)]"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="mt-2"
                    isLoading={isTailoring}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Tailor Resume & Rate ATS
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tailored Resume & ATS Feedback Card (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)] print:hidden">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--color-forsythia)]" />
                    ATS Optimization & Google XYZ Resume Preview
                  </CardTitle>

                  {tailorData && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      onClick={handleExportPDF}
                    >
                      Export PDF Resume
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {tailorError && (
                  <Alert type="error" title="Tailoring Error" className="mb-4">
                    {tailorError}
                  </Alert>
                )}

                {isTailoring ? (
                  <div className="p-12 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col items-center justify-center text-center gap-3">
                    <RefreshCw className="w-8 h-8 text-[var(--color-forsythia)] animate-spin" />
                    <div>
                      <p className="font-header text-sm font-semibold text-[var(--color-arctic-powder)]">
                        Claude AI is Analyzing & Tailoring Resume...
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Formulating Google XYZ accomplishment bullets and scanning ATS keyword coverage.
                      </p>
                    </div>
                  </div>
                ) : tailorData ? (
                  <div className="flex flex-col gap-6">
                    {/* ATS Score Header */}
                    <div className="p-5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex items-center justify-between gap-4 print:hidden">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-nocturnal-expedition)] border border-[var(--color-forsythia)] flex items-center justify-center shrink-0">
                          <Award className="w-7 h-7 text-[var(--color-forsythia)]" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider font-mono">
                            ATS Keyword Match
                          </span>
                          <h2 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)] mt-0.5">
                            Score: <span className="text-[var(--color-forsythia)]">{tailorData.atsScore}%</span>
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={tailorData.atsScore >= 80 ? 'success' : 'warning'}>
                          {tailorData.atsScore >= 80 ? 'High ATS Match' : 'Optimization Recommended'}
                        </Badge>
                      </div>
                    </div>

                    {/* Missing Keywords Warning */}
                    {tailorData.missingKeywords && tailorData.missingKeywords.length > 0 && (
                      <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-amber-500/40 text-xs flex flex-col gap-2 print:hidden">
                        <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> Recommended ATS Keywords to Add:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {tailorData.missingKeywords.map((kw, kIdx) => (
                            <Badge key={kIdx} variant="secondary" className="font-mono text-[10px]">
                              + {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Printable Formatted Resume Document */}
                    <div className="p-8 rounded-[var(--radius-md)] bg-white text-gray-900 shadow-md flex flex-col gap-4 font-sans print:shadow-none print:p-0">
                      {/* Document Header */}
                      <div className="border-b border-gray-300 pb-3">
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">{fullNameInput}</h1>
                        <p className="text-sm font-semibold text-gray-600 mt-0.5">
                          {targetRoleInput} | Target: {targetCompanyInput}
                        </p>
                      </div>

                      {/* Executive Summary */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Executive Summary</h3>
                        <p className="text-xs text-gray-700 leading-relaxed">{tailorData.summaryMarkdown.replace(/## Tailored Executive Summary\n/, '')}</p>
                      </div>

                      {/* Accomplishments (Google XYZ Format) */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Key Accomplishments (Google XYZ Formula)</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700 leading-relaxed">
                          {tailorData.tailoredBullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
                    <FileText className="w-10 h-10 text-[var(--color-text-muted)] opacity-40" />
                    <p className="font-semibold text-[var(--color-text-secondary)]">No Resume Tailored Yet</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                      Fill out your background and target position on the left and click "Tailor Resume & Rate ATS" to view Google XYZ formula bullets and ATS optimization scores.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: AI Mock Interview System Module */}
      {currentTab === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Setup Interview Controls & Mode Selector (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[var(--color-forsythia)]" /> Interview Setup & Response Mode
                </CardTitle>
                <CardDescription>
                  Choose response format (Text, Audio, or Video webcam feed) and target role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStartInterview} className="flex flex-col gap-3">
                  {/* Response Capture Mode Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                      Response Mode Selection
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setInterviewMode('text')}
                        disabled={interviewStatus === 'in_progress'}
                        className={`p-2.5 rounded-[var(--radius-md)] border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          interviewMode === 'text'
                            ? 'bg-[var(--color-forsythia)] text-[var(--color-oceanic-noir)] border-[var(--color-forsythia)]'
                            : 'bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] border-[var(--color-border)] hover:border-[var(--color-forsythia)]'
                        }`}
                      >
                        <FileText className="w-4 h-4" /> Text
                      </button>

                      <button
                        type="button"
                        onClick={() => setInterviewMode('audio')}
                        disabled={interviewStatus === 'in_progress'}
                        className={`p-2.5 rounded-[var(--radius-md)] border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          interviewMode === 'audio'
                            ? 'bg-[var(--color-forsythia)] text-[var(--color-oceanic-noir)] border-[var(--color-forsythia)]'
                            : 'bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] border-[var(--color-border)] hover:border-[var(--color-forsythia)]'
                        }`}
                      >
                        <Mic className="w-4 h-4" /> Audio
                      </button>

                      <button
                        type="button"
                        onClick={() => setInterviewMode('video')}
                        disabled={interviewStatus === 'in_progress'}
                        className={`p-2.5 rounded-[var(--radius-md)] border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          interviewMode === 'video'
                            ? 'bg-[var(--color-forsythia)] text-[var(--color-oceanic-noir)] border-[var(--color-forsythia)]'
                            : 'bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] border-[var(--color-border)] hover:border-[var(--color-forsythia)]'
                        }`}
                      >
                        <Video className="w-4 h-4" /> Video
                      </button>
                    </div>
                  </div>

                  <Input
                    label="Target Job Role"
                    placeholder="e.g. Full Stack AI Engineer"
                    value={interviewRoleInput}
                    onChange={(e) => setInterviewRoleInput(e.target.value)}
                    disabled={isStartingInterview || interviewStatus === 'in_progress'}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                      Interview Focus Category
                    </label>
                    <select
                      value={interviewCategory}
                      onChange={(e) => setInterviewCategory(e.target.value)}
                      disabled={isStartingInterview || interviewStatus === 'in_progress'}
                      className="bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:border-[var(--color-forsythia)]"
                    >
                      <option value="Technical">Technical & Architecture</option>
                      <option value="Behavioral">Behavioral (STAR Method)</option>
                      <option value="System Design">System Design & Scaling</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="mt-2"
                    isLoading={isStartingInterview}
                    leftIcon={<Play className="w-4 h-4 fill-current" />}
                    disabled={interviewStatus === 'in_progress'}
                  >
                    {interviewStatus === 'completed' ? 'Start New Session' : `Start ${interviewMode.toUpperCase()} Interview`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Video Feed Preview Card for Video Mode */}
            {interviewMode === 'video' && interviewStatus === 'in_progress' && (
              <Card className="bg-[var(--color-oceanic-noir)] border-[var(--color-forsythia)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--color-forsythia)]">
                      <Camera className="w-4 h-4 animate-pulse text-red-400" /> Live Webcam Feed
                    </span>
                    <Badge variant="warning" className="font-mono text-[10px]">
                      Camera Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="aspect-video w-full rounded-[var(--radius-md)] bg-black overflow-hidden relative border border-[var(--color-border)]">
                    <video
                      ref={webCamRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white font-mono flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Live REC
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Session Results Highlight Card */}
            {interviewStatus === 'completed' && finalScore !== null && (
              <Card className="bg-gradient-to-br from-[var(--color-oceanic-noir)] to-[var(--color-nocturnal-expedition)] border-[var(--color-border)]">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] font-mono uppercase">
                      Overall Interview Performance
                    </span>
                    <h2 className="font-header text-3xl font-bold text-[var(--color-arctic-powder)] mt-1">
                      {finalScore}%
                    </h2>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Evaluated using Google STAR technical rubric.
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-forsythia)] flex items-center justify-center shrink-0">
                    <Trophy className="w-7 h-7 text-[var(--color-forsythia)]" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Interactive Interview Thread & Response Interface (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[var(--color-forsythia)]" />
                    AI Technical Interviewer ({interviewMode.toUpperCase()} Mode)
                  </CardTitle>
                  <Badge
                    variant={
                      interviewStatus === 'in_progress'
                        ? 'warning'
                        : interviewStatus === 'completed'
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    {interviewStatus === 'in_progress'
                      ? `${interviewMode.toUpperCase()} Active`
                      : interviewStatus === 'completed'
                      ? 'Interview Completed'
                      : 'Not Started'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {interviewError && (
                  <Alert type="error" title="Interview Error" className="mb-4">
                    {interviewError}
                  </Alert>
                )}

                {/* History Stack of Completed Questions & Evaluations */}
                {historyTurns.length > 0 && (
                  <div className="flex flex-col gap-4 mb-6">
                    {historyTurns.map((turn, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col gap-3 text-xs"
                      >
                        {/* Question */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-forsythia)] text-[var(--color-oceanic-noir)] flex items-center justify-center shrink-0 font-bold text-[10px]">
                            Q{tIdx + 1}
                          </div>
                          <p className="font-header font-semibold text-[var(--color-arctic-powder)]">
                            {turn.questionText}
                          </p>
                        </div>

                        {/* Candidate Answer */}
                        <div className="p-3 rounded bg-[var(--color-nocturnal-expedition)] border border-[var(--color-border-subtle)] text-[var(--color-arctic-powder)]">
                          <span className="text-[10px] text-[var(--color-forsythia)] font-mono font-semibold uppercase">
                            Your Response:
                          </span>
                          <p className="mt-1 whitespace-pre-wrap">{turn.userAnswerText}</p>
                        </div>

                        {/* Evaluation & Score */}
                        <div className="p-3 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase font-semibold">
                              AI Evaluator Feedback:
                            </span>
                            <Badge variant={turn.score && turn.score >= 80 ? 'success' : 'warning'}>
                              Score: {turn.score}%
                            </Badge>
                          </div>
                          <p className="text-[var(--color-text-secondary)]">{turn.feedback}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Question Box */}
                {interviewStatus === 'in_progress' && currentQuestion && (
                  <form onSubmit={handleSubmitAnswer} className="flex flex-col gap-4">
                    <div className="p-5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-forsythia)] flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[var(--color-forsythia)] uppercase">
                          Current Question {historyTurns.length + 1} of 3:
                        </span>
                      </div>
                      <h3 className="font-header text-sm font-semibold text-[var(--color-arctic-powder)] leading-relaxed">
                        {currentQuestion.questionText}
                      </h3>
                    </div>

                    {/* Audio / Video Speech Capture Controls */}
                    {(interviewMode === 'audio' || interviewMode === 'video') && (
                      <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-nocturnal-expedition)] border border-[var(--color-border)] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {isRecording ? (
                            <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
                          ) : (
                            <Mic className="w-4 h-4 text-[var(--color-forsythia)]" />
                          )}
                          <span className="text-xs text-[var(--color-arctic-powder)] font-semibold">
                            {isRecording ? 'Recording Voice Stream & Transcribing...' : 'Click Record to Spoken Answer'}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant={isRecording ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={handleToggleRecording}
                          leftIcon={isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
                        >
                          {isRecording ? 'Stop Recording' : 'Start Mic Recording'}
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Your Technical Response ({interviewMode === 'text' ? 'Typed Response' : 'Voice Transcribed Text'}):
                      </label>
                      <textarea
                        rows={5}
                        placeholder={
                          interviewMode === 'text'
                            ? 'Type your answer, architectural trade-offs, and rationale...'
                            : 'Spoken transcript will appear here. You can also edit text manually...'
                        }
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        disabled={isSubmittingAnswer}
                        className="bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 focus:outline-none focus:border-[var(--color-forsythia)] placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSubmittingAnswer}
                        leftIcon={<Send className="w-4 h-4" />}
                      >
                        Submit Response & Get Evaluation
                      </Button>
                    </div>
                  </form>
                )}

                {/* Not Started State */}
                {interviewStatus === 'not_started' && (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
                    <Bot className="w-10 h-10 opacity-40 text-[var(--color-forsythia)]" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">No Active Interview Session</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                      Select your preferred mode (Text, Audio, or Video) and target role on the left, then click "Start Interview" to launch your AI technical simulation.
                    </p>
                  </div>
                )}

                {/* Completed State Summary */}
                {interviewStatus === 'completed' && (
                  <div className="p-6 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-green-500/40 text-center flex flex-col items-center gap-3 mt-4">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                    <div>
                      <h3 className="font-header text-base font-bold text-[var(--color-arctic-powder)]">
                        Mock Interview Completed!
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        All 3 technical rounds have been scored and logged in your career analytics profile.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 5: Placement & Eligibility Tracker Module */}
      {currentTab === 'placement' && (
        <div className="flex flex-col gap-6">
          {/* Metrics Summary Row */}
          {placementData && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col">
                <span className="text-[10px] font-mono font-semibold text-[var(--color-text-secondary)] uppercase">
                  Total Tracked
                </span>
                <span className="font-header text-2xl font-bold text-[var(--color-arctic-powder)] mt-1">
                  {placementData.metrics.totalTracked}
                </span>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col">
                <span className="text-[10px] font-mono font-semibold text-blue-400 uppercase">
                  Eligible Roles
                </span>
                <span className="font-header text-2xl font-bold text-blue-400 mt-1">
                  {placementData.metrics.totalEligible}
                </span>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col">
                <span className="text-[10px] font-mono font-semibold text-[var(--color-forsythia)] uppercase">
                  Applied
                </span>
                <span className="font-header text-2xl font-bold text-[var(--color-forsythia)] mt-1">
                  {placementData.metrics.totalApplied}
                </span>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col">
                <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase">
                  Interviewing
                </span>
                <span className="font-header text-2xl font-bold text-amber-400 mt-1">
                  {placementData.metrics.totalInterview}
                </span>
              </div>

              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] flex flex-col col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono font-semibold text-green-400 uppercase">
                  Offers
                </span>
                <span className="font-header text-2xl font-bold text-green-400 mt-1">
                  {placementData.metrics.totalOffers}
                </span>
              </div>
            </div>
          )}

          {/* Add Job Application Form & Application List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Add Job Application Form (1 Col) */}
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[var(--color-forsythia)]" /> Track Job Application
                  </CardTitle>
                  <CardDescription>
                    Add target placement opportunity to monitor deadline dates and application status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateJobApplication} className="flex flex-col gap-3">
                    <Input
                      label="Company Name"
                      placeholder="e.g. Google, Anthropic, OpenAI"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      disabled={isCreatingJob}
                    />

                    <Input
                      label="Job Position Title"
                      placeholder="e.g. Full Stack AI Engineer"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      disabled={isCreatingJob}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Initial Application Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                        disabled={isCreatingJob}
                        className="bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:border-[var(--color-forsythia)]"
                      >
                        <option value="Eligible">Eligible (Not Applied Yet)</option>
                        <option value="Applied">Applied</option>
                        <option value="Screening">Screening</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                      </select>
                    </div>

                    <Input
                      label="Application Deadline"
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      disabled={isCreatingJob}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="mt-2"
                      isLoading={isCreatingJob}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Save Application
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Applications List (2 Cols) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card>
                <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[var(--color-forsythia)]" />
                      Tracked Placement Opportunities
                    </CardTitle>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      onClick={fetchPlacement}
                    >
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {placementError && (
                    <Alert type="error" title="Placement Error" className="mb-4">
                      {placementError}
                    </Alert>
                  )}

                  {isLoadingPlacement ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton variant="rectangular" className="h-20 w-full" />
                      <Skeleton variant="rectangular" className="h-20 w-full" />
                    </div>
                  ) : placementData && placementData.applications.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {placementData.applications.map((app) => (
                        <div
                          key={app._id}
                          className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-header text-sm font-bold text-[var(--color-arctic-powder)]">
                                  {app.companyName}
                                </h3>
                                <Badge variant="secondary" className="font-mono text-[10px]">
                                  {app.matchScore}% Match
                                </Badge>
                              </div>
                              <p className="text-xs text-[var(--color-text-secondary)] font-semibold mt-0.5">
                                {app.roleTitle}
                              </p>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>

                          {app.notes && (
                            <div className="p-2.5 rounded bg-[var(--color-nocturnal-expedition)] border border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)]">
                              {app.notes}
                            </div>
                          )}

                          {/* Quick Actions to Advance Status */}
                          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)] text-[11px]">
                            {app.applicationDeadline ? (
                              <span className="text-[var(--color-text-muted)] font-mono flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[var(--color-forsythia)]" /> Deadline:{' '}
                                {new Date(app.applicationDeadline).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-[var(--color-text-muted)] font-mono">No Deadline Set</span>
                            )}

                            <div className="flex items-center gap-1.5">
                              {app.status !== 'Applied' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(app._id, 'Applied')}
                                >
                                  Mark Applied
                                </Button>
                              )}

                              {app.status !== 'Interview' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(app._id, 'Interview')}
                                >
                                  Mark Interview
                                </Button>
                              )}

                              {app.status !== 'Offer' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(app._id, 'Offer')}
                                >
                                  Mark Offer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
                      <Briefcase className="w-10 h-10 opacity-40 text-[var(--color-forsythia)]" />
                      <p className="font-semibold text-[var(--color-arctic-powder)]">No Job Applications Tracked Yet</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                        Use the form on the left to add target companies, roles, and deadlines to monitor your placement journey.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
