import React, { useState } from 'react';
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
  EyeOff
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
  const [maintenanceMsg, setMaintenanceMsg] = useState<string>(config.maintenanceMessage);
  
  const [announcementEnabled, setAnnouncementEnabled] = useState<boolean>(config.announcement?.enabled || false);
  const [announcementTitle, setAnnouncementTitle] = useState<string>(config.announcement?.title || '');
  const [announcementMsg, setAnnouncementMsg] = useState<string>(config.announcement?.message || '');
  const [announcementBadge, setAnnouncementBadge] = useState<string>(config.announcement?.badge || 'URGENT NOTICE');

  const [telegramLink, setTelegramLink] = useState<string>(config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1');
  const [newPassword, setNewPassword] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        if (data.config) {
          setMaintenance(data.config.maintenanceMode);
          setMaintenanceMsg(data.config.maintenanceMessage);
          setAnnouncementEnabled(data.config.announcement?.enabled || false);
          setAnnouncementTitle(data.config.announcement?.title || '');
          setAnnouncementMsg(data.config.announcement?.message || '');
          setAnnouncementBadge(data.config.announcement?.badge || 'URGENT NOTICE');
          setTelegramLink(data.config.telegramUrl);
        }
      } else {
        setLoginError(data.message || 'Incorrect passcode!');
      }
    } catch {
      const localPass = localStorage.getItem('kgs_admin_pass') || 'khushi';
      if (passwordInput.trim() === localPass) {
        setIsAuthenticated(true);
      } else {
        setLoginError('Incorrect passcode!');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);

    const updates = {
      maintenanceMode: maintenance,
      maintenanceMessage: maintenanceMsg,
      announcement: {
        enabled: announcementEnabled,
        id: Date.now().toString(),
        title: announcementTitle,
        message: announcementMsg,
        badge: announcementBadge
      },
      telegramUrl: telegramLink
    };

    const success = await onSaveConfig(updates, newPassword.trim() || undefined);
    setIsSaving(false);

    if (success) {
      if (newPassword.trim()) {
        localStorage.setItem('kgs_admin_pass', newPassword.trim());
      }
      setSaveSuccess('Configuration broadcasted live to all users!');
      setNewPassword('');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
        {/* Header - Not explicitly named "Admin Panel" */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                Core System Manager
              </h3>
              <p className="text-[10px] text-slate-400">
                Secure Remote Controller
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
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Security Verification Required</h4>
              <p className="text-xs text-slate-400">Enter master passcode to unlock management</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secret Passcode *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-mono tracking-widest"
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
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* A. Maintenance Mode Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Maintenance Mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                When turned on, the site will instantly lock for all visitors with maintenance screen.
              </p>
              {maintenance && (
                <textarea
                  rows={2}
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  placeholder="Enter maintenance message..."
                  className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                ></textarea>
              )}
            </div>

            {/* B. Screen-Center Animated Announcement Popup */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Screen-Center Announcement Popup</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                When activated, every visitor gets an animated popup right in the middle of their screen.
              </p>

              {announcementEnabled && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={announcementBadge}
                    onChange={(e) => setAnnouncementBadge(e.target.value)}
                    placeholder="Badge (e.g. URGENT ALERT)"
                    className="w-full bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Announcement Title"
                    className="w-full bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                  <textarea
                    rows={2}
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    placeholder="Announcement message..."
                    className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  ></textarea>
                </div>
              )}
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
                <span className="text-xs font-bold text-white">Set New Passcode</span>
              </div>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new passcode (leave blank to keep current)"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-mono"
              />
              <p className="text-[10px] text-slate-500">
                Updating passcode will take effect immediately for future logins.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Broadcasting...' : 'Save & Broadcast Live to All Users'}</span>
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
