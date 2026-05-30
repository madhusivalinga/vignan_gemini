"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export default function OnboardingPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [communicationLevel, setCommunicationLevel] = useState('');
  const [careerInterest, setCareerInterest] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    // If they already did onboarding, skip
    if (!loading && userProfile && userProfile.department) {
      router.push('/dashboard');
    }
  }, [user, userProfile, loading, router]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        department,
        year,
        communicationLevel,
        careerInterest
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background-gray flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary">Complete Your Profile</h1>
          <p className="text-gray-500 mt-2">Help us personalize your AI coaching experience.</p>
        </div>
        
        {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleComplete} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-white"
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-white"
                required
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Level</label>
              <select 
                value={communicationLevel} 
                onChange={(e) => setCommunicationLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-white"
                required
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner (Shy Communicator)</option>
                <option value="Intermediate">Intermediate (Average)</option>
                <option value="Advanced">Advanced (Confident)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Career Interest</label>
              <input 
                type="text" 
                value={careerInterest}
                onChange={(e) => setCareerInterest(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                placeholder="e.g. Software Engineer, HR Manager"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-primary transition-colors focus:ring-4 focus:ring-secondary/50 mt-8"
          >
            Start My Journey
          </button>
        </form>
      </div>
    </div>
  );
}
