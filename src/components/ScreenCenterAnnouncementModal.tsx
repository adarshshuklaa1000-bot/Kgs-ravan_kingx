import React from 'react';
import { Megaphone, X } from 'lucide-react';

interface ScreenCenterAnnouncementModalProps {
  isOpen: boolean;
  announcement: {
    title: string;
    message: string;
    badge?: string;
  };
  onClose: () => void;
}

export const ScreenCenterAnnouncementModal: React.FC<ScreenCenterAnnouncementModalProps> = ({
  isOpen,
  announcement,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[360px] rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] text-center text-white overflow-hidden animate-in zoom-in-95 duration-250">
        {/* Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button ("use back kare to kate") */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Megaphone icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-amber-500/30">
          <Megaphone className="w-8 h-8" />
        </div>

        {/* Badge */}
        <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/40 mb-2">
          {announcement.badge || 'Official Announcement'}
        </span>

        {/* Title & Message */}
        <h3 className="text-lg font-black text-white leading-tight">
          {announcement.title}
        </h3>
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-left">
          {announcement.message}
        </p>

        {/* Dismiss Button */}
        <div className="mt-4 space-y-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>

        {/* Signature */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] tracking-wider">
            <span className="text-slate-400">Powered by </span>
            <span className="text-white font-bold">ravan_</span>
            <span className="text-amber-400 font-extrabold">kingX👑</span>
          </p>
        </div>
      </div>
    </div>
  );
};
