import React from 'react';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Code2, 
  Cpu, 
  GraduationCap, 
  FileText, 
  Video, 
  CheckCircle2, 
  Zap,
  Globe,
  Heart
} from 'lucide-react';

interface AboutSectionProps {
  telegramUrl?: string;
  onOpenBatches?: () => void;
  onLogoTap?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  telegramUrl = 'https://t.me/+g42TEGdV8HE3NWM1',
  onOpenBatches,
  onLogoTap
}) => {
  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Hero Creator Profile Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 border-2 border-amber-400/40 p-5 shadow-2xl text-white">
        {/* Decorative ambient glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Crowned Avatar */}
            <div 
              onClick={onLogoTap}
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
              title="ravan_kingX"
            >
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center border border-amber-400/50">
                <span className="text-2xl font-black text-amber-400 tracking-tighter">RK</span>
                <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase -mt-0.5">DEV</span>
              </div>
              <div className="absolute -top-2.5 -right-2 bg-slate-900 border-2 border-amber-400 text-amber-400 text-xs px-1.5 py-0.5 rounded-full font-bold shadow-md animate-bounce">
                👑
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wide text-white">
                  ravan_
                </span>
                <span className="text-lg font-black tracking-wide text-amber-400">
                  kingX👑
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-slate-300">
                Lead Architect & Platform Creator
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Developer
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Verified Creator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Short Statement */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            Welcome to the official customized learning platform designed and engineered by <strong className="text-white">ravan_</strong><strong className="text-amber-400">kingX👑</strong>. Dedicated to empowering students nationwide with seamless access to Khan Global Studies batches, classes, and companion PDF study materials.
          </p>
        </div>

        {/* Telegram Direct Action */}
        <div className="mt-4 flex items-center gap-2">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-center"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join ravan_kingX on Telegram</span>
          </a>
        </div>
      </div>

      {/* About Me Details in English */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 text-slate-300 text-xs">
        <div className="flex items-center gap-2 text-white font-black text-sm">
          <Code2 className="w-4 h-4 text-amber-400" />
          <span>About ravan_kingX</span>
        </div>

        <p className="leading-relaxed">
          I am <strong>ravan_kingX</strong>, a passionate software engineer and digital systems architect. My focus is on creating high-performance educational software that eliminates digital hurdles, eliminates clutter, and puts rich learning content right at the fingertips of every aspirant.
        </p>

        <p className="leading-relaxed">
          Whether you are preparing for <strong>UPSC Civil Services, BPSC, SSC CGL/CHSL, Railway RRB, Defence (NDA/CDS), or State Teaching Exams (TRE)</strong>, this portal organizes all <strong>956+ live batches</strong> into clean subject modules and chapter-wise study materials.
        </p>
      </div>

      {/* Core Platform Capabilities */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-white font-black text-sm">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Engineered Highlights</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">All 956+ Live Batches Loaded</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Full catalog access to courses from Khan Sir and India's finest educators across all major government exam categories.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/15 text-red-400 shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">High-Speed Video Lecture Player</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Crystal clear 1080p HD and adaptive streaming with speed controls (0.5x - 2.5x), quick jump intervals, and full-screen view.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Integrated PDF Document Viewer</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Multi-page study notes and Daily Practice Problems (DPP) reader with zoom controls, dark reader mode, and instant download capability.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Ultra-Responsive Mobile Interface</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Engineered specifically for smooth thumb-navigation, zero latency, instant search filtering, and lightning-fast batch discovery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Community & Telegram Notice */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-950/70 to-slate-900 border border-sky-500/30 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
          <Send className="w-4 h-4" />
          <span>Official Student Community</span>
        </div>
        <h3 className="text-sm font-black text-white">
          Stay Connected with ravan_kingX
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Join our active community on Telegram to receive instant batch updates, exam notifications, newly uploaded PDF notes, and direct developer announcements.
        </p>

        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 py-2 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all"
        >
          <span>Join Official Channel</span>
          <span>→</span>
        </a>
      </div>

      {/* Quick Action back to Batches */}
      {onOpenBatches && (
        <div className="pt-2 text-center">
          <button
            onClick={onOpenBatches}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Explore All 956 Batches</span>
          </button>
        </div>
      )}

      {/* Creator Signature Footer */}
      <div className="text-center pt-4">
        <p className="text-xs tracking-wider">
          <span className="text-slate-500 font-medium">Proudly Engineered by </span>
          <span className="text-white font-bold">ravan_</span>
          <span className="text-amber-400 font-black">kingX👑</span>
        </p>
        <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1 font-mono">
          <span>Crafted with passion for knowledge seekers across India</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
        </p>
      </div>
    </div>
  );
};
