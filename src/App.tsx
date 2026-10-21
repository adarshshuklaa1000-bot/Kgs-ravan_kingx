import React, { useState, useEffect, useRef } from 'react';
import { 
  ApiCourseItem, 
  ApiTestItem, 
  ApiVideoItem, 
  kgsApi 
} from './services/api';
import { Header } from './components/Header';
import { CourseCard } from './components/CourseCard';
import { CourseDetailView } from './components/CourseDetailView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { SplashScreen } from './components/SplashScreen';
import { TelegramGateModal } from './components/TelegramGateModal';
import { ScreenCenterAnnouncementModal } from './components/ScreenCenterAnnouncementModal';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { SecretAdminModal } from './components/SecretAdminModal';
import { AboutSection } from './components/AboutSection';
import { initAntiInspectArmor } from './utils/security';
import { 
  ShieldCheck,
  Lock,
  RefreshCw, 
  BookOpen, 
  Video, 
  Send, 
  GraduationCap, 
  Award,
  CheckCircle2,
  ChevronDown,
  User,
  Layers,
  Heart
} from 'lucide-react';

interface AdminConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcement: {
    enabled: boolean;
    id: string;
    title: string;
    message: string;
    badge: string;
  };
  telegramUrl: string;
  updatedAt?: number;
}

