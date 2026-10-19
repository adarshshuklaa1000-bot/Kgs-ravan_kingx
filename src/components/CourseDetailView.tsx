import React, { useState, useEffect } from 'react';
import { 
  ApiCourseItem, 
  ApiCourseDetails, 
  ApiClassroom, 
  ApiClassroomDetail, 
  ApiVideoItem, 
  ApiPdfItem, 
  kgsApi, 
  formatPrice,
  formatEnglishDate
} from '../services/api';
import { 
  ArrowLeft, 
  Video, 
  FileText, 
  Calendar, 
  Play, 
  Sparkles, 
  Users, 
  Layers, 
  Clock, 
  RefreshCw,
  ChevronRight,
  BookOpen,
  FolderOpen,
  Search,
  Download
} from 'lucide-react';

interface CourseDetailViewProps {
  course: ApiCourseItem;
  onBack: () => void;
  onPlayVideo: (videoItem: ApiVideoItem, course: ApiCourseItem) => void;
  onOpenPdf: (pdf: { title: string; url: string }, courseTitle?: string) => void;
  onLogoTap?: () => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  onBack,
  onPlayVideo,
  onOpenPdf,
  onLogoTap
}) => {
  const [details, setDetails] = useState<ApiCourseDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);

  // Hierarchy Navigation state: Level 1 = Subject List, Level 2 = Chapter List
  const [selectedSubject, setSelectedSubject] = useState<ApiClassroom | null>(null);
  const [subjectContent, setSubjectContent] = useState<ApiClassroomDetail | null>(null);
  const [loadingSubject, setLoadingSubject] = useState<boolean>(false);

  // Split view inside Chapter list: 'both' | 'videos' | 'pdfs'
  const [chapterViewMode, setChapterViewMode] = useState<'both' | 'videos' | 'pdfs'>('both');
  const [chapterSearch, setChapterSearch] = useState<string>('');

  // Main Tabs on batch level: 'subjects' | 'faculty' | 'overview'
  const [batchTab, setBatchTab] = useState<'subjects' | 'faculty' | 'overview'>('subjects');

  // Load course details on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoadingDetails(true);
      const res = await kgsApi.getCourseDetails(course.slug);
      if (isMounted) {
        setDetails(res);
        setLoadingDetails(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [course.slug]);

  // When a user selects a subject: load chapters, videos, and pdfs
  const handleOpenSubject = async (cls: ApiClassroom) => {
    setSelectedSubject(cls);
    setLoadingSubject(true);
    const content = await kgsApi.getClassroom(course.id, cls.id);
    setSubjectContent(content);
    setLoadingSubject(false);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

  // Filter videos and pdfs by chapterSearch
  const filteredVideos = (subjectContent?.videos || []).filter(v => 
    v.name.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const filteredPdfs = (subjectContent?.notes || []).filter(n => 
    (n.name || n.title || '').toLowerCase().includes(chapterSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 select-none">
      {/* Top Mobile Bar */}
      <div className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between">
        <button
          onClick={() => {
            if (selectedSubject) {
              setSelectedSubject(null);
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{selectedSubject ? 'All Subjects' : 'All Batches'}</span>
        </button>

        <div 
          onClick={onLogoTap}
          className="text-xs text-slate-300 truncate max-w-[210px] font-bold cursor-pointer"
          title="Khan Global Studies"
        >
          {selectedSubject ? selectedSubject.name : course.title}
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              KGS OFFICIAL BATCH
            </span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
              ID: #{course.id}
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-white leading-snug">
            {course.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
            <span className="text-amber-400 font-extrabold text-sm">
              {formatPrice(course.price)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-400" />
              Starts: {formatEnglishDate(course.start_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-3">
        {/* Loading Spinner */}
        {loadingDetails && (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-xs">Loading course subjects & curriculum...</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* LEVEL 2: CHAPTER LIST VIEW (When a Subject is Clicked)       */}
        {/* ============================================================ */}
        {!loadingDetails && selectedSubject && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Subject Banner Header */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    Selected Subject
                  </span>
                  <h3 className="text-sm font-black text-white truncate">
                    {selectedSubject.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {subjectContent?.videos?.length || selectedSubject.video || 0} Lectures • {subjectContent?.notes?.length || selectedSubject.note || 0} PDF Notes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubject(null)}
                className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Layout Switcher: Side-by-Side (Both), Video Column (Left), PDF Column (Right) */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setChapterViewMode('both')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chapterViewMode === 'both' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setChapterViewMode('videos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chapterViewMode === 'videos' ? 'bg-red-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Videos ({subjectContent?.videos?.length || selectedSubject.video || 0})
                </button>
                <button
                  onClick={() => setChapterViewMode('pdfs')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chapterViewMode === 'pdfs' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
                  }`}
                >
                  PDFs ({subjectContent?.notes?.length || selectedSubject.note || 0})
                </button>
              </div>

              {/* Quick Filter */}
              <div className="relative w-36">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Filter chapters..."
                  className="w-full bg-slate-900 text-white text-[11px] pl-7 pr-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {loadingSubject ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                <p className="text-xs">Loading chapters, video lectures & PDF materials...</p>
              </div>
            ) : (
              /* CHAPTER LIST: VIDEO SECTION & PDF SECTION SIDE-BY-SIDE */
              <div className="space-y-4">
                {/* VIDEO SECTION (Left side / Primary) */}
                {(chapterViewMode === 'both' || chapterViewMode === 'videos') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <Video className="w-4 h-4 text-red-500" />
                        <span>Video Lectures Section ({filteredVideos.length})</span>
                      </span>
                      {filteredVideos.length > 0 && (
                        <button
                          onClick={() => onPlayVideo(filteredVideos[0], course)}
                          className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          Play First ▶
                        </button>
                      )}
                    </div>

                    {filteredVideos.length > 0 ? (
                      <div className="space-y-2">
                        {filteredVideos.map((vid, vIdx) => (
                          <div
                            key={vid.id}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-3 hover:border-amber-400/50 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0 font-bold text-xs group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                              <div className="truncate">
                                <span className="text-[9px] font-mono text-amber-400 uppercase block font-bold">
                                  Lecture #{vIdx + 1}
                                </span>
                                <h5 className="text-xs font-bold text-white truncate">
                                  {vid.name}
                                </h5>
                                <span className="text-[10px] text-slate-400">
                                  {formatEnglishDate(vid.published_at)} • 1080p HD
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onPlayVideo(vid, course)}
                              className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Play</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        No video lectures found for this search.
                      </div>
                    )}
                  </div>
                )}

                {/* PDF SECTION (Right side / Companion) */}
                {(chapterViewMode === 'both' || chapterViewMode === 'pdfs') && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>PDF Class Notes & DPP Section ({filteredPdfs.length})</span>
                      </span>
                    </div>

                    {filteredPdfs.length > 0 ? (
                      <div className="space-y-2">
                        {filteredPdfs.map((note, nIdx) => (
                          <div
                            key={note.id || nIdx}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-2.5 hover:border-amber-400/50 transition-all flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <h5 className="text-xs font-bold text-white truncate">
                                  {note.name || note.title || `Class Notes #${nIdx + 1}`}
                                </h5>
                                <span className="text-[10px] text-slate-400">
                                  {formatEnglishDate(note.published_at)} • Official PDF
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onOpenPdf({
                                title: note.name || note.title || 'KGS Class Notes',
                                url: note.url || note.file_url || 'https://kgs-v2.akamaized.net/kgs/kgs/pdfs/sample.pdf'
                              }, course.title)}
                              className="py-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors shrink-0 cursor-pointer"
                            >
                              Open PDF
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        No separate PDF documents found for this subject. Check lecture attachments.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* LEVEL 1: SUBJECT LIST VIEW (When Batch is First Opened)      */}
        {/* ============================================================ */}
        {!loadingDetails && !selectedSubject && (
          <div className="space-y-4">
            {/* Batch Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <button
                onClick={() => setBatchTab('subjects')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  batchTab === 'subjects' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 bg-slate-900'
                }`}
              >
                <span>Subject List ({details?.classrooms?.length || 0})</span>
              </button>

              <button
                onClick={() => setBatchTab('faculty')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  batchTab === 'faculty' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 bg-slate-900'
                }`}
              >
                <span>Faculty ({details?.teachers?.length || 0})</span>
              </button>

              <button
                onClick={() => setBatchTab('overview')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  batchTab === 'overview' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 bg-slate-900'
                }`}
              >
                <span>Syllabus</span>
              </button>
            </div>

            {/* TAB: SUBJECT LIST */}
            {batchTab === 'subjects' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-bold text-white uppercase tracking-wider">
                    Select a Subject to View Chapters:
                  </span>
                  <span className="text-amber-400 font-mono">
                    {details?.classrooms?.length || 0} Subjects
                  </span>
                </div>

                {details?.classrooms && details.classrooms.length > 0 ? (
                  <div className="space-y-2.5">
                    {details.classrooms.map((cls, idx) => (
                      <div
                        key={cls.id}
                        onClick={() => handleOpenSubject(cls)}
                        className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-400 transition-all shadow-sm hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors font-bold text-sm">
                            #{idx + 1}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition-colors truncate">
                              {cls.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Video className="w-3 h-3 text-red-500" />
                                {cls.video} Lectures
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-300">
                                <FileText className="w-3 h-3 text-amber-500" />
                                {cls.note || 0} PDFs
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0 group-hover:translate-x-1 transition-transform">
                          <span>Open</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-400">
                    No subjects listed yet for this batch. Classes will begin soon.
                  </div>
                )}
              </div>
            )}

            {/* TAB: FACULTY LIST */}
            {batchTab === 'faculty' && (
              <div className="space-y-2.5">
                {details?.teachers && details.teachers.length > 0 ? (
                  details.teachers.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-start gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-amber-400/30 shrink-0">
                        <img
                          src={t.image}
                          alt={t.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-white">{t.name}</h4>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                            {t.designation || 'Faculty'}
                          </span>
                        </div>
                        {t.content && (
                          <div 
                            className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: t.content }}
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    Faculty details will be updated shortly.
                  </div>
                )}
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {batchTab === 'overview' && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
                <h4 className="font-bold text-sm text-white">Curriculum & Details</h4>
                {details?.details ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: typeof details.details === 'string' 
                        ? details.details 
                        : details.details.overview || 'Batch overview available.'
                    }}
                  />
                ) : (
                  <p>Comprehensive course covering live lectures, chapter notes, and daily practice problem sheets.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature Footer */}
      <div className="mt-8 text-center py-4 border-t border-slate-900">
        <p className="text-xs tracking-wider">
          <span className="text-slate-500 font-medium">Powered by </span>
          <span className="text-white font-bold">ravan_</span>
          <span className="text-amber-400 font-black">kingX👑</span>
        </p>
      </div>
    </div>
  );
};
