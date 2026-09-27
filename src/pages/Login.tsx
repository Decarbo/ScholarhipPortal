// Login Page - Frontend-only, role-based demo accounts
// FIX: explicit deferred navigate() after login so redirect happens without refresh
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui";
import {
  useAuthStore,
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

  return (
    <div className='min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-sm'>
        {/* Logo & Header */}
        <div className='mb-8'>
          <div className='w-8 h-8 bg-teal-600 flex items-center justify-center mb-4'>
            <span className='text-white font-semibold text-xs'>MoTA</span>
          </div>
          <h1 className='text-xl font-medium text-slate-900 dark:text-slate-100'>
            {t('title')}
          </h1>
          <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
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
            <div className='flex border-b border-slate-200 dark:border-slate-700'>
              {roles.map((role) => (
                <button
                  key={role.value}
                  type='button'
                  onClick={() => {
                    setSelectedRole(role.value);
                    setLocalError("");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors -mb-px ${
                    selectedRole === role.value
                      ? "border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400 font-medium"
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
          <div className='rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden'>
            <button
              type='button'
              onClick={() => setShowAccounts((v) => !v)}
              className='w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
            >
              <span>
                👤 {t('demoAccounts', { role: selectedRole, count: accountsForRole.length })}
              </span>
              <span className='text-slate-400'>{showAccounts ? "▾" : "▸"}</span>
            </button>
            {showAccounts && (
              <div className='divide-y divide-slate-200 dark:divide-slate-700'>
                {accountsForRole.map((acc) => (
                  <button
                    key={acc.id}
                    type='button'
                    onClick={() => fillAccount(acc)}
                    className='w-full text-left px-3 py-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors'
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
                      <span className='text-[10px] text-teal-600 dark:text-teal-400 shrink-0'>
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
                className='w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none'
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
                className='w-full pl-9 pr-10 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none'
              />
              <button
                type='button'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
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
              className='rounded text-teal-600 focus:ring-teal-500'
            />
            {t('rememberEmail')}
          </label>

          {/* Error */}
          {shownError && (
            <div className='p-3 rounded border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex items-start gap-2'>
              <AlertTriangle
                size={14}
                className='text-red-600 shrink-0 mt-0.5'
              />
              <p className='text-sm text-red-700 dark:text-red-300'>
                {shownError}
              </p>
            </div>
          )}

          {/* Lock warning */}
          {lockRemaining > 0 && (
            <div className='p-3 rounded border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 flex items-center gap-2'>
              <Lock size={14} className='text-amber-600' />
              <p className='text-sm text-amber-700 dark:text-amber-300'>
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

          <p className='text-xs text-slate-500 text-center flex items-center justify-center gap-1'>
            <CheckCircle2 size={12} className='text-teal-500' />
            {tc('common.frontendDemo')}
          </p>

          {selectedRole === "student" && (
            <p className='text-xs text-slate-500 text-center pt-2'>
              {t('newStudent')}{" "}
              <button
                type='button'
                onClick={() => navigate("/register")}
                className='text-teal-600 dark:text-teal-400 font-medium hover:underline'
              >
                {tc('actions.createAccount')}
              </button>
            </p>
          )}
        </form>

        {/* Footer */}
        <div className='mt-8 pt-6 border-t border-slate-200 dark:border-slate-700'>
          <p className='text-xs text-slate-400 text-center'>
            {tc('common.nationalPortal')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
