import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Award, Download, CheckCircle2, Search, ShieldCheck, Sparkles, RefreshCw, FileText, QrCode } from 'lucide-react';
import { certificateApi, CertificateItem, VerificationResponse } from '../../services/certificate.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';

export const CertificatesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramCertId } = useParams<{ id?: string }>();

  const currentTab = location.pathname.includes('/verify')
    ? 'verify'
    : location.pathname.includes('/my-certificates')
    ? 'my-certificates'
    : 'issue';

  const certTabs = [
    { id: 'issue', label: 'Issue Certificate', icon: <Award className="w-4 h-4" /> },
    { id: 'my-certificates', label: 'My Certificates', icon: <FileText className="w-4 h-4" /> },
    { id: 'verify', label: 'Cryptographic Verification', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  // My Certificates State
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState<boolean>(true);
  const [certError, setCertError] = useState<string | null>(null);

  // Issue Certificate State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course_101');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCert, setGeneratedCert] = useState<CertificateItem | null>(null);

  // Lookup / Verify State
  const [lookupCode, setLookupCode] = useState<string>(paramCertId || 'CERT-SYN-894012-A7F2');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Fetch User Certificates
  const fetchMyCertificates = async () => {
    setIsLoadingCerts(true);
    setCertError(null);
    try {
      const data = await certificateApi.getMyCertificates();
      setCertificates(data);
    } catch (err: any) {
      setCertError(err.response?.data?.message || err.message || 'Failed to fetch certificates');
    } finally {
      setIsLoadingCerts(false);
    }
  };

  useEffect(() => {
    fetchMyCertificates();
  }, []);

  // Handle Verify Lookup
  const handleVerifyLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupCode.trim()) return;

    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const res = await certificateApi.verifyCertificate(lookupCode.trim());
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyError(err.response?.data?.message || err.message || 'Verification lookup failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify if param present
  useEffect(() => {
    if (paramCertId) {
      setLookupCode(paramCertId);
      handleVerifyLookup();
    }
  }, [paramCertId]);

  // Generate Certificate
  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setCertError(null);

    try {
      const cert = await certificateApi.generateCertificate(selectedCourseId);
      setGeneratedCert(cert);
      fetchMyCertificates();
    } catch (err: any) {
      setCertError(err.response?.data?.message || err.message || 'Certificate generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    if (location.pathname.startsWith('/org')) {
      navigate(`/org/certificates/${tabId}`);
    } else {
      navigate(`/personal/certificates/${tabId}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-header text-2xl font-bold text-[var(--color-arctic-powder)]">
              Certificates & Cryptographic Credentials
            </h1>
            <Badge variant="primary">Cryptographic Verification</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Issue QR-coded PDF certificates, view earned credentials, and verify certificate codes instantly.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <Tabs tabs={certTabs} activeTab={currentTab} onChange={handleTabChange} variant="underline" />

      {/* Tab 1: Issue Certificate */}
      {currentTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Requirements (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--color-forsythia)]" /> Course Completion Audit
                </CardTitle>
                <CardDescription>
                  Verify eligibility and mint a QR-coded PDF completion certificate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateCertificate} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                      Target Course Program
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      disabled={isGenerating}
                      className="bg-[var(--color-oceanic-noir)] text-[var(--color-arctic-powder)] font-body text-xs rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 focus:outline-none focus:border-[var(--color-forsythia)]"
                    >
                      <option value="course_101">Fullstack AI Engineering & Systems Architecture</option>
                      <option value="course_102">Distributed Queues & Redis Microservices</option>
                      <option value="course_103">Vector Embeddings & RAG Optimization</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] text-xs flex flex-col gap-2">
                    <span className="font-mono text-[10px] text-[var(--color-forsythia)] font-bold uppercase">
                      Issuance Eligibility Requirements:
                    </span>
                    <ul className="space-y-1 text-[11px] text-[var(--color-text-secondary)]">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> 100% Course Video Content Watched
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Minimum 70% MCQ Assessment Score
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="mt-2"
                    isLoading={isGenerating}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Generate PDF Certificate
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Issued Certificate Preview (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--color-forsythia)]" />
                    Generated PDF Certificate & Dynamic QR Code
                  </CardTitle>
                  {generatedCert?.pdfDataUrl && (
                    <a
                      href={generatedCert.pdfDataUrl}
                      download={`Certificate_${generatedCert.certificateId}.pdf`}
                      className="no-underline"
                    >
                      <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Download PDF
                      </Button>
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {certError && (
                  <Alert type="error" title="Certificate Error" className="mb-4">
                    {certError}
                  </Alert>
                )}

                {isGenerating ? (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-[var(--color-forsythia)] animate-spin" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">
                      Rendering PDF document with pdf-lib & embedding QR Code...
                    </p>
                  </div>
                ) : generatedCert ? (
                  <div className="flex flex-col gap-6">
                    {/* Certificate Digital Document Preview */}
                    <div className="p-8 rounded-[var(--radius-lg)] bg-white text-gray-900 shadow-xl border-4 border-[var(--color-forsythia)] flex flex-col justify-between min-h-[380px] font-serif relative overflow-hidden">
                      {/* Header */}
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-blue-900 tracking-widest uppercase font-sans">
                          SYNAPSEAI ACADEMY
                        </h2>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-wide uppercase mt-1">
                          CERTIFICATE OF ACCOMPLISHMENT
                        </h1>
                        <p className="text-xs text-gray-500 italic mt-2">This is proudly presented to</p>
                      </div>

                      {/* Student Name */}
                      <div className="text-center my-4">
                        <h3 className="text-3xl font-extrabold text-[var(--color-nocturnal-expedition)] uppercase tracking-wider font-sans">
                          {generatedCert.studentName}
                        </h3>
                        <p className="text-xs text-gray-600 mt-2">for successfully completing the course</p>
                        <h4 className="text-lg font-bold text-blue-800 mt-1 font-sans">
                          {generatedCert.courseTitle}
                        </h4>
                      </div>

                      {/* Footer Info & QR Code */}
                      <div className="flex items-end justify-between pt-4 border-t border-gray-300 text-xs text-gray-600 font-sans">
                        <div>
                          <p className="font-semibold">Issued Date: {new Date(generatedCert.issueDate).toLocaleDateString()}</p>
                          <p className="font-mono text-[10px] text-gray-500 mt-0.5">Code: {generatedCert.certificateId}</p>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <QrCode className="w-12 h-12 text-gray-800" />
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Scan to Verify</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
                    <Award className="w-10 h-10 opacity-40 text-[var(--color-forsythia)]" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">No Certificate Generated Yet</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                      Select your target course on the left and click "Generate PDF Certificate" to render your credential.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: My Certificates Gallery */}
      {currentTab === 'my-certificates' && (
        <Card>
          <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-forsythia)]" />
                Earned Credentials Gallery
              </CardTitle>
              <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchMyCertificates}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingCerts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton variant="rectangular" className="h-40 w-full" />
                <Skeleton variant="rectangular" className="h-40 w-full" />
              </div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="p-5 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-[var(--color-border)] hover:border-[var(--color-forsythia)] transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="success" className="font-mono text-[10px]">
                          Authentic & Valid
                        </Badge>
                        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-header text-sm font-bold text-[var(--color-arctic-powder)]">
                        {cert.courseTitle}
                      </h3>
                      <p className="text-xs text-[var(--color-forsythia)] font-semibold mt-1">
                        Student: {cert.studentName}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--color-text-muted)] mt-1">
                        Code: {cert.certificateId}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setLookupCode(cert.certificateId);
                          handleTabChange('verify');
                        }}
                      >
                        Verify Credential
                      </Button>

                      {cert.pdfUrl && (
                        <a href={cert.pdfUrl} download={`Certificate_${cert.certificateId}.pdf`} className="no-underline">
                          <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                            PDF Certificate
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
                <Award className="w-10 h-10 opacity-40 text-[var(--color-forsythia)]" />
                <p className="font-semibold text-[var(--color-arctic-powder)]">No Earned Certificates Found</p>
                <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                  Complete course requirements and click "Issue Certificate" to mint your credentials.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Cryptographic Verification Portal */}
      {currentTab === 'verify' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Code Lookup Input (1 Col) */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-[var(--color-forsythia)]" /> Cryptographic Lookup
                </CardTitle>
                <CardDescription>
                  Enter the unique certificate code to verify authenticity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyLookup} className="flex flex-col gap-3">
                  <Input
                    label="Certificate Unique Code"
                    placeholder="e.g. CERT-SYN-894012-A7F2"
                    value={lookupCode}
                    onChange={(e) => setLookupCode(e.target.value)}
                    disabled={isVerifying}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="mt-1"
                    isLoading={isVerifying}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Verify Credential Code
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Verification Results (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-forsythia)]" />
                  Public Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {verifyError && (
                  <Alert type="error" title="Verification Error" className="mb-4">
                    {verifyError}
                  </Alert>
                )}

                {isVerifying ? (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-[var(--color-forsythia)] animate-spin" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">
                      Performing SHA-256 hash lookup and verifying database signature...
                    </p>
                  </div>
                ) : verifyResult ? (
                  <div className="p-6 rounded-[var(--radius-md)] bg-[var(--color-oceanic-noir)] border border-green-500/50 flex flex-col gap-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <div>
                          <h3 className="font-header text-base font-bold text-[var(--color-arctic-powder)]">
                            Official Authenticity Verification
                          </h3>
                          <p className="text-[11px] text-[var(--color-text-muted)]">
                            Certificate ID: <span className="font-mono text-[var(--color-forsythia)]">{verifyResult.data?.certificateId}</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" className="font-mono text-xs">
                        AUTHENTIC
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-mono font-semibold">Student Name:</span>
                        <p className="font-bold text-[var(--color-arctic-powder)] text-sm">{verifyResult.data?.studentName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-mono font-semibold">Course Program:</span>
                        <p className="font-bold text-[var(--color-arctic-powder)] text-sm">{verifyResult.data?.courseTitle}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-mono">
                      <span>Issued Date: {new Date(verifyResult.data?.issueDate || Date.now()).toLocaleDateString()}</span>
                      <span className="text-green-400">Cryptographic Hash Validated</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-[var(--color-text-muted)] flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="w-10 h-10 opacity-40 text-[var(--color-forsythia)]" />
                    <p className="font-semibold text-[var(--color-arctic-powder)]">Enter Certificate Code to Verify</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                      Provide a certificate code on the left (e.g. CERT-SYN-894012-A7F2) to perform an instant cryptographic lookup.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
