"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Square, Send, Users, Circle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { saveChallengeProgress } from '@/lib/progress';

interface Message {
  id: number;
  speaker: string;
  role: 'moderator' | 'ai1' | 'ai2' | 'ai3' | 'user';
  content: string;
}

const TURN_SEQUENCE = [
  { speaker: 'Moderator', role: 'moderator' },
  { speaker: 'Alex', role: 'ai1' },
  { speaker: 'User', role: 'user' },
  { speaker: 'Priya', role: 'ai2' },
  { speaker: 'John', role: 'ai3' },
  { speaker: 'Alex', role: 'ai1' },
  { speaker: 'User', role: 'user' },
  { speaker: 'Priya', role: 'ai2' },
  { speaker: 'Moderator', role: 'moderator' }
] as const;

export default function Day4Challenge() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [topic] = useState("Is AI a threat to humanity or a tool for unprecedented growth?");
  const [history, setHistory] = useState<Message[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  // Setup generic Speech Recognition
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

  // Handle the turns
  useEffect(() => {
    if (turnIndex >= TURN_SEQUENCE.length) {
      if (!isEvaluating && !report && history.length > 0) {
        evaluateGD();
      }
      return;
    }

    const currentTurn = TURN_SEQUENCE[turnIndex];
    setActiveSpeaker(currentTurn.speaker);

    if (currentTurn.speaker !== 'User') {
      // Trigger AI turn
      generateAIResponse(currentTurn.speaker, currentTurn.role);
    }
    // If User, we wait for input
  }, [turnIndex]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const speak = (text: string, role: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Assign different voices/pitches to different participants
    if (role === 'moderator') {
      utterance.pitch = 0.9;
      utterance.rate = 1.0;
    } else if (role === 'ai1') {
      utterance.pitch = 1.2;
      utterance.rate = 1.1;
    } else if (role === 'ai2') {
      utterance.pitch = 1.1;
      utterance.rate = 0.95;
    } else if (role === 'ai3') {
      utterance.pitch = 0.8;
      utterance.rate = 1.05;
    }

    window.speechSynthesis.speak(utterance);
  };

  const generateAIResponse = async (speaker: string, role: string) => {
    try {
      const res = await fetch('/api/challenges/gd/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          history,
          expectedSpeaker: speaker
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || 'AI response generation failed.');
        return;
      }
      
      const newContent = data.content;
      setHistory(prev => [...prev, {
        id: Date.now(),
        speaker,
        role: role as any,
        content: newContent
      }]);
      
      // Trigger speaking
      speak(newContent, role);
      
      setTurnIndex(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setApiError('Failed to connect to the AI service.');
    }
  };

  const submitUserTurn = () => {
    if (!transcript.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setHistory(prev => [...prev, {
      id: Date.now(),
      speaker: 'User',
      role: 'user',
      content: transcript
    }]);

    setTranscript('');
    setTurnIndex(prev => prev + 1);
  };

  const evaluateGD = async () => {
    window.speechSynthesis.cancel();
    setIsEvaluating(true);
    setActiveSpeaker(null);
    try {
      const res = await fetch('/api/challenges/gd/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          transcript: history,
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
        await saveChallengeProgress(user.uid, 4, data.overallScore, data.overallScore >= 80 ? "Team Leader" : undefined);
      }
    } catch (e) {
      console.error(e);
      setApiError('Failed to connect to the AI service.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Clean up media stream and speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      window.speechSynthesis.cancel(); // Stop AI speaking when user starts
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background-gray">
      <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-gray-500 hover:text-primary transition-colors flex items-center mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </Link>
          <span className="font-bold text-lg text-primary mr-2">DAY 4</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium text-gray-700 ml-2">Group Discussion Simulator</span>
        </div>
      </header>

      <main className="flex-1 flex max-w-7xl mx-auto w-full p-6 gap-6 h-[calc(100vh-73px)]">
        {apiError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-[600px] bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start shadow-lg">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="font-bold text-sm">AI Service Unavailable</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}
        
        {/* Left Sidebar - Participants */}
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
          <h2 className="font-bold text-primary mb-4 flex items-center text-sm uppercase tracking-wider border-b pb-2">
            <Users className="w-4 h-4 mr-2 text-secondary" />
            Participants
          </h2>
          <div className="space-y-4">
             {['Moderator', 'Alex', 'Priya', 'John', 'User'].map((p) => {
               const isActive = activeSpeaker === p;
               return (
                 <div key={p} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 border border-blue-100' : ''}`}>
                   <div className="relative">
                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                       {p[0]}
                     </div>
                     {isActive && <Circle className="w-3 h-3 text-secondary absolute -bottom-1 -right-1 fill-current animate-pulse" />}
                   </div>
                   <div>
                     <div className="text-sm font-bold text-primary">{p}</div>
                     <div className="text-xs text-gray-500">{p === 'User' ? 'You' : p === 'Moderator' ? 'AI Evaluator' : 'AI Participant'}</div>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>

        {/* Main Panel - Rules / Chat / Report */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          
          <div className="bg-primary text-white px-6 py-4 border-b border-primary-dark">
            <h3 className="font-bold">Topic: {topic}</h3>
          </div>

          {!report && !isEvaluating ? (
            <>
              {/* Chat Transcript Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {history.map((msg) => {
                   const isUser = msg.role === 'user';
                   const isMod = msg.role === 'moderator';
                   return (
                     <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs font-bold text-gray-500 mb-1 px-1">{msg.speaker}</span>
                        <div className={`p-4 rounded-xl max-w-[80%] ${
                          isUser ? 'bg-secondary text-white rounded-tr-none' : 
                          isMod ? 'bg-gray-800 text-white rounded-tl-none border border-gray-700' :
                          'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                     </div>
                   )
                })}
                
                {/* Active AI typing indicator */}
                {activeSpeaker && activeSpeaker !== 'User' && (
                   <div className="flex items-center space-x-2 text-gray-400 text-sm italic py-4">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     <span>{activeSpeaker} is typing...</span>
                   </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* User Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                {activeSpeaker === 'User' ? (
                  <div className="flex items-end space-x-3">
                    <button 
                      onClick={toggleRecording}
                      className={`p-4 rounded-full transition-colors ${
                        isRecording ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-secondary focus-within:border-transparent transition-all">
                      <textarea
                        className="w-full h-14 max-h-32 p-4 text-sm text-gray-800 outline-none resize-none align-middle"
                        placeholder="It's your turn to speak. Try recording, or type your response..."
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={submitUserTurn}
                      disabled={!transcript.trim()}
                      className="px-6 py-4 bg-secondary text-white font-bold rounded-xl disabled:opacity-50 hover:bg-primary transition-colors flex items-center"
                    >
                      <span>Send</span>
                      <Send className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                ) : (
                  <div className="h-14 flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50 rounded-xl border border-gray-100">
                    Listen closely. It is {activeSpeaker}'s turn to speak.
                  </div>
                )}
              </div>
            </>
          ) : isEvaluating ? (
            <div className="flex-1 flex flex-col items-center justify-center">
               <Loader2 className="w-10 h-10 text-secondary animate-spin mb-4" />
               <p className="text-xl font-bold text-primary">Evaluating your performance...</p>
            </div>
          ) : report && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-8 border-b pb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  GD Performance Report
                </h2>
                <div className="text-center bg-background-soft px-4 py-2 rounded-lg text-primary font-bold border border-blue-100">
                  Score: <span className="text-2xl text-secondary">{report.overallScore}</span>/100
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                  <MetricCard label="Leadership" score={report.metrics.leadership} />
                  <MetricCard label="Confidence" score={report.metrics.confidence} />
                  <MetricCard label="Logic" score={report.metrics.logicalThinking} />
                  <MetricCard label="Comm." score={report.metrics.communication} />
                  <MetricCard label="Arguments" score={report.metrics.argumentQuality} />
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Best Argument Unlocked</h3>
                  <div className="text-blue-800 italic font-medium">"{report.bestArgument}"</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Detailed Feedback</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700">
                    {report.feedback.map((tip: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
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
          )}

        </div>
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
      <div className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</div>
      <div className={`text-xl font-extrabold ${color}`}>{score}</div>
    </div>
  );
}
