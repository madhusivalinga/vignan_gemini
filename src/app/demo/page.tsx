'use client';
import React, { useEffect, useState } from 'react';
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
  Award
} from 'lucide-react';

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance some steps for a "video-like" feel if needed, 
  // or let user scroll/click.
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xl tracking-tight text-primary">VoxVignan <span className="text-secondary">Demo</span></span>
        </Link>
        <Link href="/auth/signup" className="bg-secondary text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
          Join the Platform
        </Link>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-20">
        
        {/* Section 1: The Challenge */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>The Challenge</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-primary leading-tight">
                Communication: The <span className="text-red-500 underline decoration-wavy underline-offset-8">Difference</span> Between a Job & a Career.
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Many brilliant students fail to land their dream jobs not because of technical skills, but because they can't articulate their ideas.
              </p>
              <div className="space-y-4">
                <ChallengeItem 
                  title="Anxiety & Fear" 
                  description="75% of people experience 'Glossophobia' - the fear of public speaking."
                />
                <ChallengeItem 
                  title="Lack of Feedback" 
                  description="Without a mentor, you keep repeating the same communication mistakes."
                />
                <ChallengeItem 
                  title="Filler Words" 
                  description="'Um', 'Uh', 'Like' - Small habits that destroy professional credibility."
                />
              </div>
            </div>
            
            <div className="relative animate-in zoom-in duration-1000">
              <div className="absolute -inset-4 bg-gradient-to-tr from-red-200 to-blue-200 rounded-3xl blur-2xl opacity-30 shadow-2xl"></div>
              <div className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl overflow-hidden aspect-square flex flex-col justify-center items-center text-center">
                 <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Mic className="w-12 h-12 text-red-400" />
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Stage Fright</h3>
                 <p className="text-slate-500">How do you practice when you're too nervous to try?</p>
                 
                 {/* Decorative UI elements */}
                 <div className="absolute bottom-10 left-10 right-10 flex flex-col space-y-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 w-3/4 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>CONFIDENCE</span>
                      <span>25%</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: The Solution (Success starts here) */}
        <section className="bg-primary text-white py-24 my-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-8">
              <Zap className="w-4 h-4" />
              <span>The Success Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-16">How VoxVignan AI Builds <span className="text-blue-400">Communication Mastery</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SuccessStep 
                number="01"
                icon={<BrainCircuit className="w-10 h-10" />}
                title="AI Analysis"
                description="Google Gemini analyzes your tone, content, and sentiment in real-time."
              />
              <SuccessStep 
                number="02"
                icon={<MessageSquare className="w-10 h-10" />}
                title="Safe Space"
                description="Practice with an AI that never judges, only guides you to excellence."
              />
              <SuccessStep 
                number="03"
                icon={<TrendingUp className="w-10 h-10" />}
                title="Data-Driven Success"
                description="Visual progress tracking proves your growth with every session."
              />
            </div>
          </div>
        </section>

        {/* Section 3: Product Walkthrough (Animated Mockup) */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-primary mb-6">Experience the AI Mentor</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">See how VoxVignan turns every challenge into a stepping stone for success.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row">
            {/* Sidebar Mock */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 space-y-4 hidden md:block">
              <div className="h-8 bg-slate-200 rounded-md w-3/4 mb-8"></div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-10 rounded-lg flex items-center px-3 ${i === 1 ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                  <div className="w-5 h-5 rounded-full bg-current opacity-20 mr-3"></div>
                  <div className="h-3 bg-current opacity-20 rounded w-full"></div>
                </div>
              ))}
            </div>
            
            {/* Main Content Mock */}
            <div className="flex-1 p-8 bg-white min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-xl">Technical Interview Simulation</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Recording Live</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-slate-100 rounded-2xl relative p-10 bg-slate-50/50">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6">
                  <Play className="fill-current w-8 h-8 translate-x-1" />
                </div>
                <p className="text-slate-500 text-center max-w-xs italic font-medium">"Tell me about a time you solved a complex technical problem..."</p>
                
                {/* Simulated AI Feedback Bubbles */}
                <div className="absolute top-4 right-4 bg-white shadow-lg rounded-xl p-3 border border-blue-50 animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold">Great Eye Contact</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-xl p-3 border border-yellow-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs font-bold">Try to reduce 'Um/Uh'</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-8 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">88%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sentiment Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">92/100</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grammar Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="bg-gradient-to-br from-secondary to-blue-700 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <h2 className="text-4xl font-bold mb-6">Your Success Begins with a Single Word.</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto"> Join thousands of students who are mastering the art of communication with VoxVignan.</p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto bg-white text-secondary px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg active:scale-95">
                Start Your Journey Now
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto text-white border border-white/30 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors active:scale-95">
                Existing Member
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8">
              <MetricItem icon={<Users />} label="10k+ Users" />
              <MetricItem icon={<ShieldCheck />} label="Verified AI" />
              <MetricItem icon={<Award />} label="Certified Growth" />
            </div>
          </div>
        </section>

      </main>

      <footer className="py-12 border-t border-slate-100 bg-white text-center">
        <p className="text-slate-400 text-sm">© 2026 VoxVignan AI • Excellence through better communication.</p>
      </footer>
    </div>
  );
}

function ChallengeItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
      <div className="mt-1 w-2 h-2 rounded-full bg-red-400 group-hover:scale-150 transition-transform"></div>
      <div>
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function SuccessStep({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
      <div className="text-6xl font-black text-white/5 mb-[-2rem] group-hover:text-blue-400/20 transition-colors">{number}</div>
      <div className="mb-6 p-4 bg-blue-500/10 rounded-2xl text-blue-400">
        {icon}
      </div>
      <h4 className="text-2xl font-bold mb-4">{title}</h4>
      <p className="text-blue-100/70 leading-relaxed text-sm">{description}</p>
    </div>
  );
}


function MetricItem({ icon, label }: { icon: React.ReactElement, label: string }) {
  return (
    <div className="flex items-center space-x-2 text-blue-100">
      {React.cloneElement(icon, { className: "w-4 h-4" } as any)}
      <span className="text-xs font-bold tracking-widest uppercase">{label}</span>
    </div>
  );
}
