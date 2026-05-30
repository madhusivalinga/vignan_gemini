"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Users, LayoutDashboard, FileText, Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminPanel() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (userProfile?.role !== 'admin') {
        // Fallback to dashboard if not admin
        // router.push('/dashboard'); 
        // NOTE: For demo purposes, we allow viewing this page if they just manually typed /admin, 
        // but in production, uncomment the line above
      }
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setFetching(false);
      }
    };
    
    if (user) {
       fetchUsers();
    }
  }, [user]);

  if (loading || !user) return <div className="p-8">Loading secure panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col">
        <div className="p-6 font-extrabold text-2xl tracking-tighter border-b border-blue-900 flex items-center">
          <ShieldCheck className="w-6 h-6 mr-2 text-accent" />
          VoxVignan Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-blue-900 rounded-lg text-sm font-bold text-left transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3 text-accent" /> Dashboard
          </button>
          <button className="w-full flex items-center px-4 py-3 hover:bg-blue-900 rounded-lg text-sm font-bold text-left transition-colors text-gray-300">
            <Users className="w-5 h-5 mr-3 text-gray-400" /> User Management
          </button>
          <button className="w-full flex items-center px-4 py-3 hover:bg-blue-900 rounded-lg text-sm font-bold text-left transition-colors text-gray-300">
            <FileText className="w-5 h-5 mr-3 text-gray-400" /> Platform Reports
          </button>
        </nav>
        <div className="p-4 border-t border-blue-900">
          <Link href="/dashboard" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
            &larr; Return to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-500 mt-1">Monitor student performance and platform adoption globally.</p>
          </div>
          <button className="bg-secondary text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-sm hover:bg-primary transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export Master Report
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Students</div>
            <div className="text-4xl font-extrabold text-primary">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Avg. Comm Score</div>
            <div className="text-4xl font-extrabold text-green-600">82.4</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Challenges Completed</div>
            <div className="text-4xl font-extrabold text-secondary">1,402</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 font-bold text-gray-700">
            Recent Registrations
          </div>
          {fetching ? (
            <div className="p-8 text-center text-gray-500">Syncing CRM data...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-4 font-bold">UID</th>
                  <th className="px-6 py-4 font-bold">Student Name</th>
                  <th className="px-6 py-4 font-bold">Department</th>
                  <th className="px-6 py-4 font-bold">Base Level</th>
                  <th className="px-6 py-4 font-bold text-right">Internal Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{u.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.department || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                        {u.communicationLevel || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-secondary">
                      {u.totalScore || 0}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found. Ensure Firebase config matches.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
