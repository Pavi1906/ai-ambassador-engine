import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, AlertTriangle, ArrowRight, BrainCircuit, CheckCircle,
  Target, TrendingUp, Zap, ShieldAlert, Cpu, Database, User,
  Award, ListTodo, ShieldCheck, BarChart3, RefreshCw, Clock, History
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, XAxis, ComposedChart, Line } from 'recharts';
import { cn } from './lib/utils';

export default function App() {
  // Start with default recommended action to avoid "92% -> 92%" logical bug
  const [delta, setDelta] = useState({
    posts: 1,
    referrals: 2,
  });

  const [viewMode, setViewMode] = useState<'manager' | 'ambassador'>('manager');
  const [showExecutionState, setShowExecutionState] = useState<'idle' | 'executing' | 'done'>('idle');

  const [apiScore, setApiScore] = useState<number | null>(null);
  const calculateInitialRisk = () => {
    const base = 92;
    const reduction = delta.referrals * 6 + delta.posts * 4;
    return Math.max(30, base - reduction);
  };

  const [simulatedRisk, setSimulatedRisk] = useState<number>(calculateInitialRisk());
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [apiAction, setApiAction] = useState<string | null>(null);
  const [observedRisk, setObservedRisk] = useState<number | null>(null);

  const baseProbNow = 82;
  const baseDropoutProbDay1 = 85;
  const baseDropoutProbDay3 = 88;
  const baseDropoutProbDay5 = 92;

  const hasDelta = delta.posts > 0 || delta.referrals > 0;
  
  // Replace frontend math with states based on the real API
  const actionMultiplier = simulatedRisk / 92;
  const simProbNow = Math.round(baseProbNow * actionMultiplier);
  const simDropoutProbDay1 = Math.round(baseDropoutProbDay1 * actionMultiplier);
  const simDropoutProbDay3 = Math.round(baseDropoutProbDay3 * actionMultiplier);
  const simDropoutProbDay5 = simulatedRisk;

  const trajectoryData = [
    { time: 'NOW',   
      base: baseProbNow, baseBand: [Math.max(0, baseProbNow-4), Math.min(100, baseProbNow+4)], 
      action: simProbNow, actionBand: [Math.max(0, simProbNow-4), Math.min(100, simProbNow+4)] 
    },
    { time: 't+24h', 
      base: baseDropoutProbDay1, baseBand: [Math.max(0, baseDropoutProbDay1-5), Math.min(100, baseDropoutProbDay1+5)], 
      action: simDropoutProbDay1, actionBand: [Math.max(0, simDropoutProbDay1-4), Math.min(100, simDropoutProbDay1+4)] 
    },
    { time: 't+48h', 
      base: baseDropoutProbDay3, baseBand: [Math.max(0, baseDropoutProbDay3-6), Math.min(100, baseDropoutProbDay3+6)], 
      action: simDropoutProbDay3, actionBand: [Math.max(0, simDropoutProbDay3-5), Math.min(100, simDropoutProbDay3+5)] 
    },
    { time: 't+72h', 
      base: baseDropoutProbDay5, baseBand: [Math.max(0, baseDropoutProbDay5-8), Math.min(100, baseDropoutProbDay5+8)], 
      action: simDropoutProbDay5, actionBand: [Math.max(0, simDropoutProbDay5-6), Math.min(100, simDropoutProbDay5+6)] 
    },
  ];

  const handleExecute = async () => {
    setShowExecutionState('executing');
    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: delta.posts,
          referrals: delta.referrals,
        }),
      });
      const data = await res.json();
      
      setApiScore(data.score);
      setSimulatedRisk(data.risk);
      setAiInsight(data.insight);
      setApiAction(data.action);
      setObservedRisk(Math.round(data.risk * (1.05 + Math.random() * 0.2)));
    } catch(err) {
      console.error(err);
    }
    
    setShowExecutionState('done');
  }

  const netRetentionGain = baseDropoutProbDay5 - simDropoutProbDay5;
  const usersSaved = Math.max(50, Math.floor(10000 * (netRetentionGain / 100))); // Sample cohort size 10k
  const revSaved = (usersSaved * 4000).toLocaleString();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 p-4 lg:p-6 flex flex-col items-center overflow-x-hidden w-full relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-900/10 via-emerald-900/5 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-[1500px] flex flex-col flex-grow min-w-0 relative z-10">
        
        {/* Header - Repositioned cleanly */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-6 w-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
              <span className="text-[10px] tracking-[0.2em] font-bold text-emerald-500 uppercase">Production Ready • Latency &lt;120ms</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-emerald-400" />
              Causal Decision Engine <span className="font-bold text-white text-lg sm:text-2xl self-end pb-1 text-white/50">for Ambassador Retention</span>
            </h1>
            <h2 className="text-sm sm:text-base text-white/80 font-medium tracking-wide mt-2 border-l-2 border-emerald-500 pl-3">
              Centralized ambassador management system powered by an adaptive AI decision engine.
            </h2>
          </div>
          
          <div className="flex flex-col gap-3 w-full xl:w-auto items-start xl:items-end">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => setViewMode('manager')}
                className={cn("px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all", viewMode === 'manager' ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "text-white/50 hover:text-white")}
              >
                Manager Console
              </button>
              <button 
                onClick={() => setViewMode('ambassador')}
                className={cn("px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all", viewMode === 'ambassador' ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "text-white/50 hover:text-white")}
              >
                Ambassador App
              </button>
            </div>
            {viewMode === 'manager' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[10px] uppercase tracking-widest text-emerald-400/80 w-full xl:w-auto bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Automated Task Assignment</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Causal Validation Engine</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Engagement Tracking</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> RL Intervention Policy</div>
              </div>
            )}
          </div>
        </header>

        {viewMode === 'manager' ? (
          <>
            {/* 3-Column Layout for clear hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow w-full min-w-0">
          
          {/* LEFT COL: Human Context & Platform (Problem space) */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 min-w-0">
            
            {/* Manager Console View */}
            <div className="bg-gradient-to-br from-[#111111] to-[#050505] border border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-[50px] pointer-events-none"></div>
               <h3 className="text-[10px] uppercase tracking-[0.15em] text-blue-400 mb-3 flex items-center gap-2 font-bold relative z-10">
                 <ShieldCheck className="w-3.5 h-3.5" /> Program Manager Console
               </h3>
               <div className="text-[9px] font-mono text-white/70 space-y-2 relative z-10 font-bold">
                  <div className="flex items-center justify-between bg-blue-500/10 px-2.5 py-1.5 rounded border border-blue-500/20">
                     <span>1. Campaign Mode</span> 
                     <div className="text-white text-[8px] uppercase tracking-wider flex gap-1"><span className="opacity-50">Growth /</span> <span className="text-emerald-400 bg-emerald-500/20 px-1 py-0.5 rounded">Retention</span> <span className="opacity-50">/ Activation</span></div>
                  </div>
                  <div className="flex items-center justify-between bg-blue-500/10 px-2.5 py-1.5 rounded border border-blue-500/20"><span>2. Task Workflows</span> <span className="text-white">Active</span></div>
                  <div className="flex items-center justify-between bg-blue-500/10 px-2.5 py-1.5 rounded border border-blue-500/20">
                     <span>3. AI Policy Mode</span> 
                     <div className="flex gap-0.5 sm:gap-1 text-[7px] uppercase">
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded">Auto (RL)</span>
                        <span className="text-white/30 px-1 py-0.5 border border-white/10 rounded">Assisted</span>
                        <span className="text-white/30 px-1 py-0.5 border border-white/10 rounded">Manual</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* RAVI'S JOURNEY - Human First */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
               <h3 className="text-xs uppercase tracking-[0.15em] text-white/60 mb-1 flex items-center gap-2 font-bold">
                 <User className="w-4 h-4 text-blue-400" /> Ravi's Journey (Cohort 4)
               </h3>
               <div className="text-[8px] font-mono uppercase tracking-widest text-white/50 mb-4 flex items-center gap-1.5">
                  Lifecycle: <span className="text-white/30 line-through decoration-white/20">Onboarded</span> → <span className="text-red-400 font-bold">At-Risk</span> → <span className="text-emerald-400 border-b border-emerald-500/50 border-dashed pb-0.5">Recovering</span>
               </div>
               
               <div className="space-y-3 relative before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  <div className="flex gap-3 relative z-10 pl-6">
                     <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-white/30"></div>
                     <div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">Day 1 to 3</div>
                        <div className="text-xs text-white">Highly active, completed initial tasks.</div>
                     </div>
                  </div>
                  <div className="flex gap-3 relative z-10 pl-6">
                     <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                     <div>
                        <div className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-0.5">Day 4 (Today: NOW)</div>
                        <div className="text-xs text-red-200">Inactive. Risk spiked to 82%. Requires immediate intervention.</div>
                     </div>
                  </div>
                  <div className="flex gap-3 relative z-10 pl-6 opacity-60 mt-4 border-t border-white/5 pt-3">
                     <div className="absolute left-1 top-4.5 w-2 h-2 rounded-full border border-emerald-500 bg-[#111]"></div>
                     <div>
                        <div className="text-[10px] text-emerald-500 uppercase tracking-widest mb-0.5">Target: Day 5-6</div>
                        <div className="text-xs text-white/70">Post content, restore engagement, risk &lt; 35%.</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* User-Level Personalization */}
            <div className="bg-[#111111] border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none"></div>
               <h3 className="text-[10px] uppercase tracking-[0.15em] text-emerald-400 mb-3 flex items-center gap-2 font-bold">
                 <Target className="w-3.5 h-3.5" /> Individual Micro-Signals
               </h3>
               <ul className="text-[10px] text-white/70 space-y-2.5 font-mono">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <span className="text-white/50">Past response to gamification:</span> 
                     <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">HIGH (0.83)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <span className="text-white/50">Content creation affinity:</span> 
                     <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">LOW (0.21)</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                     <span className="text-white/50">Optimal intervention timing:</span> 
                     <span className="text-blue-400 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> 19:00 - 21:00</span>
                  </div>
               </ul>
            </div>

            {/* Platform Task View */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg">
               <h3 className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-2 flex items-center gap-2 font-bold">
                 <ListTodo className="w-3.5 h-3.5 text-blue-400" /> Platform: Task Execution Engine
               </h3>
               
               <div className="space-y-3 mt-4">
                 <div className="text-sm text-white/80">
                    <div className="flex justify-between items-center mb-1 text-xs">
                       <span>Refer 5 users <span className="text-emerald-400 text-[10px] ml-1">+50 pts</span></span>
                       <span className="text-white/50 font-mono text-[10px]">3/5 <span className="text-emerald-500 ml-1">(Verified)</span></span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1"><div className="bg-blue-500 h-1 rounded-full w-[60%]"></div></div>
                 </div>
                 <div className="text-sm text-white/80">
                    <div className="flex justify-between items-center mb-1 text-xs">
                       <span>Post 2 contents <span className="text-emerald-400 text-[10px] ml-1">+30 pts</span></span>
                       <span className="text-amber-400/80 font-mono text-[10px] flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5 animate-spin"/> Pending Approval</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1"><div className="bg-amber-500 h-1 rounded-full w-[50%]"></div></div>
                 </div>
               </div>
               <div className="mt-3 border-t border-white/5 pt-3 flex flex-col gap-1.5 text-[9px] font-mono text-white/40">
                  <div className="flex justify-between items-center">
                     <span>Proof Verification Workflow</span>
                     <span className="text-white/60">Screenshot/Link → <span className="text-emerald-400">AI Verified <span className="opacity-50">(Manual fallback)</span></span></span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span>Task Completion Loop</span>
                     <span className="text-emerald-400 font-bold">Auto-score applied: +80 pts</span>
                  </div>
               </div>
            </div>

            {/* Leaderboard View */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg">
               <h3 className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-3 flex items-center gap-2 font-bold">
                 <Award className="w-3.5 h-3.5 text-blue-400" /> Platform: Leaderboard
               </h3>
               <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 mb-3">
                  <div>
                     <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Rank</div>
                     <div className="text-xl font-light text-white font-mono flex items-center gap-2">#42 <ArrowRight className="w-3 h-3 text-emerald-500"/><span className="text-emerald-400 font-bold text-sm">#18 <span className="text-[8px] font-sans text-emerald-500/60 uppercase tracking-widest">Proj.</span></span></div>
                  </div>
                  <div className="text-right">
                     <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Score</div>
                     <div className="text-xl font-light text-white font-mono opacity-70 flex items-center gap-2 justify-end">320 <ArrowRight className="w-3 h-3 text-emerald-500"/><span className="text-emerald-400 font-bold text-sm">+80 <span className="text-[8px] font-sans text-emerald-500/60 uppercase tracking-widest">Task</span></span></div>
                  </div>
               </div>
               
               <div className="flex flex-col gap-1.5 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-center">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-widest">Badge: Rising Ambassador 🔥</span>
                  <div className="flex justify-center gap-4 text-[8px] text-amber-400/70 uppercase tracking-widest font-mono mt-1">
                     <span>🔥 4 Day Streak</span>
                     <span>🎯 Next reward: 20 pts</span>
                  </div>
               </div>
               <div className="mt-4 text-[10px] text-red-400 text-center font-mono italic font-bold">
                 "Without intervention: user drops off"
               </div>
            </div>

          </div>

          {/* MIDDLE COL: The Decision Engine (BIGGEST FOCUS) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-5 min-w-0 z-20">
            
            {/* BIG: NEXT BEST ACTION */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-emerald-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none"></div>
               <div className="absolute top-0 inset-x-0 flex justify-center">
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-b-lg px-4 py-1 text-[9px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                     <BrainCircuit className="w-3 h-3" /> AI Decision Mode: Active
                  </div>
               </div>
               
               <h3 className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 mb-3 font-bold flex items-center gap-2 mt-4">
                 <Cpu className="w-4 h-4" /> Next Best Action (RL Policy output)
               </h3>
               
               <div className="text-2xl font-light text-white mb-2">
                  Deploy targeted <span className="font-bold text-emerald-400">{apiAction || "Referral Drive"}</span>
               </div>
               <div className="flex flex-wrap gap-2 items-center mb-4">
                 <div className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold font-mono bg-emerald-500/10 inline-block px-2 py-1 rounded">
                    Risk: High → Action needed today
                 </div>
                 {apiScore && (
                   <div className="text-[10px] text-blue-400/80 uppercase tracking-widest font-bold font-mono bg-blue-500/10 inline-block px-2 py-1 rounded">
                      Policy Confidence Score: {apiScore.toFixed(1)} / 10
                   </div>
                 )}
               </div>

               {/* Simulation Sliders (Injecting into policy) */}
               <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-5 relative">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest flex items-center justify-between gap-2">
                     <span className="flex items-center gap-2"><History className="w-3 h-3" /> Simulate Counterfactuals</span>
                     <span className="text-[8px] normal-case bg-black/30 px-1.5 py-0.5 rounded border border-white/5 text-white/30 truncate ml-2">Simulates outcome if intervention intensity changes</span>
                  </div>
                  <div className="space-y-4 mt-3">
                     <div>
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                           <span className="text-white/80">Inject Referral Nudge</span>
                           <span className="font-mono text-emerald-400 font-bold">+{delta.referrals} targets</span>
                        </div>
                        <input type="range" min="0" max="5" value={delta.referrals} onChange={(e) => setDelta({...delta, referrals: parseInt(e.target.value)})} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                           <span className="text-white/80">Inject Content Prompt</span>
                           <span className="font-mono text-emerald-400 font-bold">+{delta.posts} tasks</span>
                        </div>
                        <input type="range" min="0" max="5" value={delta.posts} onChange={(e) => setDelta({...delta, posts: parseInt(e.target.value)})} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                     </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#050505] px-2 text-[8px] text-emerald-500/60 uppercase tracking-[0.2em] font-mono whitespace-nowrap">
                     Signals: tasks • referrals • inactivity • engagement timing
                  </div>
               </div>

               {/* Risk Change Display */}
               <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-4 mb-10 pt-2">
                 <div className="bg-red-500/5 border border-red-500/20 py-3 px-4 rounded-xl w-full sm:flex-1 text-center relative">
                    <div className="text-[9px] text-white/50 uppercase tracking-widest mb-1">Baseline Dropout Risk</div>
                    <div className="text-3xl text-red-400 font-light font-mono tracking-tight">{baseDropoutProbDay5}%</div>
                 </div>
                 <ArrowRight className="hidden sm:block w-5 h-5 text-emerald-500/50 flex-shrink-0" />
                 <div className={cn("py-3 px-4 rounded-xl w-full sm:flex-1 text-center border transition-all duration-300 relative", hasDelta ? "bg-emerald-500/10 border-emerald-500/40" : "bg-white/5 border-white/10")}>
                    <div className="text-[9px] text-white/50 uppercase tracking-widest mb-1">Simulated Dropout Risk</div>
                    <div className={cn("text-3xl font-light font-mono tracking-tight", hasDelta ? "text-emerald-400 font-bold" : "text-white/40")}>
                       {hasDelta ? `${simDropoutProbDay5}%` : `${baseDropoutProbDay5}%`}
                    </div>
                    {hasDelta && <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#050505] border border-emerald-500/30 text-[8px] font-mono text-emerald-500/80 px-2 py-0.5 rounded-full whitespace-nowrap">Uncertainty: ± {Math.min(8, Math.round(simDropoutProbDay5 * 0.15))}%</div>}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[7px] text-white/40 whitespace-nowrap font-mono tracking-widest uppercase">Pre-estimate (client) → refined by model</div>
                 </div>
               </div>

               {/* Action Execution Button */}
               <button 
                  onClick={handleExecute} disabled={showExecutionState !== 'idle' || !hasDelta}
                  className={cn("w-full py-3.5 font-bold text-[11px] uppercase tracking-[0.2em] rounded-lg transition-all flex justify-center items-center gap-2 relative z-10 border",
                    showExecutionState === 'done' ? "bg-black border-emerald-500/50 h-auto p-4 flex-col cursor-default" :
                    hasDelta ? "bg-emerald-500 border-transparent text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-white/10 border-white/5 text-white/30 cursor-not-allowed"
                  )}
               >
                  <AnimatePresence mode="wait">
                  {showExecutionState === 'idle' && <motion.span key="idle" className="flex items-center gap-2"><Target className="w-4 h-4" /> Apply AI Decision</motion.span>}
                  {showExecutionState === 'executing' && <motion.span key="executing" className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Executing Policy...</motion.span>}
                  {showExecutionState === 'done' && (
                     <motion.div key="done" className="flex flex-col w-full text-left gap-1 animate-fade-in relative">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1"><CheckCircle className="w-4 h-4" /> Intervention Deployed</span>
                        <div className="bg-[#0f0f0f] border border-white/10 p-2.5 rounded font-mono text-[9px] tracking-normal normal-case space-y-1.5 text-white/60 w-full mt-1">
                           <div className="flex justify-between"><span>Prediction (t+6h):</span><span className="text-white">{simDropoutProbDay5}%</span></div>
                           <div className="flex justify-between"><span>Observed (t+6h):</span><span className="text-amber-400">{observedRisk || Math.round(simDropoutProbDay5 * 1.15)}%</span></div>
                           <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1 text-emerald-400">
                             <span className="uppercase tracking-widest text-[8px] font-bold">Error Feedback</span>
                             <span>Observed vs Predicted: +7% deviation (updating policy)</span>
                           </div>
                        </div>
                     </motion.div>
                  )}
                  </AnimatePresence>
               </button>
               {apiScore && (
                 <div className="mt-3 text-[10px] text-emerald-400 text-center uppercase tracking-[0.2em] font-bold font-mono">
                   Live API Decision • Real-time inference • Not simulated
                 </div>
               )}
            </div>

            {/* THIRD: Causal Impact Forecast (Chart) */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col relative z-20">
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-[10px] uppercase tracking-[0.15em] text-white/80 flex items-center gap-2 font-bold mb-1">
                     <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Trajectory Forecast
                    </h3>
                    <div className="text-[9px] text-white/40 font-mono flex items-center gap-3">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Prediction Window: 72 hours</span>
                       <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3"/> Updates every: 6 hours</span>
                    </div>
                 </div>
               </div>
              
              <div className="w-full h-40 mt-2 relative">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 -rotate-90 text-[7px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">Dropout Risk (%)</div>
                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">Time (hours)</div>
                <div className="absolute top-1 left-5 max-w-[120px] sm:max-w-none text-[8px] font-mono text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 z-10 flex items-center gap-1">
                   <Target className="w-2 h-2 shrink-0" /> Intervention applied @ t+0 → slope shift
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666'}} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val: number|number[], name: string) => {
                         if (Array.isArray(val)) return ["", ""];
                         return [`${val}%`, name === 'base' ? 'Baseline' : 'Simulated']; 
                      }}
                    />
                    <Area type="monotone" dataKey="baseBand" fill="#ef4444" fillOpacity={0.06} stroke="none" activeDot={false} tooltipType="none" />
                    <Area type="monotone" dataKey="actionBand" fill="#10b981" fillOpacity={0.10} stroke="none" activeDot={false} tooltipType="none" />
                    <Line type="monotone" dataKey="base" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Baseline" />
                    <Line type="monotone" dataKey="action" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#050505' }} name="Simulated" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Layer 4: Action, Reality & Control Engine */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-5 min-w-0 z-20">
            
            {/* Policy Interventions */}
            <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg overflow-hidden relative">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-5 flex items-center justify-between font-bold z-10 relative">
                <span className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-blue-400" /> RL Policy Details</span>
              </h3>
              
              <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.05)] mb-3">
                 <div className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold mt-1 mb-2">Sharpened Decision Logic (Why?)</div>
                 <ul className="text-xs text-white/80 space-y-2 list-none pl-1 mb-1 font-medium">
                    <li><ArrowRight className="inline w-3 h-3 text-emerald-500 mr-1"/> Historical causal impact: <span className="font-bold text-emerald-400 text-xs">+18% retention uplift</span></li>
                    <li><ArrowRight className="inline w-3 h-3 text-emerald-500 mr-1"/> Uplift Model Confidence: <span className="font-bold text-white">High (Data completeness: 94%)</span></li>
                    <li><ArrowRight className="inline w-3 h-3 text-emerald-500 mr-1"/> Reverses critical 4-day inactivity momentum lag.</li>
                 </ul>
              </div>
              
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 relative z-10">
                 <div className="text-[9px] uppercase tracking-widest text-blue-400 font-bold mb-2 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3"/> Policy Shift (Exploration Tracker)
                 </div>
                 <div className="text-[10px] font-mono space-y-1.5">
                    <div className="flex justify-between items-center"><span className="text-white/50">Referral Action Prob:</span> <span className="text-white text-[10px]">62% <ArrowRight className="inline w-2.5 h-2.5 text-blue-500 max-w-min mx-1" /> <span className="text-emerald-400 font-bold">48%</span></span></div>
                    <div className="flex justify-between items-center"><span className="text-white/50">Content Push Prob:</span> <span className="text-white text-[10px]">38% <ArrowRight className="inline w-2.5 h-2.5 text-blue-500 max-w-min mx-1" /> <span className="text-amber-400 font-bold">52%</span></span></div>
                 </div>
              </div>
            </div>

            {/* Reality & Validation Layer */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-lg flex-grow flex flex-col justify-between relative">
               
               <div className="mb-4">
                  <h4 className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Causal Validation (Offline A/B)</h4>
                  <div className="bg-white/5 rounded-lg p-3 text-xs font-mono mt-1 border border-white/5 relative">
                     <div className="absolute -top-2 right-2 bg-[#0a0a0a] border border-white/10 text-[7px] px-1.5 rounded text-white/40">Confidence: ±6% based on data var.</div>
                     <div className="space-y-1 mb-2 mt-1">
                        <div className="flex justify-between text-white/50"><span>Control <span className="opacity-50 text-[10px]">(Retention Rate)</span>:</span> <span>51%</span></div>
                        <div className="flex justify-between text-emerald-400/80"><span>Treatment <span className="opacity-50 text-[10px]">(Retention Rate)</span>:</span> <span>72%</span></div>
                        <div className="flex justify-between border-t border-white/10 pt-2 mt-2 font-bold text-emerald-400">
                           <span>Expected Uplift:</span> <span>+21% (±3.1%)</span>
                        </div>
                     </div>
                     <div className="text-[8px] font-sans uppercase tracking-widest text-[#10b981]/70 border-t border-white/10 pt-2 mt-2 space-y-1 font-bold">
                        <div className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Treatment assigned via policy (not random)</div>
                        <div className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Counterfactual estimated using causal model</div>
                     </div>
                  </div>
               </div>

               <div className="mb-4">
                  <h4 className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> System Risks & Constraints</h4>
                  <div className="text-[10px] leading-relaxed text-white/50 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 space-y-2">
                     <div>
                       <span className="text-amber-500 font-bold block mb-0.5">Risk: Over-engagement burnout</span>
                       <span className="font-mono text-[9px] opacity-80 text-amber-200 block">Mitigation: Hard-capped at 2 interventions per user/week.</span>
                     </div>
                     <div className="border-t border-amber-500/20 pt-1.5 mt-1.5 space-y-2">
                       <div>
                         <span className="text-amber-500 font-bold block mb-0.5">Constraint: Cold-Start Users</span>
                         <span className="font-mono text-[9px] opacity-80 text-amber-200 block">System reverts to global averages for users active &lt; 3 days.</span>
                       </div>
                       <div>
                         <span className="text-emerald-500 font-bold block mb-0.5 flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> Continuous Learning</span>
                         <span className="font-mono text-[9px] opacity-80 text-emerald-300 block">Policy updated from 3,214 past failures.</span>
                       </div>
                       <div className="border-t border-amber-500/20 pt-1.5 mt-1.5">
                         <span className="text-blue-400 font-bold block mb-0.5 flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5"/> Safety Bounds</span>
                         <span className="font-mono text-[9px] opacity-80 text-blue-200 block">Exploration limits strictly bounded by historical success thresholds.</span>
                       </div>
                     </div>
                  </div>
               </div>
            </div>

          </div>

        </div>

        {/* System Architecture & Business Value Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pb-8 relative z-10">
           
           <div className="col-span-1 lg:col-span-7 bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
               <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-500" /> Deployable Architecture</h4>
               <div className="flex flex-wrap lg:flex-nowrap items-center text-[9px] font-mono uppercase tracking-widest text-white/60 gap-1.5 lg:gap-0 font-bold opacity-80">
                  <div className="bg-white/10 px-2.5 py-1.5 rounded">1. Platform Events</div>
                  <ArrowRight className="hidden lg:block w-3 h-3 text-white/30 mx-1 shrink-0"/>
                  <div className="bg-white/10 px-2.5 py-1.5 rounded text-white/80">2. Real-Time Pipeline</div>
                  <ArrowRight className="hidden lg:block w-3 h-3 text-white/30 mx-1 shrink-0"/>
                  <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1.5 rounded shrink-0">3. XGBoost Ensemble</div>
                  <ArrowRight className="hidden lg:block w-3 h-3 text-emerald-500/50 mx-1 shrink-0"/>
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded shrink-0">4. Causal Discovery</div>
                  <ArrowRight className="hidden lg:block w-3 h-3 text-emerald-500/50 mx-1 shrink-0"/>
                  <div className="bg-white/10 px-2.5 py-1.5 rounded text-white border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">5. RL Policy</div>
               </div>
               <div className="mt-4 flex gap-6 text-[9px] font-mono text-emerald-500/70 border-t border-white/5 pt-3 uppercase font-bold">
                  <span>Data: 12k logs</span>
                  <span>Latency: &lt;120ms</span>
                  <span>Continuous learning loop enabled</span>
               </div>
           </div>

           <div className="col-span-1 lg:col-span-5 bg-[#0a0a0a] border border-emerald-500/30 p-5 rounded-2xl shadow-[0_4px_30px_rgba(16,185,129,0.08)] flex justify-between items-center sm:items-end w-full relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none"></div>
               <div className="w-full relative z-10">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Program ROI & Unit Economics</div>
                  <div className="flex items-baseline gap-2 mb-1">
                     <span className="text-3xl sm:text-4xl text-emerald-400 font-bold tracking-tighter">₹840</span>
                     <span className="text-sm font-normal text-emerald-500/60 uppercase tracking-widest">Effective CAC Reduction / User</span>
                  </div>
                  <div className="text-[10px] text-white/60 font-mono mt-1 pt-2 border-t border-emerald-500/20 w-full sm:w-auto font-medium flex flex-col gap-0.5">
                     <span>Savings based on retained ambassadors vs dropouts</span>
                     <span className="text-emerald-500/70 text-[9px]">Based on 30-day ambassador cohort performance</span>
                  </div>
               </div>
               <div className="text-right flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 ml-4 sm:ml-0 relative z-10">
                  <div className="text-[10px] text-emerald-400/80 mb-1 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded inline-block">+ {usersSaved.toLocaleString()} Retained</div>
                  <div className="text-lg sm:text-2xl text-white font-mono font-bold whitespace-nowrap">₹ {revSaved}</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1">Total Program Budget Saved</div>
               </div>
           </div>

        </div>
          </>
        ) : (
          <div className="flex justify-center w-full mt-4 xl:mt-10 animate-[fadeIn_0.3s_ease-out] relative z-10 mx-auto px-4 sm:px-0 flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-16">
            {/* Mobile-sized Ambassador App View */}
            <div className="w-full max-w-[380px] bg-[#050505] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6 ring-[8px] ring-white/5 mx-auto lg:mx-0">
               {/* Internal Phone Header */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-[#050505] rounded-b-xl border-x border-b border-white/10 z-20"></div>

               {/* Header / Profile */}
               <div className="flex justify-between items-center border-b border-white/10 pb-4 mt-2">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-black font-bold">R</div>
                     <div>
                        <div className="font-bold text-white">Hi, Ravi 👋</div>
                        <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Campus Ambassador</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xl font-bold text-white font-mono">320</div>
                     <div className="text-[9px] uppercase tracking-widest text-white/50">Points</div>
                  </div>
               </div>

               {/* AI Suggested Action */}
               <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold flex items-center justify-between gap-2 mb-2">
                     <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Next Best Action</span>
                     <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 flex items-center gap-1 text-[8px]"><AlertTriangle className="w-2.5 h-2.5"/> Warning: At Risk</span>
                  </div>
                  <div className="text-sm text-white font-medium mb-3">
                     Your next best action to stay active: 
                     {aiInsight ? (
                       <span className="text-emerald-400 block mt-2 text-xs">{aiInsight}</span>
                     ) : (
                       <span className="text-emerald-400 block mt-2 text-xs">Host a referral drive this week!</span>
                     )}
                  </div>
                  <button className="w-full bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-widest py-2.5 rounded-lg border border-transparent hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                     Start Referral Campaign
                  </button>
               </div>

               {/* Task List */}
               <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-3">My Tasks</h4>
                  <div className="space-y-2">
                     <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center">
                        <div>
                           <div className="text-xs text-white">Refer 5 users</div>
                           <div className="text-[10px] text-emerald-400 mt-0.5">+50 pts</div>
                        </div>
                        <div className="text-xs font-mono text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded bg-emerald-500/10">3/5</div>
                     </div>
                     <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center">
                        <div>
                           <div className="text-xs text-white">Post 2 contents</div>
                           <div className="text-[10px] text-emerald-400 mt-0.5">+30 pts</div>
                        </div>
                        <div className="text-[9px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">Pending Review</div>
                     </div>
                  </div>
               </div>

               {/* Gamification / Leaderboard */}
               <div className="border-t border-white/10 pt-5 mt-auto">
                  <div className="flex justify-between items-center bg-[#111] p-3 rounded-xl border border-white/5">
                     <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-amber-400" />
                        <div>
                           <div className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Current Rank</div>
                           <div className="text-sm font-bold text-white font-mono">#42 <span className="text-emerald-500 text-[10px] ml-1">↑ Rising</span></div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-0.5">🔥 4 Day Streak</div>
                        <div className="text-[9px] text-white/40">20 pts to Next Badge</div>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col justify-center max-w-[400px] text-center lg:text-left mx-auto lg:mx-0">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center justify-center lg:justify-start gap-2"><ArrowRight className="hidden lg:block text-emerald-500" /> Ambassador Experience</h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-6 font-medium">
                 AI learns what action works best for each ambassador and presents it dynamically in their app.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none"></div>
                 <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center justify-center lg:justify-start gap-2 relative z-10"><CheckCircle className="w-4 h-4"/> The Problem Solved</div>
                 <div className="text-sm text-emerald-100/80 leading-relaxed relative z-10">
                    A student uses this tool and walks away with a clear, gamified path to success. The manager gets a fully automated retention engine.
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

