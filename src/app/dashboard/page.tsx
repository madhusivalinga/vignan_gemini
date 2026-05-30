"use client";

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Trophy, Flame, Target, Mic, BarChart2, Calendar, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Real data calculations
  const completedDays = userProfile?.completedDays || [];
  const completedCount = completedDays.length;
  const progressPercentage = Math.round((completedCount / 7) * 100);
  const streak = userProfile?.streak || 0;

  return (
    <div className="min-h-screen bg-background-gray pb-12">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-8 flex justify-between items-center">
        <div className="font-bold text-2xl text-primary tracking-tight">VoxVignan AI</div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
            <span className="font-bold">{streak} Day Streak</span>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {/* Welcome Banner */}
        <section className="bg-primary text-white rounded-2xl p-8 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-primary to-secondary">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.name?.split(' ')[0] || 'Student'}!</h1>
            <p className="opacity-90">Ready to conquer your next communication challenge?</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="bg-white/20 px-6 py-3 rounded-lg text-center backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Comm. Score</div>
              <div className="text-3xl font-extrabold">{userProfile?.totalScore || 0}</div>
            </div>
            <div className="bg-white/20 px-6 py-3 rounded-lg text-center backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Badges</div>
              <div className="text-3xl font-extrabold">{userProfile?.badges?.length || 0}</div>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Progress & Stats */}
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-accent" />
                Weekly Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">Challenges Completed</span>
                    <span className="font-bold text-primary">{completedCount}/7</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-secondary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">Monthly Goal</span>
                    <span className="font-bold text-primary">{userProfile?.monthlyGoal || 80}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-accent h-2.5 rounded-full" style={{ width: `${userProfile?.monthlyGoal || 80}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Achievements
              </h2>
              {userProfile?.badges && userProfile.badges.length > 0 ? (
                <div className="space-y-3">
                  {userProfile.badges.map((badge: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      <span className="font-medium text-gray-800">{badge}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Complete your first challenge to earn a badge!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Challenges */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-primary">Your 7-Day Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <ChallengeCard 
                day={1} 
                title="Introduction Challenge" 
                status={completedDays.includes(1) ? 'completed' : 'pending'} 
                icon={<Mic />}
              />
              <ChallengeCard 
                day={2} 
                title="Active Listening" 
                status={completedDays.includes(2) ? 'completed' : 'pending'} 
                icon={<BarChart2 />}
              />
              <ChallengeCard 
                day={3} 
                title="The Elevator Pitch" 
                status={completedDays.includes(3) ? 'completed' : 'pending'} 
                icon={<Calendar />}
              />
              <ChallengeCard 
                day={4} 
                title="Mock Interview (Basic)" 
                status={completedDays.includes(4) ? 'completed' : 'pending'} 
                icon={<Mic />}
              />
              <ChallengeCard 
                day={5} 
                title="Technical Assessment" 
                status={completedDays.includes(5) ? 'completed' : 'pending'} 
                icon={<BarChart2 />}
              />
              <ChallengeCard 
                day={6} 
                title="HR & Behavioral" 
                status={completedDays.includes(6) ? 'completed' : 'pending'} 
                icon={<Calendar />}
              />
              <ChallengeCard 
                day={7} 
                title="Final Presentation" 
                status={completedDays.includes(7) ? 'completed' : 'pending'} 
                icon={<Mic />}
              />
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <p className="font-medium text-center">More Industry Challenges</p>
                <p className="text-sm">Coming Soon</p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ChallengeCard({ day, title, status, icon }: { day: number, title: string, status: 'completed'|'pending'|'locked', icon: React.ReactNode }) {
  const router = useRouter();
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  
  const handleClick = () => {
    if (!isLocked) {
      router.push(`/challenges/${day}`);
    }
  };

  return (
    <div 
      className={`p-6 rounded-xl border ${isLocked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer'} relative overflow-hidden`}
      onClick={handleClick}
    >
      <div className={`flex items-center justify-between mb-4 ${isLocked ? 'opacity-50' : ''}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : isLocked ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-secondary'}`}>
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : isLocked ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-secondary'}`}>
          DAY {day}
        </span>
      </div>
      <h3 className={`text-lg font-bold mb-1 ${isLocked ? 'text-gray-400' : 'text-primary'}`}>{title}</h3>
      <div className="mt-4">
        {isCompleted ? (
          <button className="w-full py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200" disabled>
            Completed
          </button>
        ) : isLocked ? (
          <button className="w-full py-2 bg-gray-100 text-gray-400 font-bold rounded-lg cursor-not-allowed" disabled>
            Locked
          </button>
        ) : (
          <button className="w-full py-2 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition-colors">
            Start Challenge
          </button>
        )}
      </div>
    </div>
  );
}
