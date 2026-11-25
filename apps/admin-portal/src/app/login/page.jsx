'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { AlertCircle, Loader2, Shield } from '@/components/icons';

function LoginContent() {
  const { initiateGoogleSignIn, currentUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const lower = errorParam.toLowerCase();
      if (
        lower.includes('not_found') ||
        lower.includes('not found') ||
        lower.includes('not_registered') ||
        lower.includes('unregistered')
      ) {
        setErrorMessage('Email not registered. Please contact the administrator.');
      } else if (
        lower.includes('forbidden') ||
        lower.includes('domain') ||
        lower.includes('access_denied')
      ) {
        setErrorMessage('Access denied. Your account is not authorized or suspended.');
      } else {
        setErrorMessage('Sign-in failed. Please try again.');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      if (currentUser?.role === 'member' || currentUser?.role === 'Member') {
        router.replace('/profile');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [currentUser, isAuthenticated, isLoading, router]);

  const handleContinueWithGoogle = async () => {
    try {
      setIsRedirecting(true);
      setErrorMessage('');
      await initiateGoogleSignIn();
    } catch (err) {
      console.error('Google Sign-in error:', err);
      setErrorMessage('Unable to start Google sign-in. Please try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col justify-center items-center p-4 antialiased font-sans relative overflow-hidden">
      {/* Subtle institutional background accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#1E3A8A]/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[400px] space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/60 overflow-hidden">
          {/* Top Institutional Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#2563EB]" />

          <div className="p-8 sm:p-9 space-y-6 text-center">
            {/* Logo & Title */}
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 flex items-center justify-center p-2 shadow-sm">
                <Image
                  src="/ic_logo.webp"
                  alt="Incubation Center NIT Patna"
                  width={68}
                  height={68}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-[#1E40AF] tracking-[0.14em] uppercase">
                  Admin Portal
                </p>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  Incubation Center
                </h1>
                <p className="text-[13px] font-medium text-slate-500">
                  National Institute of Technology Patna
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-left text-xs text-rose-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-snug font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Sign-in Action */}
            <div className="space-y-3.5">
              <p className="text-xs font-medium text-slate-500">
                Sign in with your registered Google account
              </p>
              <button
                type="button"
                disabled={isRedirecting || isLoading}
                onClick={handleContinueWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] text-slate-800 font-semibold text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/25"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1E40AF]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>Authorized personnel only</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] font-medium text-slate-500">
          © {new Date().getFullYear()} National Institute of Technology Patna
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E40AF]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
