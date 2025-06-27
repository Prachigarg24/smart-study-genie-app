
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  Edit3, 
  Trash2, 
  Clock,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  title: string;
  description: string;
  subject: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
  estimatedHours: number;
}

interface NewTopicForm {
  title: string;
  description: string;
  subject: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
}

const PROGRAMMING_SUBJECTS = [
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'HTML',
  'CSS',
  'React',
  'Node.js',
  'TypeScript',
  'PHP',
  'Ruby',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'SQL',
  'MongoDB',
  'Docker',
  'AWS'
];

const SyllabusManager = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [newTopic, setNewTopic] = useState<NewTopicForm>({
    title: '',
    description: '',
    subject: '',
    deadline: '',
    priority: 'medium',
    estimatedHours: 2
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedTopics = localStorage.getItem('studygenie_topics');
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    }
  }, []);

  const saveTopics = (updatedTopics: Topic[]) => {
    setTopics(updatedTopics);
    localStorage.setItem('studygenie_topics', JSON.stringify(updatedTopics));
  };

  const handleAddTopic = () => {
    if (!newTopic.title || !newTopic.subject || !newTopic.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const topic: Topic = {
      id: Date.now().toString(),
      ...newTopic,
      status: 'not-started'
    };

    const updatedTopics = [...topics, topic];
    saveTopics(updatedTopics);

    setNewTopic({
      title: '',
      description: '',
      subject: '',
      deadline: '',
      priority: 'medium',
      estimatedHours: 2
    });
    setIsAddingTopic(false);

    toast({
      title: "Success!",
      description: "Topic added to your syllabus",
    });
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
  };

  const handleUpdateTopic = () => {
    if (!editingTopic) return;

    const updatedTopics = topics.map(topic =>
      topic.id === editingTopic.id ? editingTopic : topic
    );
    saveTopics(updatedTopics);
    setEditingTopic(null);

    toast({
      title: "Success!",
      description: "Topic updated successfully",
    });
  };

  const handleUpdateStatus = (topicId: string, status: Topic['status']) => {
    const updatedTopics = topics.map(topic =>
      topic.id === topicId ? { ...topic, status } : topic
    );
    saveTopics(updatedTopics);

    toast({
      title: "Status Updated",
      description: `Topic marked as ${status.replace('-', ' ')}`,
    });
  };

  const handleDeleteTopic = (topicId: string) => {
    const updatedTopics = topics.filter(topic => topic.id !== topicId);
    saveTopics(updatedTopics);

    toast({
      title: "Topic Deleted",
      description: "Topic removed from your syllabus",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not-started': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const due = new Date(deadline);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Syllabus Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organize and track your programming topics
          </p>
        </div>
        <Dialog open={isAddingTopic} onOpenChange={setIsAddingTopic}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Topic Title *</Label>
                <Input
                  id="title"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., React Hooks, Python Loops"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select 
                  value={newTopic.subject} 
                  onValueChange={(value) => 
                    setNewTopic(prev => ({ ...prev, subject: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a programming language" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMMING_SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTopic.description}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the topic..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newTopic.deadline}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hours">Est. Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="50"
                    value={newTopic.estimatedHours}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 2 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newTopic.priority} 
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    setNewTopic(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddingTopic(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTopic}>
                  Add Topic
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Topic Dialog */}
      <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          {editingTopic && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Topic Title *</Label>
                <Input
                  id="edit-title"
                  value={editingTopic.title}
                  onChange={(e) => setEditingTopic(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-subject">Subject *</Label>
                <Select 
                  value={editingTopic.subject} 
                  onValueChange={(value) => 
                    setEditingTopic(prev => prev ? { ...prev, subject: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMMING_SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTopic.description}
                  onChange={(e) => setEditingTopic(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-deadline">Deadline *</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editingTopic.deadline}
                    onChange={(e) => setEditingTopic(prev => prev ? { ...prev, deadline: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-hours">Est. Hours</Label>
                  <Input
                    id="edit-hours"
                    type="number"
                    min="1"
                    max="50"
                    value={editingTopic.estimatedHours}
                    onChange={(e) => setEditingTopic(prev => prev ? { ...prev, estimatedHours: parseInt(e.target.value) || 2 } : null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editingTopic.priority} 
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    setEditingTopic(prev => prev ? { ...prev, priority: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTopic(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTopic}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Topic
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Topics Grid */}
      <div className="grid gap-6">
        {topics.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No topics yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by adding your first programming topic to get organized!
              </p>
              <Button onClick={() => setIsAddingTopic(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Topic
              </Button>
            </CardContent>
          </Card>
        ) : (
          topics.map((topic) => {
            const daysLeft = getDaysUntilDeadline(topic.deadline);
            const isOverdue = daysLeft < 0;
            const isDueSoon = daysLeft <= 3 && daysLeft >= 0;
            
            return (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <Badge className={getPriorityColor(topic.priority)}>
                          {topic.priority}
                        </Badge>
                      </div>
                      <CardDescription>{topic.subject}</CardDescription>
                      {topic.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {topic.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTopic(topic)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTopic(topic.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(topic.deadline).toLocaleDateString()}
                        </span>
                        {isOverdue && (
                          <Badge variant="destructive" className="ml-2">
                            Overdue
                          </Badge>
                        )}
                        {isDueSoon && (
                          <Badge variant="secondary" className="ml-2">
                            Due soon
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{topic.estimatedHours}h</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(topic.status)}>
                      {topic.status.replace('-', ' ')}
                    </Badge>
                    <div className="flex space-x-2">
                      {topic.status !== 'not-started' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(topic.id, 'not-started')}
                        >
                          Not Started
                        </Button>
                      )}
                      {topic.status !== 'in-progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(topic.id, 'in-progress')}
                        >
                          In Progress
                        </Button>
                      )}
                      {topic.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(topic.id, 'completed')}
                        >
                          Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SyllabusManager;
