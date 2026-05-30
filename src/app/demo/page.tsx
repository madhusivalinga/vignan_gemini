'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Play, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Sparkles,
  Mic,
  BrainCircuit,
  Award,
  Pause,
  RotateCcw,
  LayoutDashboard,
  Target,
  Trophy,
  Flame,
  CheckCircle2,
  Info
} from 'lucide-react';

// Scenes configuration
const SCENES = [
  {
    id: 'intro',
    title: 'The Communication Gap',
    description: 'Why do 75% of graduates struggle in interviews? It is not technical skill - it is communication.',
    duration: 5000
  },
  {
    id: 'dashboard',
    title: 'Your Command Center',
    description: 'The VoxVignan Dashboard tracks your streak, score, and your specialized 7-day roadmap.',
    duration: 6000
  },
  {
    id: 'challenge',
    title: 'Interactive Challenges',
    description: 'From Elevator Pitches to Technical Assessments, practice in a safe AI-driven environment.',
    duration: 5000
  },
  {
    id: 'feedback',
    title: 'Instant AI Evaluation',
    description: 'Get real-time feedback on your tone, sentiment, grammar, and even filler words using Google Gemini.',
    duration: 6000
  },
  {
    id: 'success',
    title: 'Data-Driven Growth',
    description: 'Watch your scores rise and earn professional badges as you master the art of communication.',
    duration: 5000
  }
];

