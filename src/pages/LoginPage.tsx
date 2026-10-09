import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Mail,
  Lock,
  User,
  LogIn,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { api, DEMO_ACCOUNTS } from '../lib/api';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile, message: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(DEMO_ACCOUNTS.admin.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.admin.password);
  const [displayName, setDisplayName] = useState('Kavindu Senanayake');
  const [gradeOrDepartment, setGradeOrDepartment] = useState('Grade 12-B (Physical Science)');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuthSubmit = async (targetEmail: string, targetPassword: string, forceSignIn = false) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let profile: UserProfile;
      if (mode === 'signup' && !forceSignIn) {
        profile = await api.signUp({
          email: targetEmail,
          password: targetPassword,
          displayName,
          gradeOrDepartment,
        });
      } else {
        profile = await api.signIn(targetEmail, targetPassword);
      }

      onLoginSuccess(
        profile,
        `Signed in as ${profile.displayName} (${profile.isAdmin ? 'Admin' : 'Student'})`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const fillAndLoginDemo = (type: 'admin' | 'student') => {
    const acct = DEMO_ACCOUNTS[type];
    setMode('signin');
    setEmail(acct.email);
    setPassword(acct.password);
    handleAuthSubmit(acct.email, acct.password, true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Sign In / Register Form */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A1224] dark:text-amber-400">
                Ananda College · AC Synapse Portal
              </p>
              <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {mode === 'signin' ? 'Sign In to Your Account' : 'Create Student / Parent Account'}
              </h1>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-stone-100 dark:bg-stone-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAuthSubmit(email, password, false);
            }}
            className="space-y-4"
          >
            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Grade / Section</label>
                  <input
                    type="text"
                    required
                    value={gradeOrDepartment}
                    onChange={(e) => setGradeOrDepartment(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] py-2.5 px-5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] disabled:opacity-50 text-amber-200 dark:bg-amber-400 dark:text-stone-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {loading
                  ? 'Signing In...'
                  : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account & Sign In'}
              </span>
            </button>
          </form>
        </div>

        {/* Right 5 Columns: Small "Demo accounts" Box */}
        <aside
          aria-labelledby="demo-accounts-heading"
          className="lg:col-span-5 rounded-2xl bg-[#7A1224]/6 dark:bg-stone-900 border border-[#7A1224]/25 dark:border-amber-400/25 p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#7A1224] dark:text-amber-400" />
            <h2
              id="demo-accounts-heading"
              className="font-display text-lg font-bold text-stone-900 dark:text-stone-100"
            >
              Demo Accounts
            </h2>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Use these pre-configured Ananda College credentials to test role-based access. Accounts
            with the <code className="font-mono font-bold">isAdmin</code> profile flag unlock the
            Admin Command Dashboard.
          </p>

          {/* Demo Admin Box */}
          <div className="rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1224] dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Demo Admin Account</span>
              </span>
              <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#7A1224]/10 text-[#7A1224] dark:bg-amber-400/15 dark:text-amber-300">
                isAdmin: true
              </span>
            </div>
            <div className="text-xs font-mono space-y-1 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900 p-2.5 rounded-lg">
              <div>
                <span className="text-stone-400">Email: </span>
                <span className="font-semibold select-all">{DEMO_ACCOUNTS.admin.email}</span>
              </div>
              <div>
                <span className="text-stone-400">Password: </span>
                <span className="font-semibold select-all">{DEMO_ACCOUNTS.admin.password}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => fillAndLoginDemo('admin')}
              className="w-full min-h-[38px] py-2 px-3 rounded-lg bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold cursor-pointer"
            >
              Fill & Sign In as Demo Admin
            </button>
          </div>

          {/* Demo Student Box */}
          <div className="rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Demo Student Account</span>
              </span>
              <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                isAdmin: false
              </span>
            </div>
            <div className="text-xs font-mono space-y-1 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900 p-2.5 rounded-lg">
              <div>
                <span className="text-stone-400">Email: </span>
                <span className="font-semibold select-all">{DEMO_ACCOUNTS.student.email}</span>
              </div>
              <div>
                <span className="text-stone-400">Password: </span>
                <span className="font-semibold select-all">{DEMO_ACCOUNTS.student.password}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => fillAndLoginDemo('student')}
              className="w-full min-h-[38px] py-2 px-3 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold cursor-pointer"
            >
              Fill & Sign In as Demo Student
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
