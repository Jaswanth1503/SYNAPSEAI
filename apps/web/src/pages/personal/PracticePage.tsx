import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Code2, Terminal, FileQuestion, Play, RefreshCw, CheckCircle2, PlayCircle, BookOpen, Sparkles, Trophy, ArrowRight, ArrowLeft, HelpCircle, XCircle, RotateCw, Plus, Check, Layers } from 'lucide-react';
import { videoApi, VideoRecord } from '../../services/video.api';
import { aiApi, QuizQuestion, QuizAnswerPayload, QuizAttemptRecord } from '../../services/ai.api';
import { codeApi, CodeExecutionResult } from '../../services/code.api';
import { flashcardApi, FlashcardItem } from '../../services/flashcard.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

const STARTER_SNIPPETS: Record<string, { langId: number; name: string; monacoLang: string; code: string }> = {
  javascript: {
    langId: 63,
    name: 'JavaScript / TypeScript',
    monacoLang: 'javascript',
    code: `// Synchronous & Asynchronous Queue Processor Sandbox
console.log("=== SYNAPSEAI Code Execution Engine ===");

function processTask(taskId, priority) {
  console.log(\`Processing Task \${taskId} with priority \${priority}...\`);
  return { taskId, status: 'COMPLETED', time: Date.now() };
}

const result = processTask("TASK-101", "HIGH");
console.log("Execution Result:", JSON.stringify(result));
`,
  },
  python: {
    langId: 71,
    name: 'Python 3',
    monacoLang: 'python',
    code: `# Vector Embedding Cosine Similarity Sandbox
import math

def cosine_similarity(v1, v2):
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if not magnitude1 or not magnitude2:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

# Sample 4-dim embedding vectors
vec_query = [0.12, 0.85, -0.34, 0.44]
vec_doc = [0.10, 0.82, -0.30, 0.40]

sim = cosine_similarity(vec_query, vec_doc)
print(f"Vector Similarity Score: {sim:.4f}")
`,
  },
  cpp: {
    langId: 54,
    name: 'C++ 17',
    monacoLang: 'cpp',
    code: `// C++ Memory Management & Queue Structure
#include <iostream>
#include <string>

int main() {
    std::cout << "SYNAPSEAI High-Performance C++ Sandbox" << std::endl;
    std::string task = "Queue Process #402";
    std::cout << "Running Native Task: " << task << std::endl;
    return 0;
}
`,
  },
};

