'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginDto } from '@tradeforge/validation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setError(null);
      const res = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      Cookies.set('token', res.accessToken, { secure: true, sameSite: 'strict' });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px] animate-float-delay"></div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-white text-sm">TF</span>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            TradeForge
          </span>
        </div>

        <Card className="w-full border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-100">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to access your terminal</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="trader@example.com" className="border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500/50 focus:ring-emerald-500/20" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500/50 focus:ring-emerald-500/20" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                {error && <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">{error}</div>}
                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.97] transition-all">
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Button variant="link" className="text-emerald-400 p-0 hover:text-emerald-300" onClick={() => router.push('/register')}>
                Create one
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
