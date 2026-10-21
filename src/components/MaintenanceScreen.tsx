import React from 'react';
import { Wrench, RefreshCw } from 'lucide-react';

interface MaintenanceScreenProps {
  message: string;
  onLogoTap: () => void;
  onRefresh: () => void;
  onOpenAdmin?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message,
  onLogoTap,
  onRefresh,
  onOpenAdmin
}) => {
  return (
    <div className="fixed inset-0 z-[9998] bg-slate-950 flex flex-col items-center justify-between p-6 text-center select-none">
      {/* Top Bar with clickable logo for secret admin access */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div 
          onClick={onLogoTap}
          className="flex items-center gap-2 cursor-pointer group"
          title="Khan Global Studies"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black text-sm">
            KGS
          </div>
          <span className="text-xs font-bold text-slate-300">Khan Global Studies</span>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Center Maintenance Message */}
      <div className="max-w-sm space-y-4 py-8">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
          <Wrench className="w-12 h-12 animate-pulse" />
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            PAUSED
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30">
            System Maintenance Mode
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Portal Under Maintenance
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-2xl border border-slate-800 text-justify">
            {message || 'We are currently upgrading server systems and video content. Please check back shortly.'}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onRefresh}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:from-amber-400 cursor-pointer"
          >
            Check Server Status
          </button>
        </div>
      </div>

      {/* Mandatory Signature Footer with discreet admin lock button */}
      <div className="w-full max-w-md flex items-center justify-between py-2">
        <div className="w-6"></div>
        <p className="text-xs tracking-wider">
          <span className="text-slate-400">Powered by </span>
          <span className="text-white font-black">ravan_</span>
          <span className="text-amber-400 font-black">kingX👑</span>
        </p>
        <button
          onClick={onOpenAdmin || onLogoTap}
          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-amber-400 opacity-40 hover:opacity-100 transition-opacity cursor-pointer active:scale-90"
          title="Admin Unlock Controller"
        >
          <span className="text-xs">🔒</span>
        </button>
      </div>
    </div>
  );
};
