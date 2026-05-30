"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mic, Square, CheckCircle, Crosshair } from 'lucide-react';
import Link from 'next/link';
import { saveChallengeProgress } from '@/lib/progress';

export default function Day7Challenge() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [scenario, setScenario] = useState<any>(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.8;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    // Fetch scenario only once
    if (hasFetched.current) return;
    
    const fetchScenario = async () => {
      hasFetched.current = true;
      try {
        const res = await fetch('/api/challenges/scenario/generate');
        const data = await res.json();
        if (!res.ok || data.error) {
          setApiError(data.error || 'Failed to generate scenario.');
          hasFetched.current = false; // Allow retry on failure
          return;
        }
        setScenario(data);
        speak(`Situation: ${data.title}. ${data.scenarioDescription}. Your goal is: ${data.goal}`);
      } catch (e) {
        console.error("Failed to load scenario", e);
        setApiError('Failed to connect to the AI service. Please try again later.');
        hasFetched.current = false;
      } finally {
        setIsLoadingScenario(false);
      }
    };
    
    if (user) fetchScenario();
  }, [user]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript.trim());
        }
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      window.speechSynthesis.cancel();
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const submitResponse = async () => {
    if (!transcript.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    window.speechSynthesis.cancel();
    setIsEvaluating(true);
    setApiError(null);
    try {
      const res = await fetch('/api/challenges/scenario/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenario,
          transcript: transcript,
          userId: user?.uid 
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || 'AI evaluation failed.');
        return;
      }
      setReport(data);
      if (user?.uid) {
        await saveChallengeProgress(user.uid, 7, data.overallScore, data.overallScore >= 80 ? "Master Communicator" : undefined);
      }
    } catch (e) {
      console.error(e);
      setApiError('Failed to connect to the AI service.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background-gray pb-12 flex flex-col">
      <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-100 flex items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-primary transition-colors flex items-center mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </Link>
        <span className="font-bold text-lg text-primary mr-2">DAY 7</span>
        <span className="text-gray-400">|</span>
        <span className="font-medium text-gray-700 ml-2">The Ultimate Communication Challenge</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 w-full flex-1 flex flex-col">
        {apiError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="font-bold text-sm">Evaluation Unavailable</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}
        {isLoadingScenario ? (
          <div className="flex flex-col flex-1 items-center justify-center">
             <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
             <p className="text-xl font-bold text-primary">Formulating your ultimate scenario...</p>
          </div>
        ) : !report && !isEvaluating && scenario ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full overflow-hidden">
            <div className="bg-primary text-white p-8">
              <h1 className="text-3xl font-extrabold mb-2">{scenario.title}</h1>
              <p className="text-lg opacity-90 leading-relaxed font-light">{scenario.scenarioDescription}</p>
            </div>
            
            <div className="p-8 pb-4">
              <div className="bg-blue-50 border-l-4 border-secondary p-4 rounded text-blue-900 font-medium flex items-center mb-8">
                <Crosshair className="w-5 h-5 mr-3 text-secondary flex-shrink-0" />
                <span>{scenario.goal}</span>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 min-h-[150px] mb-8">
                <span className="block text-xs font-bold uppercase text-gray-500 mb-2">Live Response Transcript</span>
                {transcript ? (
                  <p className="text-gray-800 leading-relaxed tracking-wide">{transcript}</p>
                ) : (
                  <p className="text-gray-400 italic">Hit 'Record' and deliver your masterful response.</p>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                <button 
                  onClick={toggleRecording}
                  className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-colors border ${
                    isRecording 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span>{isRecording ? 'Stop Recording' : 'Record Final Response'}</span>
                </button>
                
                {transcript && !isRecording && (
                  <button 
                    onClick={submitResponse}
                    className="bg-secondary text-white px-10 py-3 rounded-xl font-bold hover:bg-primary transition-colors shadow-sm"
                  >
                    Submit the Ultimate Challenge
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : isEvaluating ? (
          <div className="flex flex-col flex-1 items-center justify-center">
             <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
             <p className="text-xl font-bold text-primary">Executive Review in Progress...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full">
            <div className="flex items-center justify-between mb-8 border-b pb-6">
              <h2 className="text-2xl font-bold text-primary flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                Executive Feedback Report
              </h2>
              <div className="text-center bg-background-soft px-4 py-2 rounded-lg text-primary font-bold border border-blue-100">
                Final Score: <span className="text-2xl text-secondary">{report.overallScore}</span>/100
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
               <MetricCard label="COMMUNICATION" score={report.metrics.communication} />
               <MetricCard label="LEADERSHIP" score={report.metrics.leadership} />
               <MetricCard label="CONFIDENCE" score={report.metrics.confidence} />
               <MetricCard label="PROFESSIONAL" score={report.metrics.professionalism} />
               <MetricCard label="DECISION" score={report.metrics.decisionMaking} />
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Answer Transcript</h3>
                <p className="text-gray-700 italic border-l-4 border-gray-300 pl-4 py-1 leading-relaxed">"{transcript}"</p>
              </div>

              <div className="bg-secondary text-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  The Executive Gold Standard
                </h3>
                <p className="font-medium text-lg leading-relaxed text-blue-50">"{report.modelAnswer}"</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Analysis & Action Items</h3>
                <ul className="list-disc pl-5 space-y-3 text-gray-700">
                  {report.feedback.map((tip: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/dashboard" className="bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-opacity-90 shadow-md">
                Complete Program & Return to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, score }: { label: string, score: number }) {
  let color = 'text-green-500';
  if (score < 60) color = 'text-red-500';
  else if (score < 80) color = 'text-yellow-500';
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 text-center shadow-sm">
      <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">{label}</div>
      <div className={`text-xl font-extrabold ${color}`}>{score || 0}</div>
    </div>
  );
}
