'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmailVerificationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleBypass = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/verify-email');
      onClose();
      window.location.reload(); // Hard reload to refresh the state in the layout
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl text-white">Check your email</CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            We've sent a verification link to your email address. Please verify your email to unlock trading, deposits, and full dashboard access.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" className="w-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700">
            Resend Email
          </Button>
          <Button variant="link" className="text-zinc-400" onClick={() => {
            document.cookie = 'token=; Max-Age=0; path=/';
            window.location.href = '/login';
          }}>
            Sign Out
          </Button>
        </CardContent>
        <CardFooter className="flex-col pt-6 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-xs text-zinc-500 text-center mb-3">
            <strong>Demo Mode:</strong> Since you might be testing with a fake email, you can use the developer bypass below.
          </p>
          <Button 
            onClick={handleBypass} 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? 'Verifying...' : 'Developer Bypass: Auto-Verify'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