export const PracticePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith('/coding')
    ? 'coding'
    : location.pathname.endsWith('/flashcards')
    ? 'flashcards'
    : 'quizzes';

  const practiceTabs = [
    { id: 'quizzes', label: 'AI Video Quizzes', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'coding', label: 'Monaco Code Sandbox', icon: <Code2 className="w-4 h-4" /> },
    { id: 'flashcards', label: 'AI Flashcards & Revision', icon: <Sparkles className="w-4 h-4" /> },
  ];

  // Common Video Selection State
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizAttemptResult, setQuizAttemptResult] = useState<QuizAttemptRecord | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Coding Practice Sandbox State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [editorCode, setEditorCode] = useState<string>(STARTER_SNIPPETS.javascript.code);
  const [customInput, setCustomInput] = useState<string>('');
  const [isExecutingCode, setIsExecutingCode] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);

  // AI Flashcards State (Phase 5 Step 1)
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(true);
  const [isGeneratingCards, setIsGeneratingCards] = useState<boolean>(false);
  const [masteredCardIds, setMasteredCardIds] = useState<Set<string>>(new Set());
  const [newFront, setNewFront] = useState<string>('');
  const [newBack, setNewBack] = useState<string>('');
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);

  // Fetch Ready Videos
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const list = await videoApi.listVideos();
        const readyList = list.filter((v: VideoRecord) => v.status === 'ready');
        setVideos(readyList);
        if (readyList.length > 0) {
          setSelectedVideoId(readyList[0]._id);
        }
      } catch (err: any) {
        console.error('[PracticePage] Failed to fetch videos:', err);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  // Fetch Flashcards
  const fetchFlashcards = async () => {
    setIsLoadingCards(true);
    setFlashcardError(null);
    try {
      const cards = await flashcardApi.getFlashcards();
      setFlashcards(cards);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setFlashcardError(err.response?.data?.message || err.message || 'Failed to fetch flashcards');
    } finally {
      setIsLoadingCards(false);
    }
  };

  // Generate Flashcards from AI Notes
  const handleGenerateFlashcards = async () => {
    setIsGeneratingCards(true);
    setFlashcardError(null);
    try {
      const newCards = await flashcardApi.generateFlashcards(selectedVideoId || 'demo_video');
      setFlashcards((prev) => [...newCards, ...prev]);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setFlashcardError(err.response?.data?.message || err.message || 'Failed to generate flashcards');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // Create Manual Flashcard
  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront || !newBack) return;

    setIsCreatingCard(true);
    try {
      const card = await flashcardApi.createFlashcard(newFront, newBack);
      setFlashcards((prev) => [card, ...prev]);
      setNewFront('');
      setNewBack('');
    } catch (err: any) {
      setFlashcardError(err.response?.data?.message || err.message || 'Failed to create flashcard');
    } finally {
      setIsCreatingCard(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'flashcards') {
      fetchFlashcards();
    }
  }, [currentTab]);

  const handleTabChange = (tabId: string) => {
    navigate(`/personal/practice/${tabId}`);
  };

  const handleLanguageChange = (langKey: string) => {
    setSelectedLanguage(langKey);
    setEditorCode(STARTER_SNIPPETS[langKey].code);
    setExecutionResult(null);
  };

  const handleRunCode = async () => {
    setIsExecutingCode(true);
    setExecutionResult(null);
    try {
      const snippet = STARTER_SNIPPETS[selectedLanguage];
      const result = await codeApi.executeCode(
        snippet.langId,
        editorCode,
        customInput
      );
      setExecutionResult(result);
    } catch (err: any) {
      setExecutionResult({
        stdout: null,
        stderr: err.response?.data?.message || err.message || 'Execution Error',
        compile_output: null,
        status: { id: 11, description: 'Runtime Error' },
        time: '0.00',
        memory: 0,
      });
    } finally {
      setIsExecutingCode(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedVideoId) return;
    setIsGeneratingQuiz(true);
    setQuizError(null);
    setQuizSubmitted(false);
    setQuizAttemptResult(null);
    setSelectedAnswers({});
    setCurrentQuizIndex(0);

    try {
      const quizRes = await aiApi.generateQuiz(selectedVideoId);
      setQuizQuestions(quizRes.questions);
    } catch (err: any) {
      setQuizError(err.response?.data?.message || err.message || 'Failed to generate video quiz.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleOptionSelect = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedVideoId || quizQuestions.length === 0) return;
    setIsSubmittingQuiz(true);
    setQuizError(null);

    const answersPayload: QuizAnswerPayload[] = quizQuestions.map((q, idx) => {
      const selIdx = selectedAnswers[idx] ?? -1;
      const isCorrect = selIdx === q.correctOptionIndex;
      return {
        questionText: q.questionText,
        selectedOption: selIdx >= 0 ? q.options[selIdx] : '',
        correctOption: q.options[q.correctOptionIndex],
        isCorrect,
      };
    });

    try {
      const attempt = await aiApi.submitQuizAttempt(selectedVideoId, answersPayload);
      setQuizAttemptResult(attempt);
      setQuizSubmitted(true);
    } catch (err: any) {
      setQuizError(err.response?.data?.message || err.message || 'Failed to submit quiz attempt.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const toggleMasteredCurrentCard = () => {
    if (!flashcards[currentCardIndex]) return;
    const cardId = flashcards[currentCardIndex]._id;
    setMasteredCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
        flashcardApi.reviewFlashcard(cardId, 5);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Practice & Assessment Sandbox
            </h1>
            <Badge variant="primary">Personal Portal</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Generate AI MCQs, execute code in Monaco Sandbox, and study interactive AI flashcards.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <Tabs
        tabs={practiceTabs}
        activeTab={currentTab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* Tab 1: AI Video Quizzes */}
      {currentTab === 'quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Video Selector & Generator (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-[var(--color-forsythia)]" /> Select Lecture & Quiz
                </CardTitle>
                <CardDescription>
                  Generate multiple choice practice questions from video transcripts.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isLoadingVideos ? (
                  <Skeleton variant="rectangular" className="h-10 w-full" />
                ) : videos.length === 0 ? (
                  <EmptyState
                    icon={<PlayCircle className="w-8 h-8 text-[var(--color-text-muted)]" />}
                    title="No Ready Lectures"
                    description="Upload a video in Learn page to generate AI quizzes."
                    action={
                      <Button size="sm" onClick={() => navigate('/personal/learn')}>
                        Go to Learn
                      </Button>
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                      Target Lecture Video
                    </label>
                    <select
                      value={selectedVideoId}
                      onChange={(e) => setSelectedVideoId(e.target.value)}
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
                      className="w-full mt-2"
                      onClick={handleGenerateQuiz}
                      isLoading={isGeneratingQuiz}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Generate AI Quiz (5 MCQs)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Summary Card if Quiz Submitted */}
            {quizAttemptResult && (
              <Card className="bg-gradient-to-br from-[var(--color-oceanic-noir)] to-[var(--color-nocturnal-expedition)] border-[var(--color-border)]">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] font-mono uppercase">
                      Assessment Score
                    </span>
                    <h2 className="font-header text-3xl font-bold text-[var(--color-arctic-powder)] mt-1">
                      {quizAttemptResult.score}%
                    </h2>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      {quizAttemptResult.score >= 80 ? 'Passed with Distinction!' : 'Review recommended'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-forsythia)] flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-[var(--color-forsythia)]" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel: MCQ Assessment Stack (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[var(--color-forsythia)]" />
                    AI Assessment Practice Sheet
                  </CardTitle>
                  {quizQuestions.length > 0 && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      Question {currentQuizIndex + 1} of {quizQuestions.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {quizError && (
                  <Alert type="error" title="Quiz Error" className="mb-4">
                    {quizError}
                  </Alert>
                )}

                {isGeneratingQuiz ? (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-[var(--color-forsythia)] animate-spin" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">
                      Generating Multiple Choice Assessment Questions...
                    </p>
                  </div>
                ) : quizQuestions.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {/* Current Question */}
                    {(() => {
                      const q = quizQuestions[currentQuizIndex];
                      return (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-arctic-powder)] leading-relaxed">
                            {currentQuizIndex + 1}. {q.questionText}
                          </div>

                          {/* Options Radio List */}
                          <div className="flex flex-col gap-2.5">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = selectedAnswers[currentQuizIndex] === oIdx;
                              const isCorrect = q.correctOptionIndex === oIdx;

                              let buttonStyle =
                                'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-forsythia)]';

                              if (quizSubmitted) {
                                if (isCorrect) {
                                  buttonStyle = 'bg-green-950/60 text-green-300 border-green-500 font-semibold';
                                } else if (isSelected && !isCorrect) {
                                  buttonStyle = 'bg-red-950/60 text-red-300 border-red-500';
                                }
                              } else if (isSelected) {
                                buttonStyle = 'bg-[var(--color-oceanic-noir)] text-[var(--color-forsythia)] border-[var(--color-forsythia)] font-semibold';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleOptionSelect(currentQuizIndex, oIdx)}
                                  disabled={quizSubmitted}
                                  className={`p-3.5 rounded-[var(--radius-md)] border text-xs text-left transition-all flex items-center justify-between ${buttonStyle}`}
                                >
                                  <span>
                                    <strong className="mr-2 font-mono">{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                                  </span>
                                  {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                                  {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation banner if submitted */}
                          {quizSubmitted && q.explanation && (
                            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 text-[var(--color-forsythia)] shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[var(--color-arctic-powder)]">Explanation:</strong> {q.explanation}
                              </div>
                            </div>
                          )}

                          {/* Nav Bar */}
                          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)] mt-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={currentQuizIndex === 0}
                              onClick={() => setCurrentQuizIndex((prev) => prev - 1)}
                              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                            >
                              Previous
                            </Button>

                            {currentQuizIndex < quizQuestions.length - 1 ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentQuizIndex((prev) => prev + 1)}
                                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                              >
                                Next Question
                              </Button>
                            ) : (
                              !quizSubmitted && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={handleSubmitQuiz}
                                  isLoading={isSubmittingQuiz}
                                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                >
                                  Submit Quiz
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileQuestion className="w-10 h-10 text-[var(--color-text-muted)]" />}
                    title="No Quiz Active"
                    description="Select a video lecture on the left and click 'Generate AI Quiz' to begin."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Monaco Code Execution Sandbox */}
      {currentTab === 'coding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Control Bar (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[var(--color-forsythia)]" /> Language & Execution
                </CardTitle>
                <CardDescription>
                  Choose execution engine and input parameters.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Programming Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 focus:outline-none focus:border-[var(--color-forsythia)]"
                  >
                    {Object.entries(STARTER_SNIPPETS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Standard Input (stdin)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter custom input parameters..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-mono text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] p-2.5 focus:outline-none focus:border-[var(--color-forsythia)]"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-1"
                  onClick={handleRunCode}
                  isLoading={isExecutingCode}
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
                >
                  Run Code Sandbox
                </Button>
              </CardContent>
            </Card>

            {/* Execution Console Output Card */}
            <Card>
              <CardHeader className="pb-2 border-b border-[var(--color-border-subtle)]">
                <CardTitle className="text-xs font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[var(--color-forsythia)]">
                    <Terminal className="w-3.5 h-3.5" /> Output Console
                  </span>
                  {executionResult && (
                    <Badge variant={executionResult.status?.id === 3 ? 'success' : 'secondary'}>
                      {executionResult.status?.description || 'Executed'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 bg-black/90 font-mono text-xs rounded-b-[var(--radius-lg)] min-h-[160px] max-h-[260px] overflow-y-auto">
                {isExecutingCode ? (
                  <div className="text-[var(--color-text-muted)] flex items-center gap-2 py-4">
                    <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-forsythia)]" /> Compiling & Executing Code...
                  </div>
                ) : executionResult ? (
                  <div className="flex flex-col gap-2 leading-relaxed">
                    {executionResult.stdout && (
                      <pre className="text-green-400 whitespace-pre-wrap">{executionResult.stdout}</pre>
                    )}
                    {executionResult.stderr && (
                      <pre className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
                    )}
                    {executionResult.compile_output && (
                      <pre className="text-amber-400 whitespace-pre-wrap">{executionResult.compile_output}</pre>
                    )}
                    {!executionResult.stdout && !executionResult.stderr && !executionResult.compile_output && (
                      <span className="text-gray-500">[Program finished with no output]</span>
                    )}

                    <div className="pt-2 mt-2 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between">
                      <span>Exec Time: {executionResult.time || '0.00'}s</span>
                      <span>Mem: {executionResult.memory || 0} KB</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">// Terminal output will appear here after clicking "Run Code Sandbox"...</span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Embedded Monaco Code Editor (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="h-[580px] flex flex-col overflow-hidden">
              <CardHeader className="py-2.5 px-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-oceanic-noir)] shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[var(--color-arctic-powder)] flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[var(--color-forsythia)]" />
                    main.{STARTER_SNIPPETS[selectedLanguage].monacoLang}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Monaco Editor
                  </Badge>
                </div>
              </CardHeader>
              <div className="flex-1 w-full bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={STARTER_SNIPPETS[selectedLanguage].monacoLang}
                  theme="vs-dark"
                  value={editorCode}
                  onChange={(val) => setEditorCode(val || '')}
                  options={{
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: 'on',
                  }}
                />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: AI Flashcards & Revision Notes (Phase 5 Step 1) */}
      {currentTab === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Generator & Manual Card Creator (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--color-forsythia)]" /> Generate AI Flashcards
                </CardTitle>
                <CardDescription>
                  Auto-generate revision cards from lecture notes or create custom cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Source Lecture Video
                  </label>
                  <select
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    className="w-full bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:border-[var(--color-forsythia)]"
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
                    onClick={handleGenerateFlashcards}
                    isLoading={isGeneratingCards}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Auto-Generate Cards
                  </Button>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)]">
                  <form onSubmit={handleCreateFlashcard} className="flex flex-col gap-2.5">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                      Create Custom Study Card
                    </span>
                    <Input
                      placeholder="Front (Question / Concept)"
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      disabled={isCreatingCard}
                    />
                    <Input
                      placeholder="Back (Answer / Explanation)"
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      disabled={isCreatingCard}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      isLoading={isCreatingCard}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Flashcard
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Study Progress Card */}
            {flashcards.length > 0 && (
              <Card className="bg-gradient-to-br from-[var(--color-oceanic-noir)] to-[var(--color-nocturnal-expedition)] border-[var(--color-border)]">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] font-mono uppercase">
                      Cards Mastered
                    </span>
                    <h2 className="font-header text-3xl font-bold text-[var(--color-arctic-powder)] mt-1">
                      {masteredCardIds.size} / {flashcards.length}
                    </h2>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      {Math.round((masteredCardIds.size / (flashcards.length || 1)) * 100)}% Mastery Score
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-forsythia)] flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-[var(--color-forsythia)]" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: 3D Flip Card Study View (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[var(--color-forsythia)]" />
                    Interactive Revision Deck
                  </CardTitle>
                  {flashcards.length > 0 && (
                    <Badge variant="primary" className="font-mono text-xs">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {flashcardError && (
                  <Alert type="error" title="Flashcard Error" className="mb-4">
                    {flashcardError}
                  </Alert>
                )}

                {isLoadingCards ? (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-[var(--color-forsythia)] animate-spin" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">Loading Revision Cards...</p>
                  </div>
                ) : flashcards.length > 0 ? (
                  <div className="flex flex-col items-center gap-6">
                    {/* 3D Flip Card Container */}
                    {(() => {
                      const card = flashcards[currentCardIndex];
                      const isMastered = masteredCardIds.has(card._id);

                      return (
                        <div className="w-full max-w-xl flex flex-col items-center gap-4">
                          <div
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="w-full min-h-[240px] rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-oceanic-noir)] to-[var(--color-nocturnal-expedition)] border-2 border-[var(--color-forsythia)] p-8 flex flex-col justify-between cursor-pointer shadow-xl transition-all duration-300 hover:scale-[1.01] select-none relative overflow-hidden"
                          >
                            {/* Header Badge */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-[var(--color-forsythia)] uppercase tracking-wider">
                                {isFlipped ? 'Answer / Explanation (Back)' : 'Question / Concept (Front)'}
                              </span>
                              <Badge variant={isMastered ? 'success' : 'secondary'} className="font-mono text-[10px]">
                                {isMastered ? 'Mastered' : 'Click Card to Flip'}
                              </Badge>
                            </div>

                            {/* Center Content Text */}
                            <div className="my-6 text-center">
                              <p className="font-header text-lg font-bold text-[var(--color-arctic-powder)] leading-relaxed">
                                {isFlipped ? card.back : card.front}
                              </p>
                            </div>

                            {/* Footer Flip Hint */}
                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-mono">
                              <RotateCw className="w-3.5 h-3.5" /> Tap to flip card
                            </div>
                          </div>

                          {/* Action Controls Row */}
                          <div className="flex items-center justify-between w-full pt-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={currentCardIndex === 0}
                              onClick={() => {
                                setCurrentCardIndex((prev) => prev - 1);
                                setIsFlipped(false);
                              }}
                              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                            >
                              Previous Card
                            </Button>

                            <Button
                              variant={isMastered ? 'primary' : 'secondary'}
                              size="sm"
                              onClick={toggleMasteredCurrentCard}
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                            >
                              {isMastered ? 'Mastered' : 'Mark as Mastered'}
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={currentCardIndex === flashcards.length - 1}
                              onClick={() => {
                                setCurrentCardIndex((prev) => prev + 1);
                                setIsFlipped(false);
                              }}
                              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                            >
                              Next Card
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Layers className="w-10 h-10 text-[var(--color-text-muted)]" />}
                    title="No Flashcards Found"
                    description="Click 'Auto-Generate Cards' on the left to generate revision cards from lecture notes."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
