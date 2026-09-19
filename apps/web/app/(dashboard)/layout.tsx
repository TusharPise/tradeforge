'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import TickerTape from '@/components/market/TickerTape';
import NotificationBell from '@/components/notification/NotificationBell';
import EmailVerificationModal from '@/components/auth/EmailVerificationModal';
import { LinkBankModal } from '@/components/finance/LinkBankModal';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Quick client-side check if we have a token
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      window.location.href = '/login';
    } else {
      setIsAuthenticated(true);
      // Fetch user profile to check verification status
      apiClient.get('/auth/me').then((data) => {
        setUser(data);
      }).catch(() => {
        // Token might be invalid
        document.cookie = 'token=; Max-Age=0; path=/';
        window.location.href = '/login';
      });
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading vault...</div>;
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <TickerTape />
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-bold text-white text-sm">TF</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              TradeForge
            </span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link 
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/markets"
              className={`text-sm font-medium transition-colors ${pathname === '/markets' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}
            >
              Markets
            </Link>
            <Link 
              href="/finance"
              className={`text-sm font-medium transition-colors ${pathname === '/finance' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}
            >
              Finance
            </Link>
            <Link 
              href="/profile"
              className={`text-sm font-medium transition-colors ${pathname === '/profile' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}
            >
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-4 w-px bg-slate-800" />
            <button 
              onClick={() => {
                document.cookie = 'token=; Max-Age=0; path=/';
                window.location.href = '/login';
              }}
              className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors hidden sm:block"
            >
              Sign Out
            </button>
            <button 
              onClick={() => {
                document.cookie = 'token=; Max-Age=0; path=/';
                window.location.href = '/login';
              }}
              className="sm:hidden text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-50 px-6 py-3 flex justify-between items-center pb-safe">
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/markets" className={`flex flex-col items-center gap-1 ${pathname === '/markets' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          <span className="text-[10px] font-medium">Markets</span>
        </Link>
        <Link href="/finance" className={`flex flex-col items-center gap-1 ${pathname === '/finance' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-medium">Finance</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
      
      {/* Verification Gating */}
      {user && (
        <EmailVerificationModal 
          isOpen={!user.isEmailVerified} 
          onClose={() => {
            setUser({ ...user, isEmailVerified: true });
          }} 
        />
      )}

      {/* Mandatory Bank Linking Gating */}
      {user && user.isEmailVerified && user._count?.linkedAccounts === 0 && (
        <LinkBankModal 
          isOpen={true} 
          isDismissible={false}
          onClose={() => {}}
          onSuccess={() => {
            setUser({ 
              ...user, 
              _count: { 
                ...user._count, 
                linkedAccounts: 1 
              } 
            });
          }}
        />
      )}
    </div>
    </ToastProvider>
  );
}
