import Link from 'next/link';
import { ArrowRight, Video, Mic, Users, Brain, LayoutDashboard, Presentation } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background-gray">
      {/* Navbar Minimal */}
      <header className="flex justify-between items-center py-6 px-10 bg-white shadow-sm">
        <div className="text-primary font-bold text-2xl tracking-tighter">VoxVignan AI</div>
        <nav className="flex space-x-6">
          <Link href="/auth/login" className="text-foreground hover:text-secondary font-medium">Log In</Link>
          <Link href="/auth/signup" className="bg-secondary text-white px-5 py-2 rounded-md font-medium hover:bg-primary transition-colors">Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center text-center px-4 py-32 bg-gradient-to-b from-background-soft to-white">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary max-w-4xl leading-tight mb-6">
            Transform Your Communication Skills with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mb-10">
            Master Presentations, Interviews, Group Discussions, and Professional Communication using Google Gemini.
          </p>
          <div className="flex space-x-4">
            <Link href="/auth/signup" className="flex items-center space-x-2 bg-secondary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary transition-all shadow-md">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/demo" className="flex items-center space-x-2 bg-white text-secondary border border-secondary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all shadow-sm">
              <Video className="w-5 h-5" />
              <span>Start Platform Tour</span>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-primary mb-4">Comprehensive AI Coaching</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Train for every professional scenario with personalized, real-time feedback designed for university students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Mic className="w-8 h-8 text-accent" />}
                title="AI Communication Coach"
                description="Practice daily speaking challenges to enhance your fluency, confidence, and grammar."
              />
              <FeatureCard 
                icon={<Presentation className="w-8 h-8 text-accent" />}
                title="AI Presentation Evaluator"
                description="Upload slides and present to your camera. Get feedback on both content and delivery."
              />
              <FeatureCard 
                icon={<Brain className="w-8 h-8 text-accent" />}
                title="AI Interview Simulator"
                description="Face highly realistic technical and HR interviews adapted dynamically to your skills."
              />
              <FeatureCard 
                icon={<Users className="w-8 h-8 text-accent" />}
                title="AI Group Discussion"
                description="Join a virtual roundtable. Lead, argue, and collaborate with AI participants."
              />
              <FeatureCard 
                icon={<LayoutDashboard className="w-8 h-8 text-accent" />}
                title="Analytics & Gamification"
                description="Track your communication score, earn badges, and maintain streaks as you improve."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-8 text-center">
        <p className="text-sm opacity-80">© 2026 VoxVignan AI. "Your Voice. Your Growth."</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-background-gray rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