export default function VideoDemoPage() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentScene = SCENES[currentSceneIndex];

  // Progress and Auto-advance logic
  useEffect(() => {
    if (isPlaying) {
      const stepTime = 50; // ms
      const increment = (stepTime / currentScene.duration) * 100;
      
      timerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + increment;
        });
      }, stepTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIndex]);

  const handleNext = () => {
    setProgress(0);
    setCurrentSceneIndex(prev => (prev + 1) % SCENES.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentSceneIndex(prev => (prev - 1 + SCENES.length) % SCENES.length);
  };

  const jumpToScene = (index: number) => {
    setProgress(0);
    setCurrentSceneIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1d]/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xl tracking-tight">VoxVignan <span className="text-secondary text-blue-500">AI Tour</span></span>
        </Link>
        <div className="flex items-center space-x-4">
            <div className="hidden md:flex bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-400">
               <Info className="w-3.5 h-3.5 mr-2" />
               New User Interactive Guide
            </div>
            <Link href="/auth/signup" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              Get Started
            </Link>
        </div>
      </nav>

      {/* Video Container Area */}
      <main className="relative pt-24 pb-32 h-screen flex flex-col items-center justify-center px-4 max-w-7xl mx-auto">
        
        {/* Main Viewport */}
        <div className="w-full max-w-5xl aspect-video bg-[#141b2d] rounded-3xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative group">
           
            {/* PROGRESS BAR */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 z-20">
                <div 
                  className="h-full bg-blue-500 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* SCENE CONTENT RENDERING */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
               {currentSceneIndex === 0 && <IntroScene />}
               {currentSceneIndex === 1 && <DashboardScene />}
               {currentSceneIndex === 2 && <ChallengeSelectionScene />}
               {currentSceneIndex === 3 && <AIEvaluationScene />}
               {currentSceneIndex === 4 && <SuccessScene />}
            </div>

            {/* OVERLAY NARRATION */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-8 pt-20 pointer-events-none">
                <div className="max-w-2xl animate-in fade-in slide-in-from-bottom duration-700">
                   <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Scene {currentSceneIndex + 1}: {currentScene.title}</h3>
                   <p className="text-xl md:text-2xl font-semibold leading-snug">{currentScene.description}</p>
                </div>
            </div>

            {/* HOVER CONTROLS */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 z-30">
               <button onClick={handlePrev} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110">
                 <RotateCcw className="w-8 h-8 text-white -scale-x-100" />
               </button>
               <button onClick={() => setIsPlaying(!isPlaying)} className="p-6 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all active:scale-95">
                 {isPlaying ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white translate-x-1" />}
               </button>
               <button onClick={handleNext} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110">
                 <RotateCcw className="w-8 h-8 text-white" />
               </button>
            </div>
        </div>

        {/* BOTTOM TIMELINE CONTROLS */}
        <div className="mt-12 flex space-x-4 items-center bg-white/5 p-2 rounded-2xl border border-white/5">
            {SCENES.map((scene, i) => (
                <button 
                  key={scene.id} 
                  onClick={() => jumpToScene(i)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    currentSceneIndex === i 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {scene.title.split(' ')[0]}
                </button>
            ))}
        </div>

      </main>

      {/* Guide Footer */}
      <div className="fixed bottom-0 w-full p-6 text-center text-slate-500 text-sm">
         <p>Ready to boost your skills? Join 10,000+ students today.</p>
      </div>
    </div>
  );
}

/* --- SCENE COMPONENTS --- */

function IntroScene() {
    return (
        <div className="text-center space-y-8 animate-in zoom-in duration-1000">
            <div className="relative inline-block">
                <div className="absolute -inset-4 bg-red-500/20 blur-2xl rounded-full"></div>
                <div className="w-24 h-24 bg-red-500/10 border border-red-500/50 rounded-full flex items-center justify-center relative">
                    <Mic className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
            </div>
            <h2 className="text-5xl font-black italic tracking-tighter">"I'M NOT PREPARED..."</h2>
            <div className="flex justify-center space-x-4 opacity-70">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-bold">Interview Nervousness</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-bold">Filler Word Overuse</span>
                </div>
            </div>
        </div>
    );
}

function DashboardScene() {
    return (
        <div className="w-full h-full flex flex-col space-y-6 pt-4 animate-in fade-in slide-in-from-right duration-1000">
            {/* Header Mock */}
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="h-6 bg-slate-700/50 rounded w-48"></div>
                <div className="flex space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Trophy className="w-4 h-4 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Dashboard Cards Mock */}
            <div className="grid grid-cols-3 gap-6 flex-1">
                <div className="bg-gradient-to-br from-blue-600/20 to-transparent p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-4 right-4 animate-bounce">
                        <Target className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Weekly Goal</h4>
                    <div className="text-4xl font-black mb-4">80%</div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                </div>
                
                <div className="col-span-2 bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col justify-center">
                    <div className="flex items-center mb-6">
                        <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                        <h4 className="font-bold text-lg">7-Day Communication Sprint</h4>
                    </div>
                    <div className="flex space-x-3">
                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <div key={d} className={`flex-1 aspect-square rounded-xl border flex items-center justify-center font-bold text-xs ${
                                d < 3 ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/20'
                            }`}>
                                {d < 3 ? <CheckCircle2 className="w-4 h-4" /> : d}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Focus Highlight */}
            <div className="absolute top-[40%] left-[30%] w-32 h-32 border-2 border-red-500 border-dashed rounded-full animate-ping opacity-20 pointer-events-none"></div>
        </div>
    );
}

function ChallengeSelectionScene() {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center space-y-8 animate-in zoom-in duration-1000">
            <h3 className="text-2xl font-bold bg-white/5 px-6 py-2 rounded-full border border-white/10">Active Challenge Selection</h3>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                 <div className="p-6 bg-blue-600 rounded-3xl border border-white/10 shadow-2xl scale-105 relative z-10 transition-transform">
                    <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl mb-1">Elevator Pitch</h4>
                    <p className="text-sm text-blue-100 opacity-70">Day 3 Objective</p>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                        START NOW
                    </div>
                 </div>

                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <LayoutDashboard className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-xl mb-1">Mock Interview</h4>
                    <p className="text-sm text-slate-500">Day 4 Objective</p>
                 </div>
            </div>

            <div className="flex space-x-12 opacity-40">
                <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Real-time Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Safe Space</span>
                </div>
            </div>
        </div>
    );
}

function AIEvaluationScene() {
    return (
        <div className="w-full h-full flex items-center justify-between p-6 animate-in fade-in duration-1000">
            {/* Left: Video Mock */}
            <div className="w-1/2 aspect-square bg-[#0d111c] border-2 border-blue-500 rounded-3xl relative overflow-hidden flex items-center justify-center group">
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold tracking-widest uppercase">REC</span>
                </div>
                
                {/* Waveform Mock */}
                <div className="flex items-end space-x-1 h-20">
                    {[20, 40, 60, 30, 80, 50, 90, 70, 40, 30].map((h, i) => (
                        <div key={i} className="w-2 bg-blue-500 rounded-full animate-bounce" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
            </div>

            {/* Right: AI Insights Mock */}
            <div className="w-[45%] space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right duration-700">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">Tone Analysis</h5>
                    </div>
                    <p className="text-sm font-medium">"Your confidence score is highly positive. Maintain this energy."</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right duration-700 delay-200">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <h5 className="font-bold text-xs uppercase tracking-widest text-slate-400">AI Warning</h5>
                    </div>
                    <p className="text-sm border-l-2 border-yellow-500 pl-3">"Slow down. You're speaking at 165 words per minute."</p>
                </div>

                <div className="bg-blue-600 p-4 rounded-2xl animate-in slide-in-from-right duration-700 delay-500 shadow-xl shadow-blue-500/20">
                    <div className="flex items-center space-x-2 mb-1">
                        <BrainCircuit className="w-4 h-4" />
                        <h5 className="font-black text-[10px] tracking-tighter uppercase">Google Gemini Insights</h5>
                    </div>
                    <p className="text-xs font-bold">"Contextual relevance: 9.4/10"</p>
                </div>
            </div>
        </div>
    );
}

function SuccessScene() {
    return (
        <div className="text-center space-y-10 animate-in zoom-in duration-700">
            <div className="relative inline-block">
                <div className="absolute -inset-10 bg-blue-500/30 blur-3xl rounded-full animate-pulse"></div>
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center transform rotate-12 shadow-2xl relative z-10">
                    <Award className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 scale-125 rounded-full p-2 border-4 border-[#141b2d]">
                    <Sparkles className="w-6 h-6 text-black" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight">Challenge Successful!</h2>
                <div className="flex justify-center space-x-12 mt-8">
                    <div>
                        <div className="text-3xl font-black text-blue-400">+120</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comm. Points</div>
                    </div>
                    <div className="w-px h-12 bg-white/10"></div>
                    <div>
                        <div className="text-3xl font-black text-green-400">Level 4</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Rank</div>
                    </div>
                </div>
            </div>

            <button className="bg-white text-black px-12 py-3 rounded-full font-black tracking-widest text-xs hover:scale-105 transition-transform">
                CLAIM YOUR FREE CERTIFICATE
            </button>
        </div>
    );
}
