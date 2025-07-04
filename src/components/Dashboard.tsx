
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Clock, 
  Target, 
  Plus,
  Calendar,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';
import Navbar from './Navbar';
import SyllabusManager from './syllabus/SyllabusManager';
import StudyPlanGenerator from './study/StudyPlanGenerator';
import FlashcardViewer from './flashcards/FlashcardViewer';
import QuizInterface from './quiz/QuizInterface';
import UserProfile from './profile/UserProfile';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [studyData, setStudyData] = useState({
    totalTopics: 25,
    completedTopics: 12,
    flashcardsCreated: 156,
    quizzesTaken: 23,
    averageScore: 87,
    studyStreak: 7,
    todaysTasks: [
      { id: 1, subject: 'JavaScript', topic: 'Async/Await Fundamentals', time: '2:00 PM - 3:30 PM', status: 'pending' },
      { id: 2, subject: 'Python', topic: 'Data Structures & Algorithms', time: '4:00 PM - 5:00 PM', status: 'completed' },
      { id: 3, subject: 'React', topic: 'State Management with Redux', time: '7:00 PM - 8:30 PM', status: 'pending' }
    ]
  });

  const progressData = [
    { name: 'Mon', completed: 3, planned: 5 },
    { name: 'Tue', completed: 4, planned: 4 },
    { name: 'Wed', completed: 2, planned: 6 },
    { name: 'Thu', completed: 5, planned: 5 },
    { name: 'Fri', completed: 6, planned: 7 },
    { name: 'Sat', completed: 4, planned: 4 },
    { name: 'Sun', completed: 3, planned: 5 }
  ];

  const subjectData = [
    { name: 'JavaScript', value: 28, color: '#f7df1e' },
    { name: 'Python', value: 22, color: '#3776ab' },
    { name: 'React', value: 18, color: '#61dafb' },
    { name: 'Node.js', value: 15, color: '#339933' },
    { name: 'CSS', value: 10, color: '#1572b6' },
    { name: 'HTML', value: 7, color: '#e34f26' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('studygenie_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const completionPercentage = Math.round((studyData.completedTopics / studyData.totalTopics) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isLoggedIn={true} onLogout={onLogout} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'Developer'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to level up your programming skills? Let's code something amazing today!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
            <TabsTrigger value="study-plan">Study Plan</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Programming Topics</CardTitle>
                    <BookOpen className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studyData.totalTopics}</div>
                  <p className="text-xs opacity-80">
                    {studyData.completedTopics} mastered
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Coding Streak</CardTitle>
                    <Zap className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studyData.studyStreak} days</div>
                  <p className="text-xs opacity-80">Keep coding!</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Quiz Average</CardTitle>
                    <Trophy className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studyData.averageScore}%</div>
                  <p className="text-xs opacity-80">
                    {studyData.quizzesTaken} coding quizzes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
                    <Brain className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studyData.flashcardsCreated}</div>
                  <p className="text-xs opacity-80">Code concepts learned</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Your programming mastery journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Topics Mastered
                      </span>
                      <span className="text-sm font-medium">
                        {studyData.completedTopics}/{studyData.totalTopics}
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {completionPercentage}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Programming Languages</CardTitle>
                  <CardDescription>Study time distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                        >
                          {subjectData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Coding Sessions</CardTitle>
                    <CardDescription>Your planned programming studies</CardDescription>
                  </div>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studyData.todaysTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {task.topic}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.subject} • {task.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status === 'completed' ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Coding Progress</CardTitle>
                <CardDescription>Tasks completed vs planned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                      <Bar dataKey="planned" fill="#e5e7eb" name="Planned" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="syllabus">
            <SyllabusManager />
          </TabsContent>

          <TabsContent value="study-plan">
            <StudyPlanGenerator />
          </TabsContent>

          <TabsContent value="flashcards">
            <FlashcardViewer />
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizInterface />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
