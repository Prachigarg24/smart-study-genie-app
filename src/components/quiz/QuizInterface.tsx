import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy,
  Clock,
  CheckCircle,
  X,
  RotateCcw,
  Zap,
  RefreshCw,
  Target,
  Award,
  Filter
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

const SAMPLE_QUESTIONS: { [key: string]: Question[] } = {
  JavaScript: [
    {
      id: 'js1',
      question: 'What is the correct way to declare a variable in JavaScript?',
      options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
      correctAnswer: 0,
      explanation: 'In JavaScript, variables are declared using var, let, or const keywords.',
      difficulty: 'easy'
    },
    {
      id: 'js2',
      question: 'Which method is used to add an element at the end of an array?',
      options: ['append()', 'push()', 'add()', 'insert()'],
      correctAnswer: 1,
      explanation: 'The push() method adds one or more elements to the end of an array.',
      difficulty: 'medium'
    },
    {
      id: 'js3',
      question: 'What does "this" keyword refer to in JavaScript?',
      options: ['The current function', 'The global object', 'The object that owns the method', 'The parent object'],
      correctAnswer: 2,
      explanation: 'In JavaScript, "this" refers to the object that is executing the current function.',
      difficulty: 'hard'
    }
  ],
  Python: [
    {
      id: 'py1',
      question: 'Which of the following is the correct way to create a list in Python?',
      options: ['list = []', 'list = ()', 'list = {}', 'list = ""'],
      correctAnswer: 0,
      explanation: 'Square brackets [] are used to create lists in Python.',
      difficulty: 'easy'
    },
    {
      id: 'py2',
      question: 'What is the output of print(2 ** 3) in Python?',
      options: ['6', '8', '9', '5'],
      correctAnswer: 1,
      explanation: 'The ** operator is used for exponentiation in Python. 2**3 = 8.',
      difficulty: 'medium'
    },
    {
      id: 'py3',
      question: 'Which method is used to remove whitespace from both ends of a string?',
      options: ['strip()', 'trim()', 'remove()', 'clean()'],
      correctAnswer: 0,
      explanation: 'The strip() method removes whitespace from both ends of a string in Python.',
      difficulty: 'medium'
    }
  ],
  React: [
    {
      id: 'react1',
      question: 'What is JSX in React?',
      options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A CSS framework', 'A database'],
      correctAnswer: 1,
      explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in JavaScript.',
      difficulty: 'easy'
    },
    {
      id: 'react2',
      question: 'Which hook is used to manage state in functional components?',
      options: ['useEffect', 'useState', 'useContext', 'useReducer'],
      correctAnswer: 1,
      explanation: 'useState is the React hook used to add state to functional components.',
      difficulty: 'medium'
    }
  ]
};

const QuizInterface = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadQuizzes();
    loadQuizResults();
  }, []);

  const loadQuizzes = () => {
    const saved = localStorage.getItem('studygenie_quizzes');
    if (saved) {
      setQuizzes(JSON.parse(saved));
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

  const generateQuizForSubject = (subject: string) => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const questions = SAMPLE_QUESTIONS[subject] || [];
      
      if (questions.length === 0) {
        // Generate generic questions for subjects without predefined questions
        const genericQuestions: Question[] = [
          {
            id: `${subject.toLowerCase()}-1`,
            question: `What is a fundamental concept in ${subject}?`,
            options: [
              'Basic syntax and structure',
              'Only advanced features',
              'Historical background only',
              'Not applicable'
            ],
            correctAnswer: 0,
            explanation: `Understanding basic syntax and structure is fundamental to learning ${subject}.`,
            difficulty: 'easy'
          },
          {
            id: `${subject.toLowerCase()}-2`,
            question: `How is ${subject} commonly used in software development?`,
            options: [
              'Only for academic purposes',
              'For building applications and solving problems',
              'Not used in development',
              'Only for documentation'
            ],
            correctAnswer: 1,
            explanation: `${subject} is widely used in software development for building applications and solving real-world problems.`,
            difficulty: 'medium'
          },
          {
            id: `${subject.toLowerCase()}-3`,
            question: `What makes ${subject} valuable for developers?`,
            options: [
              'It has no practical value',
              'It provides tools and features for efficient development',
              'It\'s only for beginners',
              'It\'s outdated technology'
            ],
            correctAnswer: 1,
            explanation: `${subject} provides valuable tools and features that help developers write efficient, maintainable code.`,
            difficulty: 'medium'
          }
        ];
        
        const newQuiz: Quiz = {
          id: `quiz-${subject}-${Date.now()}`,
          topicId: subject,
          topicTitle: `${subject} Fundamentals`,
          subject: subject,
          questions: genericQuestions,
          createdAt: new Date().toISOString()
        };

        const updatedQuizzes = [...quizzes, newQuiz];
        saveQuizzes(updatedQuizzes);
        setIsGenerating(false);
        startQuiz(newQuiz);
      } else {
        // Shuffle and select random questions
        const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffledQuestions.slice(0, Math.min(3, shuffledQuestions.length));
        
        const newQuiz: Quiz = {
          id: `quiz-${subject}-${Date.now()}`,
          topicId: subject,
          topicTitle: `${subject} Quiz`,
          subject: subject,
          questions: selectedQuestions.map(q => ({
            ...q,
            id: `${q.id}-${Date.now()}`
          })),
          createdAt: new Date().toISOString()
        };

        const updatedQuizzes = [...quizzes, newQuiz];
        saveQuizzes(updatedQuizzes);
        setIsGenerating(false);
        startQuiz(newQuiz);
      }

      toast({
        title: "Quiz Generated! 🧠",
        description: `New ${subject} quiz created and started`,
      });
    }, 2000);
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
    if (activeQuiz) {
      generateQuizForSubject(activeQuiz.subject);
    }
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

  const getFilteredQuizzes = () => {
    if (filterSubject === 'all') return quizzes;
    return quizzes.filter(quiz => quiz.subject === filterSubject);
  };

  const stats = getStats();
  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];
  const progress = activeQuiz ? ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100 : 0;
  const filteredQuizzes = getFilteredQuizzes();

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
                New Quiz
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Programming Quizzes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Test your programming knowledge with subject-specific quizzes
          </p>
        </div>
      </div>

      {/* Subject Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Start a New Quiz</h3>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="subject-select">Choose Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
            <div className="flex items-end">
              <Button 
                onClick={() => selectedSubject && generateQuizForSubject(selectedSubject)}
                disabled={!selectedSubject || isGenerating}
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
                    Start Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

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

      {/* Filter */}
      {quizzes.length > 0 && (
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4" />
          <Label htmlFor="filter-select">Filter by Subject:</Label>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {PROGRAMMING_SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Previous Quizzes */}
      <div className="grid gap-6">
        {filteredQuizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Quizzes Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a programming language above to start your first quiz
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuizzes.map((quiz) => {
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
                    <Button onClick={() => generateQuizForSubject(quiz.subject)}>
                      New Quiz
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
