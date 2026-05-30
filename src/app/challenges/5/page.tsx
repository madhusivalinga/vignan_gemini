"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mic, Square, ChevronRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { saveChallengeProgress } from '@/lib/progress';

const SKILLS = [
  "Python", "Java", "C++", "JavaScript", "TypeScript", 
  "DSA", "DBMS", "SQL", "OOPs", "Operating Systems", 
  "Computer Networks", "AI/ML", "Web Development"
];

interface Question {
  id: string;
  text: string;
}

interface Answer {
  questionId: string;
  originalText: string;
  question: string;
  answerTranscript: string;
}

interface Report {
  overallScore: number;
  metrics: {
    technicalAccuracy: number;
    clarity: number;
  };
  results: Array<{
    isCorrect: boolean;
    modelAnswer: string;
    feedback: string;
  }>;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [key: number]: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Day5Challenge() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'setup' | 'interview' | 'report'>('setup');
  const [selectedSkill, setSelectedSkill] = useState('');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition() as SpeechRecognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setTranscript(prev => prev + ' ' + finalTranscript.trim());
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const TOTAL_QUESTIONS = 3;

  const startInterview = async () => {
    if (!selectedSkill) return;
    setIsGenerating(true);
    setApiError(null);
    setAnswers([]);
    setCurrentQIdx(0);
    try {
      const res = await fetch('/api/challenges/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'technical', skill: selectedSkill })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || 'Failed to generate questions.');
        return;
      }
      // API now returns just the first question for adaptive flow
      setQuestions([data.question]);
      setStep('interview');
    } catch (e) {
      console.error(e);
      setApiError('Failed to connect to the AI service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const nextQuestion = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const currentQ = questions[currentQIdx];
    const userAns = transcript || "No answer provided";
    const currentAnswer = { 
      questionId: currentQ.id, 
      originalText: currentQ.text, 
      question: currentQ.text, 
      answerTranscript: userAns 
    };
    
    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);
    setTranscript('');
    
    if (updatedAnswers.length < TOTAL_QUESTIONS) {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/challenges/interview/adaptive-next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            skill: selectedSkill, 
            history: updatedAnswers 
          })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setApiError(data.error || 'Failed to generate the next adaptive question.');
          return;
        }
        setQuestions(prev => [...prev, data.question]);
        setCurrentQIdx(prev => prev + 1);
      } catch (e) {
        setApiError('Connection error during adaptive generation.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Finished all 3 questions
      setIsEvaluating(true);
      setStep('report');
      try {
        const res = await fetch('/api/challenges/interview/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'technical', qna: updatedAnswers })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setApiError(data.error || 'AI evaluation failed.');
          return;
        }
        setReport(data);
        if (user?.uid) {
          await saveChallengeProgress(user.uid, 5, data.overallScore, data.overallScore >= 85 ? "Tech Wizard" : undefined);
        }
      } catch (e) {
        console.error(e);
        setApiError('Failed to connect to the AI service.');
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background-gray pb-12">
      <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-100 flex items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-primary transition-colors flex items-center mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </Link>
        <span className="font-bold text-lg text-primary mr-2">DAY 5</span>
        <span className="text-gray-400">|</span>
        <span className="font-medium text-gray-700 ml-2">Technical Interview Challenge</span>
      </header>

      <main className="flex-1 flex max-w-4xl mx-auto px-4 mt-8 w-full flex-col">
        {apiError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="font-bold text-sm">Evaluation Unavailable</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}
        {step === 'setup' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full text-center">
            <h1 className="text-3xl font-extrabold text-primary mb-4">Are you Technical Interview Ready?</h1>
            <p className="text-gray-600 mb-10 max-w-lg mx-auto">Select a core subject or language. Our AI will dynamically generate coding scenarios and conceptual queries based on real industry standards.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-3 rounded-lg border font-medium transition-colors ${
                    selectedSkill === skill 
                    ? 'bg-blue-50 border-secondary text-secondary' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <button 
              onClick={startInterview}
              disabled={!selectedSkill || isGenerating}
              className="bg-secondary text-white font-bold py-3 px-10 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 inline-flex items-center"
            >
              {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing...</> : 'Start Technical Assessment'}
            </button>
          </div>
        )}

        {step === 'interview' && questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full flex flex-col relative h-[600px]">
             <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 border-b pb-4">
               <span>Question {currentQIdx + 1} of {TOTAL_QUESTIONS}</span>
               <span className="text-secondary">{selectedSkill} Assessment</span>
             </div>

             <div className="flex-1 overflow-y-auto pb-4">
               <h2 className="text-2xl font-bold text-primary mb-6 leading-tight">
                 {questions[currentQIdx].text}
               </h2>
               
               <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl min-h-[150px]">
                  <span className="block text-xs font-bold uppercase text-gray-500 mb-2">Live Transcription</span>
                  {transcript ? (
                    <p className="text-gray-800 leading-relaxed">{transcript}</p>
                  ) : (
                    <p className="text-gray-400 italic">Hit 'Start Answering' and speak clearly.</p>
                  )}
               </div>
             </div>

             <div className="border-t pt-6 flex justify-between items-center mt-auto">
               <button 
                  onClick={toggleRecording}
                  className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-colors ${
                    isRecording ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span>{isRecording ? 'Pause Recording' : 'Start Answering'}</span>
                </button>

                <button 
                  onClick={nextQuestion}
                  className="px-8 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-primary transition-colors flex items-center"
                >
                  <span>{currentQIdx === questions.length - 1 ? 'Finish Interview' : 'Next Question'}</span>
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
             </div>
          </div>
        )}

        {step === 'report' && (
          <div className="w-full">
            {isEvaluating ? (
               <div className="flex flex-col items-center justify-center h-[50vh]">
                 <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
                 <p className="text-xl font-bold text-primary">Evaluating technical accuracy...</p>
                 <p className="text-gray-500">Cross-referencing your answers with engineering standards.</p>
               </div>
            ) : report && (
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full">
                  <div className="flex items-center justify-between mb-8 border-b pb-6">
                    <h2 className="text-2xl font-bold text-primary flex items-center">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                      Technical Evaluation Report
                    </h2>
                    <div className="text-center bg-background-soft px-4 py-2 rounded-lg text-primary font-bold border border-blue-100">
                      Score: <span className="text-2xl text-secondary">{report.overallScore}</span>/100
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
                      <div className="text-sm font-bold uppercase text-blue-800 mb-2">Technical Accuracy</div>
                      <div className="text-4xl font-extrabold text-blue-900">{report.metrics.technicalAccuracy}/100</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
                      <div className="text-sm font-bold uppercase text-blue-800 mb-2">Communication Clarity</div>
                      <div className="text-4xl font-extrabold text-blue-900">{report.metrics.clarity}/100</div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="font-bold text-xl text-primary border-b pb-2">Question Breakdown</h3>
                    {report.results.map((res, idx) => {
                      return (
                        <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-start">
                             <span className="bg-primary text-white text-xs w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                               {idx + 1}
                             </span>
                             {answers[idx].question}
                          </h4>
                          
                          <div className="pl-9 space-y-4">
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Your Answer</span>
                              <div className="text-gray-700 italic border-l-4 border-gray-300 pl-4 py-1">"{answers[idx].answerTranscript}"</div>
                            </div>
                            
                            <div className={res.isCorrect ? 'text-green-700' : 'text-red-700'}>
                              <span className="font-bold">Verdict: </span> {res.isCorrect ? 'Accurate' : 'Inaccurate / Flawed Concept'}
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Model Explanation</span>
                              <div className="text-gray-800 text-sm">{res.modelAnswer}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Feedback</span>
                              <div className="text-gray-800 text-sm">{res.feedback}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-10 flex justify-center">
                    <Link href="/dashboard" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90">
                      Return to Dashboard
                    </Link>
                  </div>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
