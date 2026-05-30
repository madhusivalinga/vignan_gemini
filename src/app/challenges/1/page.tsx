"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Mic, Square, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { saveChallengeProgress } from '@/lib/progress';

// SpeechRecognition type definitions
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Day1Challenge() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Browser doesn't support speech recognition. Try using Google Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const submitTranscript = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    setApiError(null);
    try {
      const res = await fetch('/api/evaluate/introduction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: transcript,
          userId: user?.uid 
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || 'AI evaluation failed. Please try again.');
        return;
      }
      setReport(data);
      // Save progress to Firestore
      if (user?.uid) {
        await saveChallengeProgress(user.uid, 1, data.overallScore, data.overallScore >= 80 ? "Eloquent Starter" : undefined);
      }
    } catch (error) {
      console.error("Error evaluating:", error);
      setApiError('Failed to connect to the AI service. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background-gray pb-12">
      <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-100 flex items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-primary transition-colors flex items-center mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </Link>
        <span className="font-bold text-lg text-primary mr-2">DAY 1</span>
        <span className="text-gray-400">|</span>
        <span className="font-medium text-gray-700 ml-2">Introduction Challenge</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {apiError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="font-bold text-sm">Evaluation Unavailable</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}
        {!report ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-primary">
            <h1 className="text-3xl font-extrabold mb-4">Introduce Yourself</h1>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Speak about who you are, your background, and your career aspirations. Act as if you are introducing yourself to an interviewer.
            </p>

            <div className="mb-8">
              <button 
                onClick={toggleRecording}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto transition-all ${
                  isRecording 
                  ? 'bg-red-50 text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] border-2 border-red-500 animate-pulse' 
                  : 'bg-primary text-white shadow-xl hover:bg-opacity-90'
                }`}
              >
                {isRecording ? <Square className="w-10 h-10 mb-2" fill="currentColor" /> : <Mic className="w-10 h-10 mb-2" />}
                <span className="font-bold text-sm tracking-widest">{isRecording ? 'STOP' : 'START'}</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 min-h-[150px] text-left border border-gray-100 mb-6 relative">
              {transcript ? (
                <p className="text-gray-800 leading-relaxed">{transcript}</p>
              ) : (
                <p className="text-gray-400 italic">Your spoken text will appear here...</p>
              )}
            </div>

            {transcript && !isRecording && (
              <button 
                onClick={submitTranscript}
                disabled={isProcessing}
                className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition-colors flex items-center justify-center mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing your speech...
                  </>
                ) : (
                  <>Analyze Communication</>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8 border-b pb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  Analysis Report
                </h2>
                <div className="text-center bg-background-soft px-4 py-2 rounded-lg text-primary font-bold">
                  Score: <span className="text-2xl text-secondary">{report.overallScore}</span>/100
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Original Speech</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700">
                    "{report.originalText}"
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Corrected Grammar</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-800">
                    "{report.correctedText}"
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Professional Version</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900 shadow-sm font-medium">
                    "{report.professionalText}"
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Fluency" score={report.metrics.fluency} />
                  <MetricCard label="Grammar" score={report.metrics.grammar} />
                  <MetricCard label="Clarity" score={report.metrics.clarity} />
                  <MetricCard label="Vocabulary" score={report.metrics.vocabulary} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">AI Feedback & Tips</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {report.feedback.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-10 flex justify-center">
                <Link href="/dashboard" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, score }: { label: string, score: number }) {
  // Determine color based on score
  let color = 'text-green-500';
  if (score < 60) color = 'text-red-500';
  else if (score < 80) color = 'text-yellow-500';

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 text-center shadow-sm">
      <div className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{score}/100</div>
    </div>
  );
}
