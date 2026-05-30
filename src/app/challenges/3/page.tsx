"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Video, Upload, FileText, Loader2, Play, Square, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { saveChallengeProgress } from '@/lib/progress';

export default function Day3Challenge() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'setup' | 'presenting' | 'report'>('setup');
  
  const [topic, setTopic] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [report, setReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const generateTopic = async () => {
    setIsGenerating(true);
    try {
      // Mocking AI topic generation for speed, or we can use an API later
      const topics = [
        "The Future of Artificial Intelligence in Healthcare",
        "How Sustainable Energy Will Reshape the Economy",
        "The Impact of Remote Work on Corporate Culture",
        "Cybersecurity Challenges in the Modern Era"
      ];
      setTopic(topics[Math.floor(Math.random() * topics.length)]);
      setStep('presenting');
      setTimeout(startCamera, 500);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setTopic("Custom Presentation");
      setStep('presenting');
      setTimeout(startCamera, 500);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Speech Recognition
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
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera permissions are required for the presentation challenge.");
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

  const finishPresentation = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    // Stop recording and camera logic
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const res = await fetch('/api/challenges/presentation/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          transcript: transcript || "I forgot what to say.",
          userId: user?.uid 
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(data.error || 'AI evaluation failed. Please try again.');
        return;
      }
      setReport(data);
      setStep('report');
      if (user?.uid) {
        await saveChallengeProgress(user.uid, 3, data.overallScore, data.overallScore >= 80 ? "Public Speaker" : undefined);
      }
    } catch (error) {
      console.error(error);
      setApiError('Failed to connect to the AI service. Please check your connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background-gray pb-12 flex flex-col">
      <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-100 flex items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-primary transition-colors flex items-center mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </Link>
        <span className="font-bold text-lg text-primary mr-2">DAY 3</span>
        <span className="text-gray-400">|</span>
        <span className="font-medium text-gray-700 ml-2">Presentation Pro</span>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-7xl mx-auto w-full">
        {apiError && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="font-bold text-sm">Evaluation Unavailable</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}
        {step === 'setup' && (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-2xl w-full">
              <h1 className="text-3xl font-extrabold text-primary mb-4">Set up your Presentation</h1>
              <p className="text-gray-600 mb-10">You can either upload a PDF of your existing slides, or let our AI generate a spontaneous topic for you to present.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={generateTopic}
                  disabled={isGenerating}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-secondary rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  {isGenerating ? <Loader2 className="w-10 h-10 text-secondary mb-4 animate-spin" /> : <FileText className="w-10 h-10 text-secondary mb-4" />}
                  <span className="font-bold text-primary">Generate AI Topic</span>
                  <span className="text-sm text-gray-500 mt-2">Speak on a random professional subject</span>
                </button>
                
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-500 mb-4" />
                  <span className="font-bold text-primary">Upload PDF/PPT</span>
                  <span className="text-sm text-gray-500 mt-2">Present your own slides</span>
                  <input type="file" accept=".pdf, .ppt, .pptx" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 'presenting' && (
          <div className="flex flex-col md:flex-row gap-6 flex-1 mt-4 h-[calc(100vh-140px)]">
            {/* Left: Slides / Topic */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative min-h-[400px]">
              <div className="bg-primary text-white p-4 font-bold max-h-16 flex items-center shadow-md z-10 w-full truncate">
                Topic: {topic}
              </div>
              <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden h-full">
                {pdfUrl ? (
                  <iframe src={pdfUrl} className="w-full h-full border-none" title="Presentation Slides" />
                ) : (
                  <div className="p-12 text-center">
                    <h2 className="text-4xl font-extrabold text-primary mb-4 leading-tight">{topic}</h2>
                    <p className="text-xl text-gray-500 italic">Please deliver a 2-3 minute presentation on this topic.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Camera Preview & Controls */}
            <div className="w-full md:w-96 flex flex-col gap-4">
              <div className="bg-black rounded-2xl shadow-sm overflow-hidden aspect-video relative flex-shrink-0 border border-gray-800">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform -scale-x-100"
                ></video>
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-bold">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>REC</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase">Live Transcript</h3>
                  <div className="bg-gray-50 h-32 overflow-y-auto p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
                    {transcript || <span className="italic text-gray-400">Waiting for speech...</span>}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    onClick={toggleRecording}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors ${
                      isRecording ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-secondary text-white hover:bg-primary'
                    }`}
                  >
                    {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isRecording ? 'Pause Recording' : 'Start Recording'}</span>
                  </button>

                  <button 
                    onClick={finishPresentation}
                    disabled={isAnalyzing || !transcript}
                    className="w-full py-4 rounded-xl font-bold bg-primary text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Content...</> : 'Finish & Evaluate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'report' && report && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl w-full mx-auto mt-4">
             <div className="flex items-center justify-between mb-8 border-b pb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  Presentation Evaluation
                </h2>
                <div className="text-center bg-background-soft px-4 py-2 rounded-lg text-primary font-bold">
                  Score: <span className="text-2xl text-secondary">{report.overallScore}</span>/100
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 text-blue-900 shadow-sm leading-relaxed">
                <span className="font-bold block mb-2 text-sm uppercase text-blue-800">Content Accuracy Status</span>
                {report.inaccuracies.length === 0 ? (
                  <div className="flex items-center text-green-700 font-bold border-b border-blue-100 pb-2 mb-2">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Content is highly accurate and relevant to the topic.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="font-bold text-red-700">Identified inaccuracies:</div>
                    <ul className="list-disc pl-5 space-y-2 text-red-800">
                      {report.inaccuracies.map((mistake: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-bold">Error:</span> {mistake.mistake} <br/>
                          <span className="font-bold text-green-700">Correct Fact:</span> <span className="text-green-800">{mistake.correction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <MetricCard label="Confidence" score={report.metrics.confidence} />
                  <MetricCard label="Professionalism" score={report.metrics.professionalism} />
                  <MetricCard label="Engagement" score={report.metrics.engagement} />
                  <MetricCard label="Flow" score={report.metrics.flow} />
              </div>

              <div className="space-y-6">
                 <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Original Transcript</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 italic">
                    "{transcript}"
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Model Professional Answer</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-800 font-medium">
                    "{report.modelAnswer}"
                  </div>
                </div>
                 <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Feedback</h3>
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
    <div className="bg-white border border-gray-100 rounded-lg p-4 text-center shadow-sm">
      <div className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{score}/100</div>
    </div>
  );
}