export default function App() {
  // Splash & Verification state
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isTelegramVerified, setIsTelegramVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kgs_tg_verified_ravan_kingx') === 'true';
    } catch {
      return false;
    }
  });

  // Admin remote real-time config state
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    maintenanceMode: false,
    maintenanceMessage: 'System maintenance in progress. Please check back shortly.',
    announcement: {
      enabled: false,
      id: '1',
      title: 'Khan Sir Special Notice 📢',
      message: 'Join our official Telegram community for daily notes and live updates!',
      badge: 'OFFICIAL ALERT'
    },
    telegramUrl: 'https://t.me/+g42TEGdV8HE3NWM1'
  });

  // Center screen announcement state
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  // 5-tap Secret Admin Trigger state
  const [logoTapCount, setLogoTapCount] = useState<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const [isSecretAdminOpen, setIsSecretAdminOpen] = useState<boolean>(false);

  // Live Courses state - ALL 956 BATCHES
  const [courses, setCourses] = useState<ApiCourseItem[]>([]);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Progressive render limit for high-speed 60fps scrolling across all 956 batches
  const [visibleLimit, setVisibleLimit] = useState<number>(36);

  // Navigation & Filter state
  const [activeTab, setActiveTab] = useState<'courses' | 'favourites' | 'about'>('courses');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<ApiCourseItem | null>(null);

  // Favourites state (saved persistently in localStorage)
  const [favouriteIds, setFavouriteIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('kgs_favourite_batches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleFavourite = (course: ApiCourseItem) => {
    setFavouriteIds((prev) => {
      const exists = prev.includes(course.id);
      const next = exists ? prev.filter((id) => id !== course.id) : [...prev, course.id];
      try {
        localStorage.setItem('kgs_favourite_batches', JSON.stringify(next));
      } catch {
        // storage fallback
      }
      return next;
    });
  };

  // Modals for Video and PDF
  const [activeVideo, setActiveVideo] = useState<{
    videoItem: ApiVideoItem;
    course: ApiCourseItem;
  } | null>(null);

  const [activePdf, setActivePdf] = useState<{
    title: string;
    url: string;
    courseTitle?: string;
  } | null>(null);

  // Real-time synchronization engine across all visitors
  const fetchAdminConfig = async (): Promise<AdminConfig | null> => {
    try {
      const res = await fetch('/api/admin/config', {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminConfig(data);
        return data;
      }
    } catch {
      // Local fallback
    }
    return null;
  };

  useEffect(() => {
    let sse: EventSource | null = null;
    let pollTimer: any = null;
    let isMounted = true;

    // Apply updated remote config immediately to all visitors
    const applyRemoteConfig = (data: any) => {
      if (!data || !isMounted) return;
      setAdminConfig((prev) => {
        // Check if values actually changed to avoid unnecessary re-renders
        if (
          prev.maintenanceMode === data.maintenanceMode &&
          prev.maintenanceMessage === data.maintenanceMessage &&
          prev.announcement?.enabled === data.announcement?.enabled &&
          prev.announcement?.id === data.announcement?.id &&
          prev.announcement?.message === data.announcement?.message &&
          prev.announcement?.title === data.announcement?.title &&
          prev.telegramUrl === data.telegramUrl
        ) {
          return prev;
        }
        return {
          maintenanceMode: Boolean(data.maintenanceMode),
          maintenanceMessage: data.maintenanceMessage || 'System maintenance in progress.',
          announcement: data.announcement || { enabled: false, id: '1', title: '', message: '', badge: 'NOTICE' },
          telegramUrl: data.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
          updatedAt: data.updatedAt
        };
      });
    };

    // 1. Instant initial fetch
    fetchAdminConfig().then(applyRemoteConfig);

    // 2. Real-Time Server-Sent Events (SSE) Stream (<50ms delivery to all connected visitors)
    try {
      sse = new EventSource('/api/admin/stream');
      sse.addEventListener('config_update', (event) => {
        try {
          const payload = JSON.parse(event.data);
          applyRemoteConfig(payload);
        } catch (e) {
          console.error('Error parsing SSE config update:', e);
        }
      });
      sse.onerror = () => {
        // SSE automatically reconnects
      };
    } catch (e) {
      console.warn('SSE not supported on this browser, relying on fast polling', e);
    }

    // 3. Fast fallback polling every 2 seconds
    pollTimer = setInterval(async () => {
      const cfg = await fetchAdminConfig();
      if (cfg) applyRemoteConfig(cfg);
    }, 2000);

    // 4. Instant sync on tab visibility or window focus
    const onVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const cfg = await fetchAdminConfig();
        if (cfg) applyRemoteConfig(cfg);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    // 5. Cross-tab instant synchronization via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('kgs_portal_admin_sync');
      broadcastChannel.onmessage = (event) => {
        if (event.data) applyRemoteConfig(event.data);
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      isMounted = false;
      if (sse) sse.close();
      if (pollTimer) clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
      if (broadcastChannel) broadcastChannel.close();
    };
  }, []);

  // Fetch ALL 956 batches on start!
  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coursesResult = await kgsApi.getCourses(1, 1000); // Loads all 956 batches in 1 request

      if (coursesResult && coursesResult.items && coursesResult.items.length > 0) {
        setCourses(coursesResult.items);
        setTotalCourses(coursesResult.total || coursesResult.items.length || 956);
      }
    } catch (err: any) {
      console.error('Error fetching live KGS data:', err);
      setError('Unable to connect to live learning server. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAntiInspectArmor();
    loadInitialData();
  }, []);

  // Reset visible limit whenever category or search query changes
  useEffect(() => {
    setVisibleLimit(36);
  }, [categoryFilter, searchQuery]);

  // 5-Tap Logo Handler to open Secret Admin modal (password: khushi)
  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 1200) {
      const newCount = logoTapCount + 1;
      setLogoTapCount(newCount);
      if (newCount >= 5) {
        setIsSecretAdminOpen(true);
        setLogoTapCount(0);
      }
    } else {
      setLogoTapCount(1);
    }
    lastTapTimeRef.current = now;
  };

  // Save admin config updates to server
  const handleSaveAdminConfig = async (updates: any, newPassword?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'ravan_kingx_admin_token',
          updates,
          newPassword
        })
      });
      if (res.ok) {
        await fetchAdminConfig();
        return true;
      }
    } catch (err) {
      console.error('Error updating config on server:', err);
    }
    return false;
  };

  // Quick Play handler
  const handleQuickPlay = async (course: ApiCourseItem) => {
    try {
      const details = await kgsApi.getCourseDetails(course.slug);
      if (details && details.classrooms && details.classrooms.length > 0) {
        const clsId = details.classrooms[0].id;
        const clsContent = await kgsApi.getClassroom(course.id, clsId);
        if (clsContent && clsContent.videos && clsContent.videos.length > 0) {
          setActiveVideo({
            videoItem: clsContent.videos[0],
            course: course
          });
          return;
        }
      }
      setSelectedCourse(course);
    } catch {
      setSelectedCourse(course);
    }
  };

  // Filter courses in pure English
  const filteredCourses = courses.filter((c) => {
    const t = c.title.toLowerCase();
    let matchesCategory = true;
    if (categoryFilter === 'bpsc') matchesCategory = t.includes('bpsc') || t.includes('bihar');
    else if (categoryFilter === 'upsc') matchesCategory = t.includes('upsc') || t.includes('ias');
    else if (categoryFilter === 'ssc_railway') matchesCategory = t.includes('ssc') || t.includes('railway') || t.includes('rrb') || t.includes('alp') || t.includes('je');
    else if (categoryFilter === 'math') matchesCategory = t.includes('math') || t.includes('गणित');
    else if (categoryFilter === 'teaching') matchesCategory = t.includes('tre') || t.includes('tet') || t.includes('bstet');
    else if (categoryFilter === 'tech') matchesCategory = t.includes('ai') || t.includes('marketing') || t.includes('developer') || t.includes('web');
    else if (categoryFilter === 'defence') matchesCategory = t.includes('defence') || t.includes('nda') || t.includes('cds');

    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const displayedCourses = filteredCourses.slice(0, visibleLimit);

  // Filter user's saved favourite batches
  const favouriteCourses = courses.filter((c) => favouriteIds.includes(c.id));
  const filteredFavourites = favouriteCourses.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Announcement check
  const isAnnouncementActive = 
    adminConfig.announcement?.enabled && 
    adminConfig.announcement?.message && 
    !dismissedAnnouncements.includes(adminConfig.announcement.id || '1');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Animated Splash Screen on Load with VERY BIG ravan_kingX */}
      {showSplash && (
        <SplashScreen 
          onFinish={() => setShowSplash(false)} 
          isLoadingData={isLoading} 
        />
      )}

      {/* 2. Maintenance Screen (Remote Controlled) */}
      {adminConfig.maintenanceMode && (
        <MaintenanceScreen
          message={adminConfig.maintenanceMessage}
          onLogoTap={handleLogoTap}
          onRefresh={fetchAdminConfig}
        />
      )}

      {/* 3. Mandatory Telegram Join Gate with Automatic Verification */}
      {!showSplash && !isTelegramVerified && (
        <TelegramGateModal
          isOpen={true}
          telegramUrl={adminConfig.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1'}
          onVerified={() => setIsTelegramVerified(true)}
        />
      )}

      {/* 4. Screen-Center Animated Announcement Popup */}
      {!showSplash && isAnnouncementActive && (
        <ScreenCenterAnnouncementModal
          isOpen={true}
          announcement={adminConfig.announcement}
          onClose={() => {
            setDismissedAnnouncements(prev => [...prev, adminConfig.announcement.id || '1']);
          }}
        />
      )}

      {/* 5. Secret Admin Panel Modal (5 Taps on Logo) */}
      <SecretAdminModal
        isOpen={isSecretAdminOpen}
        onClose={() => setIsSecretAdminOpen(false)}
        config={adminConfig}
        onSaveConfig={handleSaveAdminConfig}
      />

      {/* MAIN APPLICATION - MOBILE-ONLY VIEWPORT CONTAINER */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 border-x border-slate-800/80 shadow-2xl flex flex-col justify-between relative">
        {/* Mobile Header with 5-tap trigger */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedCourse(null);
          }}
          onRefresh={loadInitialData}
          isLoading={isLoading}
          coursesCount={totalCourses || courses.length}
          favouritesCount={favouriteIds.length}
          onLogoTap={handleLogoTap}
          onOpenTelegram={() => window.open(adminConfig.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1', '_blank')}
        />

        {/* View Switcher: Course Details (Subject -> Chapter -> Video/PDF) or Main Dashboard */}
        {selectedCourse ? (
          <CourseDetailView
            course={selectedCourse}
            onBack={() => setSelectedCourse(null)}
            onPlayVideo={(videoItem, courseItem) => {
              setActiveVideo({ videoItem, course: courseItem });
            }}
            onOpenPdf={(pdf, courseTitle) => {
              setActivePdf({ ...pdf, courseTitle });
            }}
            onLogoTap={handleLogoTap}
            isFavourite={favouriteIds.includes(selectedCourse.id)}
            onToggleFavourite={handleToggleFavourite}
          />
        ) : (
          <main className="flex-1 p-3 space-y-4 pb-24">
            {/* Mobile Hero Announcement Card - Completely Free of 'API' word */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-4 shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Official Batches</span>
                </span>
                <button
                  onClick={() => setActiveTab('about')}
                  className="text-[11px] font-mono font-black text-amber-400 hover:underline cursor-pointer"
                  title="About ravan_kingX"
                >
                  ravan_kingx👑
                </button>
              </div>

              <h2 className="text-base font-black text-white leading-tight">
                All Active Batches & Classrooms
              </h2>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Official courses by Khan Sir & India's top educators. Access full subject lists, chapter videos, and companion PDF notes.
              </p>

              {/* Military-Grade Privacy Shield Badge */}
              <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Military Guard Active: HMAC Client Guard &amp; AES-256 Vault Shield</span>
              </div>

              {/* Quick Action buttons in English */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (courses.length > 0) handleQuickPlay(courses[0]);
                  }}
                  className="flex-1 py-1.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start First Class</span>
                </button>

                <button
                  onClick={() => setActiveTab('about')}
                  className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <span className="text-xs">👑</span>
                  <span>About Me</span>
                </button>

                <button
                  onClick={() => window.open(adminConfig.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1', '_blank')}
                  className="py-1.5 px-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-400/30 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </button>
              </div>
            </div>

            {/* Error banner if network fails */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button onClick={loadInitialData} className="underline font-bold cursor-pointer">
                  Retry
                </button>
              </div>
            )}

            {/* TAB 1: ALL 956 BATCHES */}
            {activeTab === 'courses' && (
              <div className="space-y-3">
                {/* Horizontal Category Scroller in English */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'All Batches' },
                    { id: 'bpsc', label: 'BPSC / State PCS' },
                    { id: 'upsc', label: 'UPSC / IAS' },
                    { id: 'ssc_railway', label: 'SSC & Railway' },
                    { id: 'math', label: 'Maths Foundation' },
                    { id: 'teaching', label: 'Teaching (TRE)' },
                    { id: 'tech', label: 'Tech & AI' },
                    { id: 'defence', label: 'Defence Forces' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        categoryFilter === cat.id
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    Showing <strong className="text-amber-400 font-mono font-bold">{displayedCourses.length}</strong> of{' '}
                    <strong className="text-white font-mono">{filteredCourses.length}</strong>{' '}
                    ({totalCourses || 956} Batches in Database)
                  </span>
                  <span className="text-emerald-400 font-bold">Verified Cloud Network</span>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
                    <p className="text-xs">Loading all batches and subjects...</p>
                  </div>
                )}

                {/* Courses List - All Batches available */}
                {!isLoading && (
                  <div className="space-y-3">
                    {displayedCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onSelectCourse={(c) => setSelectedCourse(c)}
                        onQuickPlay={handleQuickPlay}
                        isFavourite={favouriteIds.includes(course.id)}
                        onToggleFavourite={handleToggleFavourite}
                      />
                    ))}

                    {/* Smooth Batch Pagination / Show More Controls */}
                    {displayedCourses.length < filteredCourses.length && (
                      <div className="pt-2 flex flex-col gap-2 text-center">
                        <button
                          onClick={() => setVisibleLimit(prev => Math.min(prev + 40, filteredCourses.length))}
                          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-2xl border border-slate-800 flex items-center justify-center gap-2 shadow cursor-pointer transition-all active:scale-98"
                        >
                          <ChevronDown className="w-4 h-4 animate-bounce" />
                          <span>Show Next 40 Batches ({displayedCourses.length} of {filteredCourses.length})</span>
                        </button>

                        <button
                          onClick={() => setVisibleLimit(filteredCourses.length)}
                          className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-medium text-[11px] rounded-xl border border-slate-800/60 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>Show All {filteredCourses.length} Batches At Once</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && filteredCourses.length === 0 && (
                  <div className="p-10 text-center bg-slate-900 rounded-2xl border border-slate-800">
                    <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No batches found</h4>
                    <p className="text-xs text-slate-400 mt-1">Try resetting search filters.</p>
                    <button
                      onClick={() => { setCategoryFilter('all'); setSearchQuery(''); }}
                      className="mt-3 px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      View All Batches
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY FAVOURITE BATCHES */}
            {activeTab === 'favourites' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      My Favourite Batches
                    </h3>
                  </div>
                  <span className="text-[11px] text-rose-400 font-mono font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                    Saved: {favouriteCourses.length}
                  </span>
                </div>

                {/* If user has saved favourite batches */}
                {filteredFavourites.length > 0 && (
                  <div className="space-y-3">
                    {filteredFavourites.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onSelectCourse={(c) => setSelectedCourse(c)}
                        onQuickPlay={handleQuickPlay}
                        isFavourite={true}
                        onToggleFavourite={handleToggleFavourite}
                      />
                    ))}
                  </div>
                )}

                {/* If user has saved batches, but search filter yields 0 */}
                {favouriteCourses.length > 0 && filteredFavourites.length === 0 && (
                  <div className="p-10 text-center bg-slate-900 rounded-2xl border border-slate-800">
                    <Heart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No matching favourites</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      No saved batch matches "{searchQuery}".
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {/* If user has NO favourite batches saved yet */}
                {favouriteCourses.length === 0 && (
                  <div className="py-14 px-6 text-center bg-slate-900/80 rounded-3xl border border-slate-800 space-y-4">
                    <div className="relative mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.25)]">
                      <Heart className="w-10 h-10 text-rose-500 fill-rose-500/20 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                        +
                      </div>
                    </div>

                    <div className="space-y-1.5 max-w-xs mx-auto">
                      <h4 className="text-base font-black text-white tracking-tight">
                        No Favourite Batches Yet
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Save your preferred Khan Sir batches here for quick 1-tap access! Simply tap the heart (<span className="text-rose-400 font-bold">❤️</span>) icon on any batch card.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setActiveTab('courses');
                          setCategoryFilter('all');
                          setSearchQuery('');
                        }}
                        className="py-2.5 px-6 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Explore All Batches Now</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ABOUT ME (ENGLISH SECTION ABOUT ravan_kingX) */}
            {activeTab === 'about' && (
              <AboutSection
                telegramUrl={adminConfig.telegramUrl}
                onOpenBatches={() => {
                  setActiveTab('courses');
                  setSelectedCourse(null);
                }}
                onLogoTap={handleLogoTap}
              />
            )}
          </main>
        )}

        {/* Mandatory Signature Footer with PROMINENT ravan_kingX */}
        <footer className="bg-slate-950 border-t border-slate-800 py-3 px-4 text-center shrink-0">
          <p className="text-xs tracking-wider">
            <span className="text-slate-400 font-medium">Powered by </span>
            <span className="text-white font-black tracking-wide">ravan_</span>
            <span className="text-amber-400 font-black tracking-wide">kingX👑</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Khan Global Studies Official Mobile Portal
          </p>
        </footer>

        {/* Mobile Bottom Floating Navigation Bar in English */}
        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around py-2 z-40 px-2">
          <button
            onClick={() => {
              setActiveTab('courses');
              setSelectedCourse(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'courses' && !selectedCourse ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] font-bold">Batches</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('favourites');
              setSelectedCourse(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors relative ${
              activeTab === 'favourites' ? 'text-rose-500 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Heart className={`w-5 h-5 ${activeTab === 'favourites' ? 'fill-current text-rose-500' : ''}`} />
              {favouriteIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 text-[8px] font-mono font-black bg-rose-600 text-white rounded-full min-w-[14px] text-center shadow">
                  {favouriteIds.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Favourites</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('about');
              setSelectedCourse(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'about' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <span className="text-base leading-none">👑</span>
            <span className="text-[10px] font-bold">About Me</span>
          </button>

          <button
            onClick={() => window.open(adminConfig.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1', '_blank')}
            className="flex flex-col items-center gap-1 text-sky-400 cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span className="text-[10px] font-bold">Telegram</span>
          </button>
        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayerModal
          videoItem={activeVideo.videoItem}
          course={activeVideo.course}
          onClose={() => setActiveVideo(null)}
          onOpenPdf={(pdf, courseTitle) => {
            setActivePdf({ ...pdf, courseTitle });
          }}
        />
      )}

      {/* PDF Document Viewer Modal */}
      {activePdf && (
        <PdfViewerModal
          pdf={{ title: activePdf.title, url: activePdf.url }}
          courseTitle={activePdf.courseTitle}
          onClose={() => setActivePdf(null)}
        />
      )}
    </div>
  );
}
