import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface PdfViewerModalProps {
  pdf: { title: string; url: string };
  courseTitle?: string;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  pdf,
  courseTitle,
  onClose
}) => {
  const [viewerMode, setViewerMode] = useState<'google' | 'direct'>('google');
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdf.url)}&embedded=true`;

  const handleOpenDirect = () => {
    window.open(pdf.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdf.url;
    a.target = '_blank';
    a.download = `${pdf.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-2 select-none overflow-hidden">
      {/* Top Controls Toolbar in English */}
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl px-3 py-2.5 text-white flex items-center justify-between gap-2 shadow-xl shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-500">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">
              {pdf.title}
            </h3>
            <p className="text-[10px] text-amber-400 truncate">
              {courseTitle || 'Khan Global Studies'} • Official Class Notes
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setIframeLoaded(false);
              setViewerMode(viewerMode === 'google' ? 'direct' : 'google');
            }}
            className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            title="Switch Viewer Mode"
          >
            {viewerMode === 'google' ? 'Google Viewer' : 'Direct Frame'}
          </button>

          <button
            onClick={handleOpenDirect}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-lg cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document Frame */}
      <div className="flex-1 bg-slate-900 border-x border-slate-800 overflow-hidden relative flex flex-col justify-between">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 z-10 text-slate-400">
            <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
            <p className="text-xs">Buffering PDF document...</p>
          </div>
        )}

        <iframe
          src={viewerMode === 'google' ? googleDocsViewerUrl : pdf.url}
          title={pdf.title}
          onLoad={() => setIframeLoaded(true)}
          className="w-full h-full border-0 bg-white"
          allow="fullscreen"
        ></iframe>

        {/* Floating Quick Action at Bottom */}
        <div className="p-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px] truncate">
            Trouble viewing embedded PDF?
          </span>
          <button
            onClick={handleOpenDirect}
            className="py-1 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Open in Browser (New Tab)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-slate-900 border border-slate-800 rounded-b-2xl px-3 py-1.5 text-[10px] text-center shrink-0">
        <span className="text-slate-400">Powered by </span>
        <span className="text-white font-bold">ravan_</span>
        <span className="text-amber-400 font-extrabold">kingX👑</span>
      </div>
    </div>
  );
};
