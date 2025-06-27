
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BookOpen, Target, BarChart3, Clock, Users, Zap, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import AuthModal from '@/components/auth/AuthModal';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('studygenie_token');
    const user = localStorage.getItem('studygenie_user');
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: any, token: string) => {
    localStorage.setItem('studygenie_token', token);
    localStorage.setItem('studygenie_user', JSON.stringify(user));
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('studygenie_token');
    localStorage.removeItem('studygenie_user');
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Navbar onLogin={() => handleAuth('login')} onSignup={() => handleAuth('signup')} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            StudyGenie
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Your Smart Study Companion
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Transform your studying with AI-powered study plans, personalized flashcards, and intelligent quizzes. 
            Never fall behind on your syllabus again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
              onClick={() => handleAuth('signup')}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3"
              onClick={() => handleAuth('login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          Supercharge Your Study Experience
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>AI Study Plans</CardTitle>
              <CardDescription>
                Get personalized daily study schedules based on your syllabus and deadlines
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Smart Flashcards</CardTitle>
              <CardDescription>
                AI-generated flashcards from your study material for effective revision
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-10 w-10 text-indigo-500 mb-2" />
              <CardTitle>Intelligent Quizzes</CardTitle>
              <CardDescription>
                Test your knowledge with AI-created quizzes and track your progress
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Progress Analytics</CardTitle>
              <CardDescription>
                Visual insights into your study patterns and performance
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Smart Reminders</CardTitle>
              <CardDescription>
                Never miss a study session with intelligent scheduling
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-pink-500 mb-2" />
              <CardTitle>Leaderboards</CardTitle>
              <CardDescription>
                Compete with friends and stay motivated with rankings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Study Habits?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who've already improved their academic performance with StudyGenie
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            onClick={() => handleAuth('signup')}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
