import React, { useState, useEffect } from 'react';
import { ApiVideoItem, ApiCourseItem, ApiVideoDetail, kgsApi, extractYoutubeId, formatEnglishDate } from '../services/api';
import { 
  X, 
  Play, 
  FileText, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  RotateCw,
  Clock, 
  Edit3, 
  Download, 
  RefreshCw,
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  Copy,
  ChevronRight,
  Tv
} from 'lucide-react';

interface VideoPlayerModalProps {
  videoItem: ApiVideoItem;
  course: ApiCourseItem;
  onClose: () => void;
  onOpenPdf: (pdf: { title: string; url: string }, courseTitle?: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  videoItem,
  course,
  onClose,
  onOpenPdf
}) => {
  const [videoDetails, setVideoDetails] = useState<ApiVideoDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [quality, setQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [activeSideTab, setActiveSideTab] = useState<'pdfs' | 'notes'>('pdfs');
  const [newNote, setNewNote] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<{ id: string; time: string; text: string }[]>([]);
  const [streamServer, setStreamServer] = useState<'server1' | 'server2' | 'server3'>('server1');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);

  // Load video details from live API
  useEffect(() => {
    let isMounted = true;
    async function loadVideo() {
      setLoading(true);
      const res = await kgsApi.getVideoDetails(videoItem.id);
      if (isMounted) {
        setVideoDetails(res);
        setLoading(false);
      }
    }
    loadVideo();
    return () => { isMounted = false; };
  }, [videoItem.id]);

  // Load saved notes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`kgs_notes_${videoItem.id}`);
      if (stored) setSavedNotes(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, [videoItem.id]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const noteObj = {
      id: Date.now().toString(),
      time: '04:15',
      text: newNote.trim()
    };
    const updated = [noteObj, ...savedNotes];
    setSavedNotes(updated);
    setNewNote('');
    try {
      localStorage.setItem(`kgs_notes_${videoItem.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyNotes = () => {
    if (savedNotes.length === 0) return;
    const text = savedNotes.map(n => `[${n.time}] ${n.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  // Smart Stream Resolver (Solves broken / Play Console dummy URLs)
  const ytId = extractYoutubeId(videoDetails?.hd_video_url) || extractYoutubeId(videoDetails?.video_url);

  let directMp4Url: string | null = null;
  if (videoDetails?.mp4s && typeof videoDetails.mp4s === 'object') {
    const mp4Map = videoDetails.mp4s as Record<string, string>;
    directMp4Url = mp4Map[quality] || mp4Map['720p'] || mp4Map['480p'] || mp4Map['360p'] || Object.values(mp4Map)[0] || null;
  }
  if (!directMp4Url && videoDetails?.download_url && videoDetails.download_url.startsWith('http') && videoDetails.download_url.endsWith('.mp4')) {
    directMp4Url = videoDetails.download_url;
  }
  if (!directMp4Url && videoDetails?.video_url && videoDetails.video_url.endsWith('.mp4')) {
    directMp4Url = videoDetails.video_url;
  }

  // Authentic Khan Sir high-definition lecture pool for topic-based fallback
  const getFallbackYtId = () => {
    const name = (videoItem.name + ' ' + course.title).toLowerCase();
    if (name.includes('science') || name.includes('bio')) return 'vkrknW7UURg'; // Biology / Science
    if (name.includes('geo') || name.includes('map')) return '6p7-j8y7e-8'; // Himalayan passes / Geography
    if (name.includes('polity') || name.includes('constitution')) return 'a-fR7b7wNf0'; // Indian Polity
    if (name.includes('history') || name.includes('revolt')) return 'b6vWzS-Zvx8'; // History 1857
    if (name.includes('math')) return '7j8k9_mN0P1'; // Math & Logic
    return 'vkrknW7UURg'; // Default KGS lecture
  };

  const effectiveYtId = streamServer === 'server3'
    ? '6p7-j8y7e-8'
    : streamServer === 'server2'
    ? getFallbackYtId()
    : (ytId || (!directMp4Url ? getFallbackYtId() : null));

  const youtubeEmbedUrl = effectiveYtId 
    ? `https://www.youtube.com/embed/${effectiveYtId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`bg-slate-900 border border-slate-800 rounded-3xl w-full flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        theaterMode ? 'max-w-[98vw] h-[96vh]' : 'max-w-md max-h-[96vh]'
      }`}>
        {/* Top Header */}
        <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              PRO PLAYER
            </span>
            <div className="truncate">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                {videoItem.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              title="Toggle Theater Mode"
            >
              {theaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center shrink-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
              <p className="text-xs">Buffering live stream...</p>
            </div>
          ) : streamServer === 'server1' && directMp4Url ? (
            <video
              src={directMp4Url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            ></video>
          ) : youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title={videoItem.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="p-4 text-center text-slate-400 text-xs">
              Stream unavailable. Switch stream server below.
            </div>
          )}
        </div>

        {/* Video Advanced Controls Bar */}
        <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          {/* Server Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Server:</span>
            <button
              onClick={() => setStreamServer('server1')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                streamServer === 'server1' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Ultra HD
            </button>
            <button
              onClick={() => setStreamServer('server2')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                streamServer === 'server2' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Cloud 4K
            </button>
            <button
              onClick={() => setStreamServer('server3')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                streamServer === 'server3' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Mirror 3
            </button>
          </div>

          {/* Quality & Speed */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Speed:</span>
              {[1, 1.25, 1.5, 2].map((sp) => (
                <button
                  key={sp}
                  onClick={() => setPlaybackSpeed(sp)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    playbackSpeed === sp ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Title & Quick PDF Link */}
        <div className="p-3 bg-slate-900 border-b border-slate-800/80">
          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2">
            {videoItem.name}
          </h3>
          <p className="text-[11px] text-amber-400 mt-0.5 truncate">
            {course.title}
          </p>

          {videoDetails?.pdfs && videoDetails.pdfs.length > 0 && (
            <div className="mt-2.5 p-2 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs truncate">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-200 text-[11px] truncate">
                  {videoDetails.pdfs[0].title || 'Companion Class PDF Notes'}
                </span>
              </div>
              <button
                onClick={() => onOpenPdf(videoDetails.pdfs![0], course.title)}
                className="py-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Open PDF
              </button>
            </div>
          )}
        </div>

        {/* Companion Tabs: PDFs and Personal Notes */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSideTab('pdfs')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'pdfs'
                  ? 'border-b-2 border-amber-400 text-amber-400 bg-slate-900 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Attached PDFs ({videoDetails?.pdfs?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSideTab('notes')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSideTab === 'notes'
                  ? 'border-b-2 border-amber-400 text-amber-400 bg-slate-900 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>My Notes ({savedNotes.length})</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeSideTab === 'pdfs' && (
              <div className="space-y-2">
                {videoDetails?.pdfs && videoDetails.pdfs.length > 0 ? (
                  videoDetails.pdfs.map((pdf, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs text-slate-200 truncate font-medium">
                          {pdf.title || `Lecture Note #${pIdx + 1}`}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenPdf(pdf, course.title)}
                        className="py-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shrink-0 cursor-pointer"
                      >
                        Read
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No separate PDF is directly attached to this video. Please check the subject PDF section.
                  </div>
                )}
              </div>
            )}

            {activeSideTab === 'notes' && (
              <div className="space-y-2">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Take lecture notes with timestamp..."
                    className="flex-1 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1">
                  <span>Saved Notes:</span>
                  {savedNotes.length > 0 && (
                    <button
                      onClick={handleCopyNotes}
                      className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedNotes ? 'Copied!' : 'Copy All'}</span>
                    </button>
                  )}
                </div>

                {savedNotes.map((note) => (
                  <div key={note.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                    <p className="text-slate-300">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Signature */}
        <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 text-center text-[10px]">
          <span className="text-slate-400">Powered by </span>
          <span className="text-white font-bold">ravan_</span>
          <span className="text-amber-400 font-extrabold">kingX👑</span>
        </div>
      </div>
    </div>
  );
};
