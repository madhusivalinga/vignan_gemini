"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Play, Loader2, ArrowLeft, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { saveChallengeProgress } from '@/lib/progress';

export default function Day2Challenge() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [taskData, setTaskData] = useState<any>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch task
    const fetchTask = async () => {
      try {
        const res = await fetch('/api/challenges/listening/generate');
        const data = await res.json();
        if (!res.ok || data.error) {
          setApiError(data.error || 'Failed to generate listening task.');
          return;
        }
        setTaskData(data);
      } catch (e) {
        console.error("Failed to load task", e);
        setApiError('Failed to connect to the AI service. Please try again later.');
      } finally {
        setIsLoadingTask(false);
      }
    };
    if (user) fetchTask();
  }, [user]);

  const playStory = () => {
    if (!taskData?.storyText) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(taskData.storyText);
    utterance.rate = 0.9; // Slightly slower for comprehension
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswerChange = (questionId: string, val: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  const submitAnswers = async () => {
    if (!taskData) return;

    window.speechSynthesis.cancel();
    setIsPlaying(false);

    setIsSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch('/api/challenges/listening/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyText: taskData.storyText,
          questions: taskData.questions,
          userAnswers: userAnswers,
          userId: user?.uid 
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || 'AI evaluation failed. Please try again.');
        return;
      }
      setReport(data);
      if (user?.uid) {
        await saveChallengeProgress(user.uid, 2, data.overallScore, data.overallScore >= 90 ? "Sharp Listener" : undefined);
      }
    } catch (e) {
      console.error(e);
      setApiError('Failed to connect to the AI service. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background-gray pb-12">
      <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-100 flex items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-primary transition-colors flex items-center mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </Link>
        <span className="font-bold text-lg text-primary mr-2">DAY 2</span>
        <span className="text-gray-400">|</span>
        <span className="font-medium text-gray-700 ml-2">Active Listening Challenge</span>
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
        {isLoadingTask ? (
          <div className="flex flex-col items-center flex-1 justify-center min-h-[50vh] text-primary">
            <Loader2 className="w-12 h-12 mb-4 animate-spin" />
            <p className="font-bold text-xl">Generating your scenario...</p>
          </div>
        ) : !report ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8 border-b pb-8 text-primary">
              <h1 className="text-3xl font-extrabold mb-4">{taskData.storyTitle}</h1>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                Listen to the story carefully, and then answer the questions below. You can play the audio as many times as you like.
              </p>

              <button 
                onClick={playStory}
                className={`flex items-center mx-auto space-x-2 px-8 py-4 rounded-full font-bold transition-all shadow-md ${
                  isPlaying 
                  ? 'bg-blue-100 text-secondary border border-blue-200'
                  : 'bg-primary text-white hover:bg-opacity-90'
                }`}
              >
                {isPlaying ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Play className="w-6 h-6" />}
                <span>{isPlaying ? 'Playing Audio...' : 'Play Scenario Audio'}</span>
              </button>
            </div>

            <div className="space-y-8">
              {taskData.questions.map((q: any, idx: number) => (
                <div key={q.id} className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                  <label className="block font-bold text-primary text-lg mb-4">
                    {idx + 1}. {q.text}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((option: string) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerChange(q.id, option)}
                        className={`w-full text-left p-4 rounded-lg border transition-all flex items-center space-x-3 ${
                          userAnswers[q.id] === option
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-secondary hover:bg-blue-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${userAnswers[q.id] === option ? 'border-white' : 'border-gray-300'}`}>
                          {userAnswers[q.id] === option && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <span className="font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button 
                onClick={submitAnswers}
                disabled={isSubmitting || Object.keys(userAnswers).length < taskData.questions.length}
                className="bg-secondary text-white font-bold py-3 px-10 rounded-lg hover:bg-primary transition-colors flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Grading Answers...
                  </>
                ) : (
                  <>Submit Answers</>
                )}
              </button>
              {Object.keys(userAnswers).length < taskData.questions.length && (
                  <p className="text-gray-400 text-sm mt-2">Please answer all questions to submit</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8 border-b pb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  Listening Evaluation
                </h2>
                <div className="text-center bg-background-soft px-4 py-2 rounded-lg text-primary font-bold">
                  Score: <span className="text-2xl text-secondary">{report.overallScore}</span>/100
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-primary mb-2">Original Story Transcript</h3>
                <p className="text-gray-700 leading-relaxed italic">"{taskData.storyText}"</p>
              </div>

              <div className="space-y-8">
                {report.results.map((result: any, idx: number) => {
                  const q = taskData.questions.find((x:any) => x.id === result.questionId);
                  return (
                    <div key={result.questionId} className={`p-6 rounded-lg border ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <h3 className="font-bold text-lg mb-4 flex items-start">
                        {result.isCorrect ? <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />}
                        <span className={result.isCorrect ? 'text-green-900' : 'text-red-900'}>Q: {q?.text}</span>
                      </h3>
                      
                      <div className="space-y-3 pl-7">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Your Answer</span>
                          <p className={`font-medium ${result.isCorrect ? 'text-green-800' : 'text-red-800'}`}>{result.userAnswer || <i>(No answer provided)</i>}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Model Answer</span>
                          <p className="text-gray-700">{result.correctAnswer}</p>
                        </div>
                        
                        <div className="pt-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Feedback</span>
                          <p className={`italic ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{result.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Overall Feedback</h3>
                <p className="text-blue-800">{report.feedback}</p>
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
