
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Users,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudySession {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'missed';
  notes?: string;
}

interface StudyPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dailyHours: number;
  sessions: StudySession[];
  createdAt: string;
}

const StudyPlanGenerator = () => {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planSettings, setPlanSettings] = useState({
    name: '',
    startDate: '',
    endDate: '',
    dailyHours: 2,
    selectedTopics: [] as string[]
  });
  const [todaysSessions, setTodaysSessions] = useState<StudySession[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadStudyPlans();
    loadTodaysSessions();
  }, []);

  const loadStudyPlans = () => {
    const saved = localStorage.getItem('studygenie_study_plans');
    if (saved) {
      const plans = JSON.parse(saved);
      setStudyPlans(plans);
      if (plans.length > 0) {
        setActivePlan(plans[0]);
      }
    }
  };

  const loadTodaysSessions = () => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('studygenie_study_plans');
    if (saved) {
      const plans = JSON.parse(saved);
      const allSessions = plans.flatMap((plan: StudyPlan) => plan.sessions);
      const todaysSessions = allSessions.filter((session: StudySession) => session.date === today);
      setTodaysSessions(todaysSessions);
    }
  };

  const saveStudyPlans = (plans: StudyPlan[]) => {
    setStudyPlans(plans);
    localStorage.setItem('studygenie_study_plans', JSON.stringify(plans));
  };

  const getTopicsFromSyllabus = () => {
    const saved = localStorage.getItem('studygenie_topics');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  };

  const generateStudyPlan = () => {
    if (!planSettings.name || !planSettings.startDate || !planSettings.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (planSettings.selectedTopics.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one topic",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const topics = getTopicsFromSyllabus();
      const selectedTopics = topics.filter((topic: any) => 
        planSettings.selectedTopics.includes(topic.id)
      );

      const sessions: StudySession[] = [];
      const startDate = new Date(planSettings.startDate);
      const endDate = new Date(planSettings.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let currentDate = new Date(startDate);
      let topicIndex = 0;

      for (let day = 0; day <= totalDays; day++) {
        if (currentDate > endDate) break;

        // Skip weekends (optional)
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        const topic = selectedTopics[topicIndex % selectedTopics.length];
        const sessionId = `session-${Date.now()}-${day}`;
        
        const session: StudySession = {
          id: sessionId,
          topicId: topic.id,
          topicTitle: topic.title,
          subject: topic.subject,
          date: currentDate.toISOString().split('T')[0],
          startTime: '09:00',
          endTime: `${9 + planSettings.dailyHours}:00`,
          duration: planSettings.dailyHours,
          status: 'scheduled'
        };

        sessions.push(session);
        topicIndex++;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const newPlan: StudyPlan = {
        id: Date.now().toString(),
        name: planSettings.name,
        startDate: planSettings.startDate,
        endDate: planSettings.endDate,
        dailyHours: planSettings.dailyHours,
        sessions,
        createdAt: new Date().toISOString()
      };

      const updatedPlans = [...studyPlans, newPlan];
      saveStudyPlans(updatedPlans);
      setActivePlan(newPlan);
      loadTodaysSessions();

      // Reset form
      setPlanSettings({
        name: '',
        startDate: '',
        endDate: '',
        dailyHours: 2,
        selectedTopics: []
      });

      setIsGenerating(false);

      toast({
        title: "Study Plan Created! 📚",
        description: `Generated ${sessions.length} study sessions`,
      });
    }, 2000);
  };

  const updateSessionStatus = (sessionId: string, status: StudySession['status'], notes?: string) => {
    const updatedPlans = studyPlans.map(plan => ({
      ...plan,
      sessions: plan.sessions.map(session =>
        session.id === sessionId 
          ? { ...session, status, notes: notes || session.notes }
          : session
      )
    }));

    saveStudyPlans(updatedPlans);
    if (activePlan) {
      const updatedActivePlan = updatedPlans.find(p => p.id === activePlan.id);
      if (updatedActivePlan) {
        setActivePlan(updatedActivePlan);
      }
    }
    loadTodaysSessions();

    toast({
      title: "Session Updated",
      description: `Session marked as ${status}`,
    });
  };

  const getStats = () => {
    if (!activePlan) return { total: 0, completed: 0, percentage: 0 };
    
    const total = activePlan.sessions.length;
    const completed = activePlan.sessions.filter(s => s.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  const getUpcomingSessions = () => {
    if (!activePlan) return [];
    
    const today = new Date().toISOString().split('T')[0];
    return activePlan.sessions
      .filter(session => session.date >= today && session.status === 'scheduled')
      .slice(0, 5);
  };

  const topics = getTopicsFromSyllabus();
  const stats = getStats();
  const upcomingSessions = getUpcomingSessions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Plan Generator</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create personalized study schedules based on your syllabus
          </p>
        </div>
      </div>

      {/* Create New Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Study Plan</CardTitle>
          <CardDescription>Generate a personalized study schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan-name">Plan Name *</Label>
                <Input
                  id="plan-name"
                  value={planSettings.name}
                  onChange={(e) => setPlanSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., JavaScript Mastery Plan"
                />
              </div>
              <div>
                <Label htmlFor="daily-hours">Daily Study Hours</Label>
                <Select 
                  value={planSettings.dailyHours.toString()} 
                  onValueChange={(value) => setPlanSettings(prev => ({ ...prev, dailyHours: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="5">5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={planSettings.startDate}
                  onChange={(e) => setPlanSettings(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={planSettings.endDate}
                  onChange={(e) => setPlanSettings(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Select Topics to Include *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-3">
                {topics.length === 0 ? (
                  <p className="text-gray-500 text-sm">No topics found. Please add topics to your syllabus first.</p>
                ) : (
                  topics.map((topic: any) => (
                    <div key={topic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={topic.id}
                        checked={planSettings.selectedTopics.includes(topic.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPlanSettings(prev => ({
                              ...prev,
                              selectedTopics: [...prev.selectedTopics, topic.id]
                            }));
                          } else {
                            setPlanSettings(prev => ({
                              ...prev,
                              selectedTopics: prev.selectedTopics.filter(id => id !== topic.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={topic.id} className="text-sm">
                        {topic.title} ({topic.subject})
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button 
              onClick={generateStudyPlan}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Study Plan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Plan Overview */}
      {activePlan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-500">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.percentage}%</div>
              <p className="text-sm text-gray-500">Progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Sessions */}
      {todaysSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Study Sessions</CardTitle>
            <CardDescription>Your scheduled sessions for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {session.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : session.status === 'missed' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {session.topicTitle}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.subject} • {session.startTime} - {session.endTime} ({session.duration}h)
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {session.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => updateSessionStatus(session.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {session.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSessionStatus(session.id, 'missed')}
                      >
                        Mark Missed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Plan Details */}
      {activePlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{activePlan.name}</CardTitle>
                <CardDescription>
                  {new Date(activePlan.startDate).toLocaleDateString()} - {new Date(activePlan.endDate).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {activePlan.dailyHours}h/day
              </Badge>
            </div>
            <Progress value={stats.percentage} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Upcoming Sessions</h4>
                {upcomingSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming sessions</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div>
                          <p className="font-medium">{session.topicTitle}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                          </p>
                        </div>
                        <Badge variant="outline">{session.subject}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Active Plan */}
      {!activePlan && studyPlans.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Study Plans Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first study plan to get organized and stay on track
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyPlanGenerator;
