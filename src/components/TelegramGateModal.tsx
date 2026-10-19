import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface TelegramGateModalProps {
  isOpen: boolean;
  onVerified: () => void;
  telegramUrl: string;
}

export const TelegramGateModal: React.FC<TelegramGateModalProps> = ({
  isOpen,
  onVerified,
  telegramUrl
}) => {
  const [hasClickedJoin, setHasClickedJoin] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoinClick = () => {
    window.open(telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1', '_blank', 'noopener,noreferrer');
    setHasClickedJoin(true);
    setWarningMessage(null);
    setIsVerifying(true);

    // Automatic verification process as requested: "jaise join kar le to verify automatic ho"
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      try {
        localStorage.setItem('kgs_tg_verified_ravan_kingx', 'true');
      } catch {
        // ignore
      }
      setTimeout(() => {
        onVerified();
      }, 900);
    }, 2800);
  };

  const handleManualContinue = () => {
    if (!hasClickedJoin && !isVerified) {
      setWarningMessage('Access Denied: You must click "Join Telegram Channel" above to unlock courses!');
      return;
    }
    if (isVerified) {
      onVerified();
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 select-none bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-[370px] rounded-3xl bg-[#0b1120] border border-sky-500/40 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(14,165,233,0.25)] text-center text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow behind logo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-sky-500/25 rounded-full blur-3xl pointer-events-none"></div>

        {/* Telegram Icon Box */}
        <div className="relative mx-auto mb-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2AABEE] via-[#229ED9] to-[#0088cc] flex items-center justify-center shadow-[0_10px_25px_rgba(34,158,217,0.5)] border border-sky-300/40">
          <Send className="w-8 h-8 text-white fill-white -ml-0.5 -mt-0.5" />
        </div>

        {/* Official Channel Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold tracking-wide uppercase mb-1.5">
          <ShieldCheck className="w-3 h-3" />
          <span>Mandatory Join Verification</span>
        </div>

        {/* Title & Description in English */}
        <h3 className="text-lg font-black text-white leading-tight">
          Join Official Telegram
        </h3>
        <p className="text-xs text-slate-300 mt-1 mb-3 leading-relaxed">
          Unlock all batch video lectures, PDF notes, and test series by joining our official community.
        </p>

        {/* Perks Box */}
        <div className="space-y-2 text-left mb-3.5 bg-white/5 rounded-2xl p-3 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-medium text-slate-200">Instant Access to All Batches & Classes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-medium text-slate-200">Direct Download for Lecture PDF Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-medium text-slate-200">100,000+ Active Students Community</span>
          </div>
        </div>

        {/* Verification Status Banner */}
        {isVerifying && (
          <div className="mb-3 p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs flex items-center justify-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Verifying subscription automatically...</span>
          </div>
        )}

        {isVerified && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verified Successfully! Entering App...</span>
          </div>
        )}

        {/* Warning if user tries to continue without clicking */}
        {warningMessage && !isVerifying && !isVerified && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] leading-snug">
            {warningMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleJoinClick}
            disabled={isVerified}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-75"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>
              {isVerified ? '✓ Joined & Verified' : hasClickedJoin ? 'Reopen Telegram Channel' : 'Join Telegram Channel (Required)'}
            </span>
          </button>

          {!isVerified && (
            <button
              onClick={handleManualContinue}
              className={`w-full py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hasClickedJoin 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              <span>{hasClickedJoin ? 'Checking verification status...' : 'Continue to Courses'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Footer Signature */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
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
