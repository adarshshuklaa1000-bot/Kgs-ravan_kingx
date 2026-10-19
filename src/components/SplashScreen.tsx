import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  isLoadingData: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState<number>(15);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(50), 300);
    const t2 = setTimeout(() => setProgress(85), 750);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsFading(true);
        setTimeout(onFinish, 400);
      }, 450);
    }, 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-between p-6 transition-opacity duration-400 select-none ${
      isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Top Header Label */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="tracking-widest uppercase">KGS Mobile App v3.5</span>
        <span className="flex items-center gap-1 text-amber-400 font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          OFFICIAL PORTAL
        </span>
      </div>

      {/* Center Showcase: Animated Logo + VERY BIG Powered by ravan_kingX */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto">
        {/* Animated 3D Styled Logo Badge */}
        <div className="relative">
          {/* Pulsing Backlight Ring */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 blur-2xl animate-pulse"></div>
          
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-[0_15px_40px_rgba(245,158,11,0.35)] animate-in zoom-in-75 duration-500">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center border border-amber-400/50">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 tracking-tighter">
                KGS
              </span>
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase -mt-1">
                PATNA & DELHI
              </span>
            </div>
          </div>

          {/* Floating Crown Badge */}
          <div className="absolute -top-3 -right-2 bg-slate-900 border-2 border-amber-400 text-amber-400 text-sm px-2 py-0.5 rounded-full shadow-lg font-bold animate-bounce">
            👑
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Khan Global Studies
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide">
            Dedicated to Nation Building • Khan Sir
          </p>
        </div>

        {/* USER REQUIREMENT: "loding aur logo ke just niche bahut bada powered by ravan_kingx rahe" */}
        <div className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] animate-in fade-in duration-700">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
            Architect & Controller
          </p>
          <div className="text-2xl sm:text-3xl font-black tracking-wider leading-none">
            <span className="text-slate-400 font-medium text-lg sm:text-xl">Powered by </span>
            <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">ravan_</span>
            <span className="text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.6)]">kingX👑</span>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-64 space-y-2 pt-2">
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {progress < 100 ? 'Synchronizing live batches & classrooms...' : 'Ready...'}
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center py-2 text-[10px] text-slate-500 font-mono">
        All Live Batches • Video Lectures • PDF Study Notes
      </div>
    </div>
  );
};
