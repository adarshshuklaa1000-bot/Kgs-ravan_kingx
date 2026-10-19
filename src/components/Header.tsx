import React from 'react';
import { 
  Search, 
  Sparkles, 
  RefreshCw,
  GraduationCap,
  Award,
  Send
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'courses' | 'tests';
  setActiveTab: (tab: 'courses' | 'tests') => void;
  onRefresh: () => void;
  isLoading: boolean;
  coursesCount: number;
  testsCount: number;
  onLogoTap: () => void;
  onOpenTelegram: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onRefresh,
  isLoading,
  coursesCount,
  testsCount,
  onLogoTap,
  onOpenTelegram
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner Ribbon with ravan_kingX branding */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 text-[11px] font-extrabold py-1 px-3 text-center flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>KGS OFFICIAL APP</span>
        </span>
        <span className="font-mono text-[10px] tracking-wide">
          <span className="text-slate-900 font-bold">Powered by </span>
          <span className="text-white font-black">ravan_</span>
          <span className="text-slate-950 font-black">kingX👑</span>
        </span>
      </div>

      {/* Main Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo with 5-tap trigger for secret admin panel */}
        <div 
          onClick={onLogoTap}
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform select-none"
          title="Khan Global Studies"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center border border-amber-400/40">
              <span className="font-black text-amber-400 text-base tracking-tight">KGS</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight text-white leading-none">
                Khan Global Studies
              </h1>
              <span className="text-amber-400 text-xs">👑</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              By Khan Sir & Expert Faculty
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenTelegram}
            className="p-2 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 hover:text-white hover:bg-sky-500/30 transition-all cursor-pointer"
            title="Official Telegram Channel"
          >
            <Send className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Server Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Search Bar (Mobile Fitted) */}
      <div className="px-3 pb-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches, subjects, or topics..."
            className="w-full bg-slate-900 text-white placeholder-slate-400 text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="px-3 border-t border-slate-800/80 flex items-center justify-between py-1 bg-slate-950/80">
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>All Batches ({coursesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Test Series ({testsCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
