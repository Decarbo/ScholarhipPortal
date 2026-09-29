// Login Page - Frontend-only, role-based demo accounts
// FIX: explicit deferred navigate() after login so redirect happens without refresh
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, LanguageSelector } from "../components/ui";
import {
  useAuthStore,
  useAppStore,
  DEMO_ACCOUNTS,
  type UserRole,
  type DemoAccount,
} from "../store";
import {
  GraduationCap,
  Shield,
  Building2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Lock,
  User,
  Moon,
  Sun,
} from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');

  // Zustand selectors — component re-renders on each change
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const lockRemaining = useAuthStore((s) => s.lockRemaining);
  const tickLock = useAuthStore((s) => s.tickLock);

  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [localError, setLocalError] = useState("");

  const roles: {
    value: UserRole;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      value: "student",
      label: t('roles.student'),
      icon: <GraduationCap size={18} />,
      desc: t('roleDesc.student'),
    },
    {
      value: "admin",
      label: t('roles.admin'),
      icon: <Shield size={18} />,
      desc: t('roleDesc.admin'),
    },
    {
      value: "government",
      label: t('roles.government'),
      icon: <Building2 size={18} />,
      desc: t('roleDesc.government'),
    },
  ];

  /* ---------- On mount: restore remembered email ---------- */
  useEffect(() => {
    const remembered = localStorage.getItem("auth_remember_email_v1");
    if (remembered) {
      setEmail(remembered);
      setRemember(true);
    }
  }, []);

  /* ---------- Lock countdown tick ---------- */
  useEffect(() => {
    if (lockRemaining <= 0) return;
    const t = setInterval(() => tickLock(), 1000);
    return () => clearInterval(t);
  }, [lockRemaining, tickLock]);

  /* ---------- Login handler ---------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      await login(selectedRole, email, password);

      if (remember) localStorage.setItem("auth_remember_email_v1", email);
      else localStorage.removeItem("auth_remember_email_v1");

      const home =
        selectedRole === "admin"
          ? "/admin"
          : selectedRole === "government"
            ? "/government"
            : "/student";

      // 🔑 KEY FIX: defer navigation by one tick so the store update
      // commits to the React tree before we navigate. Without this,
      // the router misses the state change and the user only sees
      // the redirect after a manual refresh.
      setTimeout(() => {
        navigate(home, { replace: true });
      }, 0);
    } catch (err: any) {
      setLocalError(err?.message || "Login failed");
    }
  };

  /* ---------- Quick-fill a demo account ---------- */
  const fillAccount = (acc: DemoAccount) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setLocalError("");
    setShowAccounts(false);
  };

  const accountsForRole = DEMO_ACCOUNTS.filter((a) => a.role === selectedRole);
  const shownError = localError || error || "";

  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <div className='relative min-h-screen bg-[#F8F8F8] dark:bg-slate-900 flex items-center justify-center p-4 transition-colors'>
      {/* Top Controls: Language Change & Theme */}
      <div className='absolute top-4 right-4 flex items-center gap-2 z-20'>
        <LanguageSelector />
        <button
          type='button'
          onClick={toggleTheme}
          className='p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-[#DEE2E6] dark:border-slate-700 rounded-lg shadow-xs transition-colors text-slate-600 dark:text-amber-400 cursor-pointer'
          aria-label={tc('theme.toggle')}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>

      <div className='w-full max-w-sm'>
        {/* Logo & Header */}
        <div className='mb-8 text-center'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#024969] via-[#056C9A] to-[#0B75A4] text-white shadow-md shadow-[#0B75A4]/25 mb-3'>
            <GraduationCap size={26} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-[#024969] dark:text-white">UDAAN</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#0B75A4]/10 dark:bg-[#0B75A4]/25 text-[#056C9A] dark:text-[#1697C5] rounded tracking-wider border border-[#0B75A4]/20">MoTA</span>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-[#0B75A4] dark:text-[#1697C5] uppercase mt-0.5">SCHOLAR PORTAL</span>
          </div>
          <h1 className='text-lg font-semibold text-slate-800 dark:text-slate-100'>
            {t('title')}
          </h1>
          <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
            {tc('ministry')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className='space-y-5'>
          {/* Role tabs */}
          <div>
            <label className='block text-sm text-slate-700 dark:text-slate-300 mb-2'>
              {t('signInAs')}
            </label>
            <div className='flex border-b border-[#DEE2E6] dark:border-slate-700'>
              {roles.map((role) => (
                <button
                  key={role.value}
                  type='button'
                  onClick={() => {
                    setSelectedRole(role.value);
                    setLocalError("");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors -mb-px cursor-pointer ${
                    selectedRole === role.value
                      ? "border-[#0B75A4] text-[#0B75A4] dark:border-[#1697C5] dark:text-[#1697C5] font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {role.icon}
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
            <p className='text-xs text-slate-500 mt-2'>
              {roles.find((r) => r.value === selectedRole)?.desc}
            </p>
          </div>

          {/* Demo accounts picker */}
          <div className='rounded-lg border border-[#DEE2E6] dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800'>
            <button
              type='button'
              onClick={() => setShowAccounts((v) => !v)}
              className='w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 dark:text-slate-300 bg-[#F8F8F8] dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
            >
              <span>
                👤 {t('demoAccounts', { role: selectedRole, count: accountsForRole.length })}
              </span>
              <span className='text-slate-400'>{showAccounts ? "▾" : "▸"}</span>
            </button>
            {showAccounts && (
              <div className='divide-y divide-[#DEE2E6] dark:divide-slate-700'>
                {accountsForRole.map((acc) => (
                  <button
                    key={acc.id}
                    type='button'
                    onClick={() => fillAccount(acc)}
                    className='w-full text-left px-3 py-2 hover:bg-[#0B75A4]/10 dark:hover:bg-[#0B75A4]/20 transition-colors cursor-pointer'
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div className='min-w-0'>
                        <p className='text-xs font-medium text-slate-800 dark:text-slate-200 truncate'>
                          {acc.name}
                        </p>
                        <p className='text-[11px] text-slate-500 truncate'>
                          {acc.email}
                        </p>
                        {(acc.state || acc.designation) && (
                          <p className='text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate'>
                            {acc.state && (
                              <>
                                <MapPin size={9} />{" "}
                                {acc.district ? `${acc.district}, ` : ""}
                                {acc.state}
                              </>
                            )}
                            {!acc.state && acc.designation && (
                              <span>{acc.designation}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <span className='text-[10px] text-[#0B75A4] dark:text-[#1697C5] font-semibold shrink-0'>
                        {t('use')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor='email'
              className='block text-sm text-slate-700 dark:text-slate-300 mb-1'
            >
              {t('email')}
            </label>
            <div className='relative'>
              <User
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
              />
              <input
                id='email'
                type='email'
                autoComplete='username'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className='w-full pl-9 pr-3 py-2 border border-[#DEE2E6] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-[#0B75A4]/40 focus:border-[#0B75A4] outline-none transition-all'
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor='password'
              className='block text-sm text-slate-700 dark:text-slate-300 mb-1'
            >
              {t('password')}
            </label>
            <div className='relative'>
              <Lock
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
              />
              <input
                id='password'
                type={showPassword ? "text" : "password"}
                autoComplete='current-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className='w-full pl-9 pr-10 py-2 border border-[#DEE2E6] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-[#0B75A4]/40 focus:border-[#0B75A4] outline-none transition-all'
              />
              <button
                type='button'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer'
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none'>
            <input
              type='checkbox'
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className='rounded text-[#0B75A4] focus:ring-[#0B75A4]'
            />
            {t('rememberEmail')}
          </label>

          {/* Error */}
          {shownError && (
            <div className='p-3 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/10 dark:bg-[#EF4444]/20 dark:border-[#EF4444]/30 flex items-start gap-2'>
              <AlertTriangle
                size={16}
                className='text-[#EF4444] shrink-0 mt-0.5'
              />
              <p className='text-xs font-medium text-[#EF4444] dark:text-red-400'>
                {shownError}
              </p>
            </div>
          )}

          {/* Lock warning */}
          {lockRemaining > 0 && (
            <div className='p-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 dark:border-[#F59E0B]/40 flex items-center gap-2'>
              <Lock size={16} className='text-[#F59E0B]' />
              <p className='text-xs font-medium text-[#B45309] dark:text-[#FCD34D]'>
                {t('locked', { seconds: lockRemaining })}
              </p>
            </div>
          )}

          <Button
            type='submit'
            className='w-full'
            loading={loading}
            disabled={lockRemaining > 0}
          >
            {loading ? tc('actions.signingIn') : tc('actions.signIn')}
          </Button>

          <p className='text-xs text-[#64748B] dark:text-slate-400 text-center flex items-center justify-center gap-1.5'>
            <CheckCircle2 size={13} className='text-[#009B68]' />
            {tc('common.frontendDemo')}
          </p>

          {selectedRole === "student" && (
            <p className='text-xs text-slate-500 text-center pt-2'>
              {t('newStudent')}{" "}
              <button
                type='button'
                onClick={() => navigate("/register")}
                className='text-[#0B75A4] dark:text-[#1697C5] font-semibold hover:underline cursor-pointer'
              >
                {tc('actions.createAccount')}
              </button>
            </p>
          )}
        </form>

        {/* Footer */}
        <div className='mt-8 pt-6 border-t border-[#DEE2E6] dark:border-slate-700'>
          <p className='text-xs text-slate-400 text-center'>
            {tc('common.nationalPortal')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
