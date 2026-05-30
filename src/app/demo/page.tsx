'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Play, 
  Pause,
  RotateCcw,
  ChevronRight,
  Monitor,
  Mic2,
  BarChart3,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const SCENES = [
  {
    id: 'intro',
    title: 'THE CHALLENGE',
    subtitle: '75% of graduates lack the communication skills needed to excel in their careers. VoxVignan bridges this gap.',
    image: '/demo/intro.png',
    duration: 6000
  },
  {
    id: 'dashboard',
    title: 'THE CORE',
    subtitle: 'Your personal dashboard tracks every milestone, from 7-day sprints to long-term career goals.',
    image: '/demo/dashboard.png',
    duration: 6000
  },
  {
    id: 'practice',
    title: 'THE EXPERIENCE',
    subtitle: 'Practice technical interviews and presentations in a realistic environment with real-time AI feedback.',
    image: '/demo/practice.png',
    duration: 7000
  },
  {
    id: 'feedback',
    title: 'THE INSIGHT',
    subtitle: 'Google Gemini powered analysis provides instant feedback on tone, grammar, and professional delivery.',
    image: '/demo/practice.png', // Reusing practice image but focusing on AI
    duration: 6000
  },
  {
    id: 'success',
    title: 'THE RESULT',
    subtitle: 'Master the art of articulation, boost your confidence, and unlock your professional potential.',
    image: '/demo/intro.png', // Loop back to reflective view
    duration: 6000
  }
];

export default function CinematicDemoPage() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentScene = SCENES[currentSceneIndex];

  useEffect(() => {
    if (isPlaying) {
      const stepTime = 50; 
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
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-blue-100">
      
      {/* Premium Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
             <Monitor className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">VoxVignan <span className="text-secondary font-medium opacity-60">Professional Tour</span></span>
        </Link>
        <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-4">
                <StepIndicator current={currentSceneIndex} total={SCENES.length} />
            </div>
            <Link href="/auth/signup" className="bg-secondary text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:shadow-xl hover:shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
              CREATE ACCOUNT
            </Link>
        </div>
      </nav>

      {/* Cinematic Content Area */}
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 flex flex-col items-center">
        
        {/* The "Camera" Frame */}
        <div className="w-full relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-100 aspect-video group">
            
            {/* PROGRESS TRACKER (Subtle) */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-40">
                <div 
                  className="h-full bg-secondary transition-all duration-100 ease-linear" 
                  style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* SCENE VISUALS (Cinematic Transitions) */}
            {SCENES.map((scene, idx) => (
                <div 
                  key={scene.id}
                  className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out transform ${
                    currentSceneIndex === idx 
                    ? 'opacity-100 scale-100 pointer-events-auto' 
                    : 'opacity-0 scale-110 pointer-events-none'
                  }`}
                >
                    {/* Background Image with Auto-Zoom (Ken Burns Effect) */}
                    <div 
                      className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
                        currentSceneIndex === idx && isPlaying ? 'scale-[1.12]' : 'scale-100'
                      }`}
                      style={{ backgroundImage: `url('${scene.image}')` }}
                    >
                         {/* Subtle Volumetric Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 via-transparent to-white/10"></div>
                    </div>

                    {/* Dashboard Detail Overlay (Specific for Dashboard Scene) */}
                    {scene.id === 'dashboard' && <DashboardOverlay active={currentSceneIndex === idx} />}
                </div>
            ))}

            {/* CINEMATIC LETTERBOXING & SUBTITLES */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-10">
                {/* Top Mask */}
                <div className="h-[8%] bg-gradient-to-b from-black/20 to-transparent"></div>
                
                {/* Bottom Subtitle Bar */}
                <div className="bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent pb-12 pt-24 px-12 md:px-24">
                    <div className="max-w-4xl mx-auto">
                        <h4 className="text-secondary font-black tracking-[0.2em] text-xs mb-3 animate-in fade-in slide-in-from-left duration-700">
                           {currentScene.title}
                        </h4>
                        <p className="text-xl md:text-3xl font-normal leading-tight text-white/95 animate-in fade-in slide-in-from-bottom duration-1000 delay-100">
                           {currentScene.subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* DISCRETE NAVIGATION CONTROLS */}
            <div className="absolute inset-0 group-hover:bg-black/5 transition-colors duration-500 z-30">
                <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handlePrev} className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110">
                        <RotateCcw className="w-6 h-6 -scale-x-100" />
                    </button>
                </div>
                <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleNext} className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110">
                        <RotateCcw className="w-6 h-6" />
                    </button>
                </div>
                <div className="absolute bottom-8 right-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-4">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
                    </button>
                </div>
            </div>
        </div>

        {/* POST-TOUR SECTION: Professional Roadmap */}
        <section className="w-full mt-24">
             <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                 <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">Designed for Professional Success</h2>
                    <p className="text-slate-500">How VoxVignan builds industry-ready communication skills.</p>
                 </div>
                 <Link href="/auth/signup" className="mt-6 md:mt-0 flex items-center space-x-2 text-secondary font-bold group">
                    <span>EXPLORE ALL FEATURES</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <RoadmapItem 
                    icon={<Mic2 className="w-6 h-6" />}
                    title="Expert Assessment"
                    description="AI-driven speech analysis that evaluates tone, vocabulary, and grammar with precision."
                />
                <RoadmapItem 
                    icon={<BarChart3 className="w-6 h-6" />}
                    title="Real-time Metrics"
                    description="Visual feedback loops that help you identify and correct mistakes instantly during practice."
                />
                <RoadmapItem 
                    icon={<CheckCircle className="w-6 h-6" />}
                    title="Career Readiness"
                    description="A structured 7-day path designed to prepare you for high-stakes interviews and meetings."
                />
             </div>
        </section>

      </main>

      <footer className="py-12 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm font-medium">
             <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Monitor className="w-4 h-4" />
                <span>© 2026 VoxVignan AI. All Rights Reserved.</span>
             </div>
             <div className="flex space-x-8">
                 <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                 <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                 <a href="#" className="hover:text-primary transition-colors">Success Stories</a>
             </div>
         </div>
      </footer>
    </div>
  );
}

/* --- SUPPORTING COMPONENTS --- */

function StepIndicator({ current, total }: { current: number, total: number }) {
    return (
        <div className="flex space-x-2">
            {Array.from({ length: total }).map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                        current === i ? 'w-8 bg-secondary shadow-sm' : 'w-1.5 bg-slate-200'
                    }`}
                ></div>
            ))}
        </div>
    );
}

function RoadmapItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
            <div className="w-14 h-14 bg-slate-50 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-colors">
                {icon}
            </div>
            <h4 className="text-xl font-bold text-primary mb-3">{title}</h4>
            <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
        </div>
    );
}

function DashboardOverlay({ active }: { active: boolean }) {
    return (
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
            {/* We could add subtle floating UI markers here if needed, but keeping it clean for cinematic feel */}
            <div className="absolute top-[20%] left-[20%] p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white animate-pulse">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Active Tracking</span>
                </div>
            </div>
        </div>
    );
}
