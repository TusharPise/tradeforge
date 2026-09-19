'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LinkBankModal } from '@/components/finance/LinkBankModal';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const [isLinkBankOpen, setIsLinkBankOpen] = useState(false);
  
  // Bank Switching Overlay State
  const [isSwitchingBank, setIsSwitchingBank] = useState(false);
  const [targetBankName, setTargetBankName] = useState('');

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Profile data
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => await apiClient.get('/auth/me') as any
  });

  const { data: linkedAccounts } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: async () => await apiClient.get('/finance/linked-accounts') as any[]
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => await apiClient.get('/accounts') as any[]
  });

  // Persistent KYC Verification
  const kycMutation = useMutation({
    mutationFn: async () => await apiClient.post('/auth/kyc/verify'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Identity verified successfully! Tier 2 unlocked.', 'success');
    },
    onError: () => {
      showToast('Verification failed. Please try again.', 'error');
    },
  });

  const handleVerifyKyc = () => {
    // Simulate a scanning delay before hitting the real API
    kycMutation.mutate();
  };

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => await apiClient.post(`/finance/linked-accounts/${id}/default`),
    onSuccess: () => {
      window.location.reload();
    }
  });

  const handleSwitchBank = (bank: any) => {
    setIsSwitchingBank(true);
    setTargetBankName(bank.bankName);
    const randomDelay = Math.floor(Math.random() * (6000 - 4000 + 1) + 4000);
    setTimeout(() => {
      setDefaultMutation.mutate(bank.id);
    }, randomDelay);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20 max-w-5xl mx-auto">
      {/* Switching Bank Overlay */}
      {isSwitchingBank && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Connecting to {targetBankName}...</h2>
          <p className="text-slate-400 text-lg mb-8">Establishing secure connection to your financial institution.</p>
        </div>
      )}

      <LinkBankModal 
        isOpen={isLinkBankOpen} 
        onClose={() => setIsLinkBankOpen(false)}
        isDismissible={true}
        onSuccess={() => {
          showToast('Bank account linked successfully!', 'success');
          queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
        }}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Profile & Settings</h1>
        <p className="text-slate-400 mt-2">Manage your identity, security, and funding sources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identity & Security */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Personal Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl group">
            <div className="p-6 border-b border-slate-800 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-2xl group-hover:from-emerald-500/20 group-hover:to-cyan-500/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-500">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <h2 className="text-xl font-bold text-slate-100">{user?.firstName} {user?.lastName}</h2>
                <p className="text-slate-400 text-sm mb-1">{user?.email}</p>
                <p className="text-slate-500 text-xs mb-4">Member since {memberSince}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-full">
                    {user?.role || 'TRADER'}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                    ✓ Email Verified
                  </span>
                  {user?.isKycVerified && (
                    <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold rounded-full">
                      ✓ KYC Tier 2
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* KYC Section */}
            <div className="p-6 bg-slate-950/50">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Identity Verification</h3>
              {user?.isKycVerified ? (
                <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Identity Verified</p>
                    <p className="text-xs text-emerald-400/70">Tier 2 — Full trading access unlocked</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-400 mb-4">Required to lift trading limits and enable withdrawals over $10,000.</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Government-issued photo ID
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Proof of address (utility bill)
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Facial recognition scan
                    </div>
                  </div>
                  <button 
                    onClick={handleVerifyKyc}
                    disabled={kycMutation.isPending}
                    className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                  >
                    {kycMutation.isPending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scanning documents...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Verify Identity
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/30">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Security Settings</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors group/item cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover/item:bg-indigo-500/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 text-sm">Two-Factor Auth</p>
                    <p className="text-xs text-slate-500">Authenticator App</p>
                  </div>
                </div>
                <div 
                  className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner shadow-emerald-700/50 transition-all hover:shadow-emerald-500/40"
                  onClick={() => showToast('2FA settings are simulated in demo mode.', 'info')}
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transition-transform"></div>
                </div>
              </div>

              {/* Change Password */}
              <button 
                onClick={() => showToast('Password change is simulated in demo mode.', 'info')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] group/item cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover/item:bg-amber-500/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-200 text-sm">Change Password</p>
                    <p className="text-xs text-slate-500">Last changed 30 days ago</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-600 group-hover/item:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Active Sessions */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Current Session</p>
                    <p className="text-xs text-emerald-400 font-medium">Active now • localhost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Funding & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Funding Sources */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h3 className="text-lg font-bold text-slate-100">Funding Sources</h3>
              <button 
                onClick={() => setIsLinkBankOpen(true)}
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-4 py-2 rounded-lg transition-all duration-200 active:scale-[0.95] border border-emerald-500/20"
              >
                + Add Bank
              </button>
            </div>
            
            <div className="p-6">
              {(!linkedAccounts || linkedAccounts.length === 0) ? (
                <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="font-medium">No funding sources linked yet.</p>
                  <p className="text-sm mt-1">Add a bank to start trading.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedAccounts.map(acc => {
                    // Bank-specific gradient colors
                    const bankStyles: Record<string, { gradient: string; accent: string }> = {
                      'JPMorgan Chase': { gradient: 'from-blue-900 via-slate-900 to-blue-950', accent: 'bg-blue-400/10' },
                      'Goldman Sachs': { gradient: 'from-amber-900/80 via-slate-900 to-yellow-950', accent: 'bg-amber-400/10' },
                      'Bank of America': { gradient: 'from-red-900/70 via-slate-900 to-red-950', accent: 'bg-red-400/10' },
                      'Citibank': { gradient: 'from-sky-900/70 via-slate-900 to-sky-950', accent: 'bg-sky-400/10' },
                      'Wells Fargo': { gradient: 'from-red-900/60 via-slate-900 to-amber-950', accent: 'bg-red-400/10' },
                      'Morgan Stanley': { gradient: 'from-indigo-900/70 via-slate-900 to-indigo-950', accent: 'bg-indigo-400/10' },
                      'HSBC': { gradient: 'from-red-900/60 via-slate-900 to-slate-950', accent: 'bg-red-400/10' },
                      'Barclays': { gradient: 'from-cyan-900/70 via-slate-900 to-cyan-950', accent: 'bg-cyan-400/10' },
                    };
                    const style = bankStyles[acc.bankName] || { gradient: 'from-slate-800 to-slate-900', accent: 'bg-emerald-500/10' };

                    return (
                      <div key={acc.id} className={`relative p-5 rounded-xl border ${acc.isDefault ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-slate-700/50 hover:border-slate-600'} bg-gradient-to-br ${style.gradient} overflow-hidden group transition-all duration-300 hover:shadow-xl`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${style.accent} rounded-bl-full -mr-6 -mt-6 group-hover:opacity-80 transition-opacity duration-500`}></div>
                        
                        <div className="flex justify-between items-start mb-5 relative z-10">
                          {/* Chip icon */}
                          <svg className="w-10 h-8 text-yellow-400/70" viewBox="0 0 48 36" fill="none">
                            <rect x="1" y="1" width="46" height="34" rx="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15"/>
                            <line x1="1" y1="12" x2="47" y2="12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/>
                            <line x1="1" y1="24" x2="47" y2="24" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/>
                            <line x1="16" y1="1" x2="16" y2="35" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
                            <line x1="32" y1="1" x2="32" y2="35" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
                          </svg>
                          {acc.isDefault ? (
                            <span className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-slate-950 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              Active
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleSwitchBank(acc)}
                              disabled={isSwitchingBank}
                              className="px-3 py-1.5 text-xs font-bold bg-white/10 text-white/80 rounded-full hover:bg-emerald-500 hover:text-slate-950 transition-all duration-300 active:scale-[0.93] disabled:opacity-50 backdrop-blur-sm"
                            >
                              Switch
                            </button>
                          )}
                        </div>
                        <div className="relative z-10">
                          <p className="text-sm font-mono text-white/50 tracking-[0.25em] mb-4">•••• •••• •••• {acc.last4}</p>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-white/40 text-[10px] uppercase font-semibold tracking-wider mb-0.5">Card Holder</p>
                              <p className="text-sm font-bold text-white/90 tracking-wide">{acc.bankName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/40 text-[10px] uppercase font-semibold tracking-wider mb-0.5">Linked</p>
                              <p className="text-xs font-medium text-white/60">{new Date(acc.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity / Statements */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h3 className="text-lg font-bold text-slate-100">Statements & Activity</h3>
              <button 
                onClick={() => showToast('Tax document download is simulated.', 'info')}
                className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2 border border-slate-700 px-3 py-1.5 rounded-lg transition-all bg-slate-800 hover:bg-slate-700 active:scale-[0.96]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Tax Doc
              </button>
            </div>
            
            <div className="p-0">
              {accounts && accounts[0]?.transactions?.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {accounts[0].transactions.map((tx: any) => (
                    <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-default group/row">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover/row:scale-110 ${
                          tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' 
                          : tx.type === 'TRADE_BUY' ? 'bg-blue-500/10 text-blue-400'
                          : tx.type === 'TRADE_SELL' ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.type === 'DEPOSIT' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          ) : tx.type === 'TRADE_BUY' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          ) : tx.type === 'TRADE_SELL' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{tx.description || tx.type}</p>
                          <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`font-bold font-mono ${
                        tx.type === 'DEPOSIT' || tx.type === 'TRADE_SELL' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {tx.type === 'DEPOSIT' || tx.type === 'TRADE_SELL' ? '+' : '-'}${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center text-slate-500 flex flex-col items-center">
                  <svg className="w-12 h-12 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">No transaction history found.</p>
                  <p className="text-sm mt-1">Deposit funds or make trades to see activity.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
