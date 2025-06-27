
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, Zap, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudyTask {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'completed' | 'missed';
  priority: 'high' | 'medium' | 'low';
}

interface StudyPlan {
  id: string;
  createdAt: string;
  totalHours: number;
  dailyHours: number;
  tasks: StudyTask[];
}

const StudyPlanGenerator = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    dailyHours: 4,
    preferredStartTime: '09:00',
    preferredEndTime: '18:00',
    breakDuration: 15
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing study plan
    const savedPlan = localStorage.getItem('studygenie_study_plan');
    if (savedPlan) {
      setStudyPlan(JSON.parse(savedPlan));
    }
  }, []);

  const generateAIStudyPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Get topics from syllabus
      const savedTopics = localStorage.getItem('studygenie_topics');
      const topics = savedTopics ? JSON.parse(savedTopics) : [];
      
      if (topics.length === 0) {
        toast({
          title: "No Topics Found",
          description: "Please add some topics to your syllabus first",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Simulate AI-powered study plan generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const tasks: StudyTask[] = [];
      const startDate = new Date();
      
      // Sort topics by deadline and priority
      const sortedTopics = topics
        .filter((topic: any) => topic.status !== 'completed')
        .sort((a: any, b: any) => {
          const dateA = new Date(a.deadline);
          const dateB = new Date(b.deadline);
          if (dateA.getTime() === dateB.getTime()) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return dateA.getTime() - dateB.getTime();
        });

      // Generate tasks for the next 14 days
      for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayOffset);
        
        // Skip weekends (optional - can be made configurable)
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
        
        let remainingHours = settings.dailyHours;
        let currentTime = new Date(`${currentDate.toISOString().split('T')[0]}T${settings.preferredStartTime}`);
        
        for (const topic of sortedTopics) {
          if (remainingHours <= 0) break;
          
          const sessionDuration = Math.min(
            remainingHours,
            Math.min(2, topic.estimatedHours), // Max 2 hours per session
            1.5 // Default session length
          );
          
          if (sessionDuration < 0.5) break; // Skip very short sessions
          
          const endTime = new Date(currentTime);
          endTime.setHours(endTime.getHours() + sessionDuration);
          
          tasks.push({
            id: `${topic.id}-${dayOffset}-${tasks.length}`,
            topicId: topic.id,
            topicTitle: topic.title,
            subject: topic.subject,
            date: currentDate.toISOString().split('T')[0],
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: endTime.toTimeString().slice(0, 5),
            duration: sessionDuration,
            status: 'pending',
            priority: topic.priority
          });
          
          // Add break time
          currentTime = new Date(endTime);
          currentTime.setMinutes(currentTime.getMinutes() + settings.breakDuration);
          
          remainingHours -= sessionDuration;
        }
      }

      const newPlan: StudyPlan = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        totalHours: tasks.reduce((sum, task) => sum + task.duration, 0),
        dailyHours: settings.dailyHours,
        tasks
      };

      setStudyPlan(newPlan);
      localStorage.setItem('studygenie_study_plan', JSON.stringify(newPlan));

      toast({
        title: "Study Plan Generated! 🎉",
        description: `Created ${tasks.length} study sessions over 14 days`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const markTaskComplete = (taskId: string) => {
    if (!studyPlan) return;

    const updatedTasks = studyPlan.tasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed' as const } : task
    );

    const updatedPlan = { ...studyPlan, tasks: updatedTasks };
    setStudyPlan(updatedPlan);
    localStorage.setItem('studygenie_study_plan', JSON.stringify(updatedPlan));

    toast({
      title: "Great job! 🎉",
      description: "Task marked as completed",
    });
  };

  const getTodaysTasks = () => {
    if (!studyPlan) return [];
    const today = new Date().toISOString().split('T')[0];
    return studyPlan.tasks.filter(task => task.date === today);
  };

  const getSelectedDateTasks = () => {
    if (!studyPlan) return [];
    return studyPlan.tasks.filter(task => task.date === selectedDate);
  };

  const getCompletionStats = () => {
    if (!studyPlan) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = studyPlan.tasks.filter(task => task.status === 'completed').length;
    const total = studyPlan.tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const stats = getCompletionStats();
  const todaysTasks = getTodaysTasks();
  const selectedTasks = getSelectedDateTasks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Study Plan</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Let AI create your personalized study schedule
          </p>
        </div>
        <Button 
          onClick={generateAIStudyPlan}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              {studyPlan ? 'Regenerate Plan' : 'Generate Plan'}
            </>
          )}
        </Button>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Study Preferences</CardTitle>
          <CardDescription>Customize your study schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dailyHours">Daily Hours</Label>
              <Input
                id="dailyHours"
                type="number"
                min="1"
                max="12"
                value={settings.dailyHours}
                onChange={(e) => setSettings(prev => ({ ...prev, dailyHours: parseInt(e.target.value) || 4 }))}
              />
            </div>
            <div>
              <Label htmlFor="startTime">Preferred Start</Label>
              <Input
                id="startTime"
                type="time"
                value={settings.preferredStartTime}
                onChange={(e) => setSettings(prev => ({ ...prev, preferredStartTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Preferred End</Label>
              <Input
                id="endTime"
                type="time"
                value={settings.preferredEndTime}
                onChange={(e) => setSettings(prev => ({ ...prev, preferredEndTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="breakDuration">Break (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="5"
                max="60"
                value={settings.breakDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 15 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {studyPlan && (
        <>
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed Tasks</span>
                    <span>{stats.completed}/{stats.total}</span>
                  </div>
                  <Progress value={stats.percentage} className="h-2" />
                  <p className="text-xs text-gray-500">{stats.percentage}% complete</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Study Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{studyPlan.totalHours.toFixed(1)}h</div>
                <p className="text-sm text-gray-500">Across all topics</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Today's Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{todaysTasks.length}</div>
                <p className="text-sm text-gray-500">
                  {todaysTasks.filter(t => t.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Today's Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No study sessions scheduled for today</p>
              ) : (
                <div className="space-y-3">
                  {todaysTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                          )}
                          <div>
                            <p className="font-medium">{task.topicTitle}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {task.subject} • {task.startTime} - {task.endTime} ({task.duration}h)
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                          {task.priority}
                        </Badge>
                        {task.status !== 'completed' && (
                          <Button size="sm" onClick={() => markTaskComplete(task.id)}>
                            Mark Done
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Study Calendar</CardTitle>
              <CardDescription>View your schedule by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="dateSelect">Select Date:</Label>
                  <Input
                    id="dateSelect"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>

                {selectedTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No study sessions scheduled for {new Date(selectedDate).toLocaleDateString()}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{task.topicTitle}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {task.startTime} - {task.endTime} • {task.subject}
                            </p>
                          </div>
                        </div>
                        <Badge className={task.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!studyPlan && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Study Plan Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate an AI-powered study plan based on your syllabus and preferences
            </p>
            <Button onClick={generateAIStudyPlan} disabled={isGenerating}>
              <Zap className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyPlanGenerator;
