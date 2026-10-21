import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Wrench, 
  Megaphone, 
  Send, 
  Key, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Radio,
  Sparkles,
  Zap
} from 'lucide-react';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
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
  };
  onSaveConfig: (updates: any, newPassword?: string) => Promise<boolean>;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Editable Form states
  const [maintenance, setMaintenance] = useState<boolean>(config.maintenanceMode);
  const [maintenanceMsg, setMaintenanceMsg] = useState<string>(
    config.maintenanceMessage || 'System maintenance in progress. Portal will resume shortly.'
  );
  
  const [announcementEnabled, setAnnouncementEnabled] = useState<boolean>(config.announcement?.enabled || false);
  const [announcementTitle, setAnnouncementTitle] = useState<string>(config.announcement?.title || '');
  const [announcementMsg, setAnnouncementMsg] = useState<string>(config.announcement?.message || '');
  const [announcementBadge, setAnnouncementBadge] = useState<string>(config.announcement?.badge || 'OFFICIAL ALERT');

  const [telegramLink, setTelegramLink] = useState<string>(config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1');
  const [newPassword, setNewPassword] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Sync state whenever modal opens or parent config changes
  useEffect(() => {
    if (isOpen && config) {
      setMaintenance(Boolean(config.maintenanceMode));
      if (config.maintenanceMessage) setMaintenanceMsg(config.maintenanceMessage);
      if (config.announcement) {
        setAnnouncementEnabled(Boolean(config.announcement.enabled));
        setAnnouncementTitle(config.announcement.title || '');
        setAnnouncementMsg(config.announcement.message || '');
        setAnnouncementBadge(config.announcement.badge || 'OFFICIAL ALERT');
      }
      if (config.telegramUrl) setTelegramLink(config.telegramUrl);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const cleanInput = passwordInput.trim().toLowerCase();

    try {
      const res = await fetch('/api/admin/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        if (data.config) {
          setMaintenance(Boolean(data.config.maintenanceMode));
          setMaintenanceMsg(data.config.maintenanceMessage || maintenanceMsg);
          setAnnouncementEnabled(Boolean(data.config.announcement?.enabled));
          setAnnouncementTitle(data.config.announcement?.title || '');
          setAnnouncementMsg(data.config.announcement?.message || '');
          setAnnouncementBadge(data.config.announcement?.badge || 'OFFICIAL ALERT');
          setTelegramLink(data.config.telegramUrl || telegramLink);
        }
        return;
      }
    } catch {
      // Network fallback
    }

    // Local fallback check
    const localPass = (localStorage.getItem('kgs_admin_pass') || 'khushi').trim().toLowerCase();
    if (cleanInput === localPass || cleanInput === 'khushi') {
      setIsAuthenticated(true);
    } else {
      setLoginError('Incorrect passcode! Default master passcode is: khushi');
    }
    setIsLoggingIn(false);
  };

  // Instant save & broadcast helper
  const executeBroadcast = async (
    targetMaintenance: boolean,
    targetAnnouncementEnabled: boolean,
    forceNewAnnouncementId = false
  ) => {
    setIsSaving(true);
    setSaveSuccess(null);

    const updates = {
      maintenanceMode: targetMaintenance,
      maintenanceMessage: maintenanceMsg.trim() || 'System maintenance in progress. Portal will resume shortly.',
      announcement: {
        enabled: targetAnnouncementEnabled,
        id: forceNewAnnouncementId || targetAnnouncementEnabled ? `ann_${Date.now()}` : (config.announcement?.id || '1'),
        title: announcementTitle.trim() || 'Important Announcement 📢',
        message: announcementMsg.trim() || 'Join our Telegram channel for live updates and study material.',
        badge: announcementBadge.trim() || 'LIVE ALERT'
      },
      telegramUrl: telegramLink.trim() || 'https://t.me/+g42TEGdV8HE3NWM1'
    };

    const success = await onSaveConfig(updates, newPassword.trim() || undefined);
    setIsSaving(false);

    if (success) {
      setMaintenance(targetMaintenance);
      setAnnouncementEnabled(targetAnnouncementEnabled);
      if (newPassword.trim()) {
        localStorage.setItem('kgs_admin_pass', newPassword.trim());
        setNewPassword('');
      }
      setSaveSuccess('⚡ Broadcasted LIVE to ALL visitors instantly!');
      setTimeout(() => setSaveSuccess(null), 3500);
    } else {
      setLoginError('Failed to broadcast to server. Please retry.');
      setTimeout(() => setLoginError(null), 3500);
    }
  };

  const applyTemplate = (badge: string, title: string, message: string) => {
    setAnnouncementBadge(badge);
    setAnnouncementTitle(title);
    setAnnouncementMsg(message);
    setAnnouncementEnabled(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight text-white">
                  Real-Time Broadcast Manager
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  LIVE SSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instant sub-second sync across all visitor devices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Login Form if not authenticated */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="text-center space-y-1 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Admin Security Verification</h4>
              <p className="text-xs text-slate-400">Enter master passcode to unlock live controller</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Passcode (Default: <code className="text-amber-400 font-mono">khushi</code>)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="khushi"
                  className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying...' : 'Unlock Manager'}
            </button>
          </form>
        ) : (
          /* 2. Authenticated Dashboard with all controls */
          <div className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold shadow-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* A. Maintenance Mode Live Controller */}
            <div className={`p-4 rounded-2xl border transition-all ${
              maintenance 
                ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.2)]' 
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className={`w-4 h-4 ${maintenance ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-black text-white block">Under Maintenance Mode</span>
                    <span className={`text-[10px] font-bold ${maintenance ? 'text-red-400' : 'text-emerald-400'}`}>
                      {maintenance ? '🔴 ACTIVE — SITE LOCKED FOR ALL VISITORS' : '🟢 INACTIVE — SITE FULLY OPEN'}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="mt-3 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Maintenance Message Shown to Visitors:
                </label>
                <textarea
                  rows={2}
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  placeholder="Enter maintenance message for visitors..."
                  className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                ></textarea>

                {/* Instant 1-Click Action Buttons for Maintenance */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => executeBroadcast(true, announcementEnabled)}
                    disabled={isSaving}
                    className={`py-2 px-3 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      maintenance 
                        ? 'bg-red-600/30 text-red-300 border border-red-500/40' 
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Lock Site (Turn ON)
                  </button>

                  <button
                    type="button"
                    onClick={() => executeBroadcast(false, announcementEnabled)}
                    disabled={isSaving}
                    className={`py-2 px-3 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !maintenance 
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Make Live (Turn OFF)
                  </button>
                </div>
              </div>
            </div>

            {/* B. Screen-Center Announcement Live Controller */}
            <div className={`p-4 rounded-2xl border transition-all ${
              announcementEnabled 
                ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]' 
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className={`w-4 h-4 ${announcementEnabled ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-black text-white block">Screen-Center Announcement Popup</span>
                    <span className={`text-[10px] font-bold ${announcementEnabled ? 'text-amber-400' : 'text-slate-400'}`}>
                      {announcementEnabled ? '📢 ACTIVE — POPUP SHOWS FOR ALL VISITORS' : '⚪ INACTIVE'}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Quick Template Clickers */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Quick Message Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate('URGENT NOTICE', 'Class Schedule Update 📢', 'Khan Sir live batch lecture will start today at 4:00 PM. Check Telegram for notes.')}
                    className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
                  >
                    ⚡ Class Update
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('TELEGRAM COMMUNITY', 'Official Telegram Channel 📢', 'All KGS official batch PDFs and chapter notes are uploaded in our official Telegram channel.')}
                    className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
                  >
                    📚 Telegram Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('EXAM SPECIAL', 'BPSC & UPSC Test Series Active', 'New official mock tests are now available in the Tests tab. Start practicing now!')}
                    className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
                  >
                    🎯 Test Series
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={announcementBadge}
                      onChange={(e) => setAnnouncementBadge(e.target.value)}
                      placeholder="e.g. URGENT ALERT"
                      className="w-full bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Popup Title</label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="Announcement Title"
                      className="w-full bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Popup Message</label>
                  <textarea
                    rows={2}
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    placeholder="Enter announcement text to display in center screen popup..."
                    className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  ></textarea>
                </div>

                {/* Instant 1-Click Action Buttons for Announcement */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => executeBroadcast(maintenance, true, true)}
                    disabled={isSaving}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Force Pop Up to All Now
                  </button>

                  <button
                    type="button"
                    onClick={() => executeBroadcast(maintenance, false)}
                    disabled={isSaving}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Turn Off Everywhere
                  </button>
                </div>
              </div>
            </div>

            {/* C. Telegram Join Link Controller */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Mandatory Telegram Join URL</span>
              </div>
              <input
                type="text"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder="https://t.me/+..."
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* D. Change Password */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Change Master Passcode</span>
              </div>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new passcode (leave blank to keep current)"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Master Save & Real-Time Broadcast Button */}
            <div className="pt-2">
              <button
                onClick={() => executeBroadcast(maintenance, announcementEnabled)}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? '⚡ Broadcasting to All Visitors...' : '⚡ Save & Broadcast Live to All Visitors'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Signature */}
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
