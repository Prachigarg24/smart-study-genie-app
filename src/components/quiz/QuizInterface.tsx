import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Trophy,
  Clock,
  CheckCircle,
  X,
  RotateCcw,
  Zap,
  RefreshCw,
  Target,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Quiz {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  questions: Question[];
  createdAt: string;
}

interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[];
  completedAt: string;
}

const QuizInterface = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuizzes();
    loadQuizResults();
  }, []);

  const loadQuizzes = () => {
    const saved = localStorage.getItem('studygenie_quizzes');
    if (saved) {
      setQuizzes(JSON.parse(saved));
    } else {
      // Sample quiz for demonstration
      const sampleQuiz: Quiz = {
        id: '1',
        topicId: '1',
        topicTitle: 'Calculus Integration',
        subject: 'Mathematics',
        questions: [
          {
            id: '1',
            question: 'What is the integral of x² dx?',
            options: ['x³/3 + C', 'x³ + C', '2x + C', 'x²/2 + C'],
            correctAnswer: 0,
            explanation: 'When integrating x^n, we use the power rule: ∫x^n dx = x^(n+1)/(n+1) + C',
            difficulty: 'medium'
          },
          {
            id: '2',
            question: 'What is the derivative of sin(x)?',
            options: ['cos(x)', '-cos(x)', 'tan(x)', '-sin(x)'],
            correctAnswer: 0,
            explanation: 'The derivative of sin(x) is cos(x), which is a fundamental derivative rule.',
            difficulty: 'easy'
          }
        ],
        createdAt: new Date().toISOString()
      };
      setQuizzes([sampleQuiz]);
      localStorage.setItem('studygenie_quizzes', JSON.stringify([sampleQuiz]));
    }
  };

  const loadQuizResults = () => {
    const saved = localStorage.getItem('studygenie_quiz_results');
    if (saved) {
      setQuizResults(JSON.parse(saved));
    }
  };

  const saveQuizzes = (updatedQuizzes: Quiz[]) => {
    setQuizzes(updatedQuizzes);
    localStorage.setItem('studygenie_quizzes', JSON.stringify(updatedQuizzes));
  };

  const saveQuizResults = (results: QuizResult[]) => {
    setQuizResults(results);
    localStorage.setItem('studygenie_quiz_results', JSON.stringify(results));
  };

  const generateQuizzes = async () => {
    setIsGenerating(true);
    
    try {
      const topics = JSON.parse(localStorage.getItem('studygenie_topics') || '[]');
      
      if (topics.length === 0) {
        toast({
          title: "No Topics Found",
          description: "Please add some topics to your syllabus first",
          variant: "destructive"
        });
        return;
      }

      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newQuizzes: Quiz[] = [];
      
      topics.forEach((topic: any) => {
        const sampleQuestions: Question[] = [
          {
            id: `${topic.id}-q1`,
            question: `What are the fundamental principles of ${topic.title}?`,
            options: [
              `Core concepts and applications`,
              `Basic definitions only`,
              `Historical background`,
              `Future developments`
            ],
            correctAnswer: 0,
            explanation: `The fundamental principles include the core concepts, their applications, and theoretical foundations.`,
            difficulty: 'medium'
          },
          {
            id: `${topic.id}-q2`,
            question: `How is ${topic.title} applied in real-world scenarios?`,
            options: [
              `Through theoretical models only`,
              `Via practical implementations and problem-solving`,
              `Only in academic research`,
              `Not applicable in real world`
            ],
            correctAnswer: 1,
            explanation: `${topic.title} has numerous practical applications that solve real-world problems.`,
            difficulty: 'medium'
          },
          {
            id: `${topic.id}-q3`,
            question: `What makes ${topic.title} important in ${topic.subject}?`,
            options: [
              `It's just another topic`,
              `It forms the foundation for advanced concepts`,
              `It's only for beginners`,
              `It has no significance`
            ],
            correctAnswer: 1,
            explanation: `${topic.title} is crucial as it provides the foundation for understanding more advanced concepts in ${topic.subject}.`,
            difficulty: 'easy'
          }
        ];

        newQuizzes.push({
          id: `quiz-${topic.id}-${Date.now()}`,
          topicId: topic.id,
          topicTitle: topic.title,
          subject: topic.subject,
          questions: sampleQuestions,
          createdAt: new Date().toISOString()
        });
      });

      const allQuizzes = [...quizzes, ...newQuizzes];
      saveQuizzes(allQuizzes);

      toast({
        title: "Quizzes Generated! 🧠",
        description: `Created ${newQuizzes.length} new quizzes from your topics`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quizzes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStartTime(Date.now());
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    if (!activeQuiz) return;

    const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
    let correctAnswers = 0;
    
    const answers = activeQuiz.questions.map(question => {
      const selectedAnswer = selectedAnswers[question.id] ?? -1;
      const isCorrect = selectedAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: question.id,
        selectedAnswer,
        isCorrect
      };
    });

    const result: QuizResult = {
      id: Date.now().toString(),
      quizId: activeQuiz.id,
      score: Math.round((correctAnswers / activeQuiz.questions.length) * 100),
      totalQuestions: activeQuiz.questions.length,
      timeTaken,
      answers,
      completedAt: new Date().toISOString()
    };

    const newResults = [...quizResults, result];
    saveQuizResults(newResults);
    setShowResults(true);

    toast({
      title: "Quiz Completed! 🎉",
      description: `You scored ${result.score}% (${correctAnswers}/${activeQuiz.questions.length})`,
    });
  };

  const retakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStartTime(Date.now());
  };

  const exitQuiz = () => {
    setActiveQuiz(null);
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  const getStats = () => {
    const totalQuizzes = quizResults.length;
    const averageScore = totalQuizzes > 0 
      ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / totalQuizzes)
      : 0;
    const bestScore = totalQuizzes > 0 
      ? Math.max(...quizResults.map(result => result.score))
      : 0;
    
    return { totalQuizzes, averageScore, bestScore };
  };

  const stats = getStats();
  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];
  const progress = activeQuiz ? ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100 : 0;

  // Quiz Results View
  if (showResults && activeQuiz) {
    const latestResult = quizResults[quizResults.length - 1];
    
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            <CardDescription>{activeQuiz.topicTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{latestResult.score}%</div>
                <p className="text-sm text-gray-500">Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {latestResult.answers.filter(a => a.isCorrect).length}/{latestResult.totalQuestions}
                </div>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{latestResult.timeTaken}s</div>
                <p className="text-sm text-gray-500">Time</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {activeQuiz.questions.map((question, index) => {
                const answer = latestResult.answers.find(a => a.questionId === question.id);
                const isCorrect = answer?.isCorrect || false;
                
                return (
                  <Card key={question.id} className={`${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-green-600">
                              ✓ Correct: {question.options[question.correctAnswer]}
                            </p>
                            {answer && answer.selectedAnswer !== question.correctAnswer && (
                              <p className="text-red-600">
                                ✗ Your answer: {question.options[answer.selectedAnswer] || 'Not answered'}
                              </p>
                            )}
                            <p className="text-gray-600 mt-2">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={retakeQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={exitQuiz}>
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Quiz View
  if (activeQuiz && !showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{activeQuiz.topicTitle}</h2>
            <p className="text-gray-600">{activeQuiz.subject}</p>
          </div>
          <Button variant="outline" onClick={exitQuiz}>
            Exit Quiz
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</CardTitle>
              <Badge variant="secondary">
                {currentQuestion?.difficulty}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            {currentQuestion && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
                
                <RadioGroup
                  value={selectedAnswers[currentQuestion.id]?.toString() || ''}
                  onValueChange={(value) => selectAnswer(currentQuestion.id, parseInt(value))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                    <Button onClick={submitQuiz}>
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      Next Question
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Quiz Interface
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Quizzes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>
        <Button 
          onClick={generateQuizzes}
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
              Generate Quizzes
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuizzes}</div>
            <p className="text-sm text-gray-500">Quizzes Taken</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
            <p className="text-sm text-gray-500">Average Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.bestScore}%</div>
            <p className="text-sm text-gray-500">Best Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes */}
      <div className="grid gap-6">
        {quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Quizzes Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate AI quizzes from your syllabus topics to start testing your knowledge
              </p>
              <Button onClick={generateQuizzes} disabled={isGenerating}>
                <Zap className="h-4 w-4 mr-2" />
                Generate Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz) => {
            const relatedQuizResults = quizResults.filter(result => result.quizId === quiz.id);
            const bestScore = relatedQuizResults.length > 0 
              ? Math.max(...relatedQuizResults.map(result => result.score))
              : null;
            
            return (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{quiz.topicTitle}</CardTitle>
                      <CardDescription>{quiz.subject}</CardDescription>
                    </div>
                    {bestScore !== null && (
                      <Badge className="bg-green-100 text-green-800">
                        Best: {bestScore}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{quiz.questions.length} questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>~{Math.ceil(quiz.questions.length * 1.5)} min</span>
                      </div>
                      {relatedQuizResults.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4" />
                          <span>{relatedQuizResults.length} attempts</span>
                        </div>
                      )}
                    </div>
                    <Button onClick={() => startQuiz(quiz)}>
                      {relatedQuizResults.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </Button>
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

export default QuizInterface;
