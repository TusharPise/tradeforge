import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-40"></div>

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-float-delay"></div>
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-indigo-500/8 rounded-full blur-[80px] animate-float-slow"></div>

      <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        
        {/* Logo Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
          <span className="font-black text-white text-4xl tracking-tighter">TF</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
          Master the Markets.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">Zero Risk.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          The most advanced paper-trading and portfolio simulator. Build strategies, track performance, and manage your finances — all with mathematically precise simulations.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-lg rounded-xl transition-all shadow-xl shadow-emerald-500/25 active:scale-[0.97] hover:shadow-emerald-500/40"
          >
            Start Trading Now
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-lg rounded-xl transition-all active:scale-[0.97] backdrop-blur-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-200 mb-1">Paper Trading</h3>
            <p className="text-sm text-slate-500">Execute trades with real-time simulated prices. No real money at risk.</p>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:bg-cyan-500/20 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-200 mb-1">Live Analytics</h3>
            <p className="text-sm text-slate-500">Equity curves, asset allocation, win rates — all in real time.</p>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-200 mb-1">Bank Integration</h3>
            <p className="text-sm text-slate-500">Link multiple banks and manage isolated trading workspaces.</p>
          </div>
        </div>

        <div className="pt-12 text-slate-600 text-xs font-medium tracking-wider uppercase">
          Built with Next.js 15 · NestJS · PostgreSQL
        </div>
      </div>
    </div>
  );
}
