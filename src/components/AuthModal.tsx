import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

export const AuthModal: React.FC = () => {
  const { language, isAuthModalOpen, setIsAuthModalOpen, login } = useApp();

  const [mode, setMode] = useState<AuthMode>('login');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [dietaryInput, setDietaryInput] = useState('Balanced & Halal');
  const [calorieGoalInput, setCalorieGoalInput] = useState<number>(2000);

  // Password reset states
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [issuedResetCode, setIssuedResetCode] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAuthModalOpen, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setStatusMessage(null);
    setResetStep('request');
    setIssuedResetCode(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      login(data.user, data.token);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (passwordInput.length < 6) {
      setError(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.trim(),
          email: emailInput.trim(),
          password: passwordInput,
          dietaryPreference: dietaryInput,
          dailyCalorieGoal: calorieGoalInput,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not create account.');
      }
      login(data.user, data.token);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate reset code.');
      }
      setIssuedResetCode(data.resetCode || null);
      setResetCodeInput(data.resetCode || '');
      setResetStep('confirm');
      setStatusMessage(data.message || 'Verification code generated.');
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          code: resetCodeInput.trim(),
          newPassword: newPasswordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }
      setStatusMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড পরিবর্তন হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
          : 'Password updated! You can now sign in with your new password.'
      );
      setPasswordInput('');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-emerald-950/10 space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            {mode === 'reset' ? (
              <KeyRound className="w-5 h-5 text-emerald-700" />
            ) : (
              <Lock className="w-5 h-5 text-emerald-700" />
            )}
          </div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">
            {mode === 'login' && (language === 'bn' ? 'AaharIQ-তে সাইন ইন' : 'Sign in to AaharIQ')}
            {mode === 'signup' && (language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি' : 'Create AaharIQ Account')}
            {mode === 'reset' && (language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Password')}
          </h2>
          <p className="text-xs text-stone-500">
            {language === 'bn'
              ? 'আপনার খাদ্য জার্নাল, সংরক্ষিত তুলনা ও পুষ্টি লক্ষ্য নিরাপদে সংরক্ষণ করুন।'
              : 'Persist your Food Journal, saved comparisons, and calorie goals privately across sessions.'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'login' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'bn' ? 'সাইন ইন' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'signup' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'bn' ? 'নিবন্ধন' : 'Sign Up'}
          </button>
          <button
            type="button"
            onClick={() => switchMode('reset')}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'reset' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'bn' ? 'রিসেট' : 'Reset'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? (language === 'bn' ? 'অপেক্ষা করুন...' : 'Signing in...') : (language === 'bn' ? 'লগইন করুন' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Dr. Ayesha Rahman"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min 6 chars)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? 'দৈনিক ক্যালোরি লক্ষ্য' : 'Calorie Goal'}
                </label>
                <input
                  type="number"
                  min={1200}
                  max={4500}
                  step={50}
                  value={calorieGoalInput}
                  onChange={(e) => setCalorieGoalInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-num"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? 'খাদ্যাভ্যাস' : 'Diet Style'}
                </label>
                <select
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                >
                  <option value="Balanced & Halal">Balanced & Halal</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="High Protein">High Protein</option>
                  <option value="Diabetes-Conscious">Diabetes-Conscious</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? (language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating account...') : (language === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Create Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* PASSWORD RESET FORM */}
        {mode === 'reset' && (
          resetStep === 'request' ? (
            <form onSubmit={handleResetRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? 'নিবন্ধিত ইমেইল দিন' : 'Registered Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating Code...' : (language === 'bn' ? 'রিসেট কোড পাঠান' : 'Generate Reset Code')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetConfirm} className="space-y-3 text-xs">
              {issuedResetCode && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                  {language === 'bn' ? 'ইন-অ্যাপ ভেরিফিকেশন কোড:' : 'In-App Sandbox Reset Code:'}{' '}
                  <strong className="font-mono-num">{issuedResetCode}</strong>
                </div>
              )}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? '৬-সংখ্যার রিসেট কোড' : '6-Digit Reset Code'}
                </label>
                <input
                  type="text"
                  required
                  value={resetCodeInput}
                  onChange={(e) => setResetCodeInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono-num"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1B4332] hover:bg-[#255C45] text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : (language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Confirm New Password')}
              </button>
            </form>
          )
        )}

        <div className="pt-2 text-center text-[11px] text-stone-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {language === 'bn'
              ? 'গেস্ট মোডেও সকল খাদ্য ও পুষ্টি টুলস বিনামূল্যে ব্যবহারযোগ্য'
              : 'Scrypt-hashed credentials · Guest workspace also available'}
          </span>
        </div>
      </div>
    </div>
  );
};
