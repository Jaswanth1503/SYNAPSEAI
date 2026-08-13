import React from 'react';
import { Award, ShieldCheck, Download, Share2, Sparkles, CheckCircle2, QrCode } from 'lucide-react';
import { mockCertificates } from '../../data/mockData';

export const Module16CertificateVerification: React.FC = () => {
  const cert = mockCertificates[0];

  const handleDownloadPDF = () => {
    alert(`Downloading Cryptographic PDF Certificate for ${cert.id}`);
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://synapse.ai/verify/' + cert.id)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between glow-cyan">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cryptographic Verification Registry
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-100">
            Official Course Completion Credential
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Blockchain hash verification linked to public registry route `/verify/:id`.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-400/20 transition"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button
            onClick={handleShareLinkedIn}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share LinkedIn
          </button>
        </div>
      </div>

      {/* Certificate Frame Card */}
      <div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/40 space-y-8 relative overflow-hidden shadow-2xl glow-cyan">
        {/* Background Seal Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-lg font-heading font-extrabold text-slate-100">SYNAPSE AI GLOBAL ACADEMY</div>
              <div className="text-xs text-cyan-400 font-mono">{cert.issuer}</div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> VERIFIED CREDENTIAL
          </span>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-4 py-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">THIS IS TO CERTIFY THAT</div>
          <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400">
            {cert.studentName}
          </h2>
          <div className="text-xs text-slate-300">HAS SUCCESSFULLY MASTERED THE CURRICULUM FOR</div>
          <h3 className="text-xl font-bold text-slate-100 max-w-xl mx-auto">{cert.courseTitle}</h3>
          <div className="text-xs text-slate-400">Issued on {cert.issueDate}</div>
        </div>

        {/* Certificate Footer with Dynamic QR Code & Cryptographic Hash */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Cryptographic Hash */}
          <div className="space-y-1 text-left">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CRYPTOGRAPHIC SHA-256 HASH</div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-cyan-300 max-w-md truncate">
              {cert.verificationHash}
            </div>
            <div className="text-[10px] text-slate-400">Public Route: /verify/{cert.id}</div>
          </div>

          {/* QR Code */}
          <div className="p-2 bg-white rounded-2xl shadow-xl shrink-0">
            <img src={cert.qrUrl} alt="QR Code" className="w-24 h-24" />
          </div>
        </div>
      </div>
    </div>
  );
};
