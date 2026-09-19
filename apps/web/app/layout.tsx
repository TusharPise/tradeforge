import type { Metadata } from 'next';
import './globals.css';
import { AppQueryProvider } from '../providers/query-provider';

export const metadata: Metadata = {
  title: 'TradeForge | Production-Grade Paper Trading & Personal Finance',
  description:
    'Institutional-style paper trading simulator, multi-asset portfolio tracker, and personal finance ledger engine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
