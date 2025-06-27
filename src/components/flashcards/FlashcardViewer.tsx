
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  RotateCcw, 
  CheckCircle, 
  X, 
  Shuffle, 
  Filter,
  RefreshCw,
  BookOpen,
  Code,
  Zap
} from 'lucide-react';

interface Flashcard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isLearned: boolean;
  createdAt: string;
}

const programmingSubjects = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
  'TypeScript', 'Go', 'Rust', 'PHP', 'C#', 'HTML', 'CSS',
  'Vue.js', 'Angular', 'Swift', 'Kotlin', 'Ruby'
];

const generateProgrammingFlashcards = (subject: string): Flashcard[] => {
  const flashcardTemplates = {
    JavaScript: [
      { q: "What is the difference between let, const, and var?", a: "let and const are block-scoped, var is function-scoped. const cannot be reassigned, let can be reassigned, var can be reassigned and redeclared." },
      { q: "What is a closure in JavaScript?", a: "A closure is a function that has access to variables in its outer scope even after the outer function has returned." },
      { q: "What is the event loop?", a: "The event loop is a mechanism that handles asynchronous operations in JavaScript by managing the call stack and callback queue." },
      { q: "What is hoisting?", a: "Hoisting is JavaScript's behavior of moving variable and function declarations to the top of their scope during compilation." },
      { q: "What is the difference between == and ===?", a: "== compares values with type coercion, === compares values and types without coercion (strict equality)." }
    ],
    Python: [
      { q: "What is a list comprehension?", a: "A concise way to create lists using the syntax: [expression for item in iterable if condition]" },
      { q: "What is the difference between list and tuple?", a: "Lists are mutable (can be changed), tuples are immutable (cannot be changed). Lists use [], tuples use ()." },
      { q: "What is a decorator?", a: "A decorator is a function that modifies or extends the behavior of another function without permanently modifying it." },
      { q: "What is the GIL?", a: "Global Interpreter Lock - a mutex that prevents multiple threads from executing Python bytecodes simultaneously." },
      { q: "What is the difference between is and ==?", a: "'is' checks object identity (same object in memory), '==' checks value equality." }
    ],
    React: [
      { q: "What is JSX?", a: "JSX is a syntax extension for JavaScript that allows writing HTML-like code in React components." },
      { q: "What is the difference between state and props?", a: "State is internal component data that can change, props are external data passed from parent components (read-only)." },
      { q: "What is useEffect hook?", a: "useEffect is a hook that lets you perform side effects in functional components (like componentDidMount, componentDidUpdate)." },
      { q: "What is the Virtual DOM?", a: "A JavaScript representation of the real DOM that React uses to optimize rendering by comparing changes before updating the actual DOM." },
      { q: "What is useState hook?", a: "useState is a hook that lets you add state to functional components, returning current state and a setter function." }
    ],
    CSS: [
      { q: "What is the box model?", a: "The box model consists of content, padding, border, and margin that define the space occupied by an element." },
      { q: "What is flexbox?", a: "Flexbox is a CSS layout method for arranging items in rows or columns with flexible sizing and alignment options." },
      { q: "What is the difference between margin and padding?", a: "Margin is space outside the element's border, padding is space inside the element's border around the content." },
      { q: "What is CSS Grid?", a: "CSS Grid is a 2D layout system that allows creating complex layouts with rows and columns." },
      { q: "What is specificity?", a: "CSS specificity determines which styles are applied when multiple rules target the same element, based on selector types." }
    ]
  };

  const templates = flashcardTemplates[subject as keyof typeof flashcardTemplates] || flashcardTemplates.JavaScript;
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  
  return templates.map((template, index) => ({
    id: `${subject.toLowerCase()}-${Date.now()}-${index}`,
    subject,
    question: template.q,
    answer: template.a,
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    isLearned: Math.random() > 0.7,
    createdAt: new Date().toISOString()
  }));
};

const FlashcardViewer = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
  const [showLearnedOnly, setShowLearnedOnly] = useState(false);

  useEffect(() => {
    generateNewFlashcards();
  }, []);

  useEffect(() => {
    let filtered = flashcards;
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(card => card.subject === selectedSubject);
    }
    
    if (showLearnedOnly) {
      filtered = filtered.filter(card => !card.isLearned);
    }
    
    setFilteredCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards, selectedSubject, showLearnedOnly]);

  const generateNewFlashcards = () => {
    const allNewCards: Flashcard[] = [];
    const subjects = selectedSubject === 'all' ? 
      programmingSubjects.slice(0, 6) : 
      [selectedSubject];
    
    subjects.forEach(subject => {
      allNewCards.push(...generateProgrammingFlashcards(subject));
    });
    
    setFlashcards(allNewCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const markAsLearned = () => {
    const updatedCards = flashcards.map(card => 
      card.id === filteredCards[currentIndex]?.id 
        ? { ...card, isLearned: true }
        : card
    );
    setFlashcards(updatedCards);
  };

  const shuffleCards = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setFilteredCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard = filteredCards[currentIndex];
  const progress = filteredCards.length > 0 ? ((currentIndex + 1) / filteredCards.length) * 100 : 0;
  const learnedCount = flashcards.filter(card => card.isLearned).length;

  if (!currentCard) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Programming Flashcards</h2>
            <p className="text-gray-600 dark:text-gray-400">Master programming concepts with interactive flashcards</p>
          </div>
          <Button onClick={generateNewFlashcards} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New Cards
          </Button>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No flashcards available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Generate some programming flashcards to start learning!</p>
            <Button onClick={generateNewFlashcards}>Generate Flashcards</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Programming Flashcards</h2>
          <p className="text-gray-600 dark:text-gray-400">Learn programming concepts interactively</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateNewFlashcards} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            New Cards
          </Button>
          <Button onClick={shuffleCards} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
                <p className="text-2xl font-bold">{flashcards.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Learned</p>
                <p className="text-2xl font-bold">{learnedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-2xl font-bold">{Math.round(progress)}%</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {programmingSubjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant={showLearnedOnly ? "default" : "outline"}
          onClick={() => setShowLearnedOnly(!showLearnedOnly)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showLearnedOnly ? 'Show All' : 'Hide Learned'}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Card {currentIndex + 1} of {filteredCards.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <Card 
            className={`h-80 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
              isFlipped ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
            }`}
            onClick={handleCardClick}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{currentCard.subject}</Badge>
                <Badge variant={currentCard.difficulty === 'easy' ? 'default' : 
                                currentCard.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                  {currentCard.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48 p-6">
              <div className="text-center">
                {!isFlipped ? (
                  <>
                    <Brain className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-4">Question:</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                      {currentCard.question}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Click to reveal answer
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Answer:</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                      {currentCard.answer}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        
        <Button onClick={handleCardClick} className="bg-blue-600 hover:bg-blue-700">
          <RotateCcw className="h-4 w-4 mr-2" />
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </Button>
        
        <Button 
          onClick={handleNext} 
          disabled={currentIndex === filteredCards.length - 1}
          variant="outline"
        >
          Next
        </Button>
      </div>

      {/* Action Buttons */}
      {isFlipped && (
        <div className="flex justify-center gap-4">
          <Button 
            onClick={markAsLearned}
            className="bg-green-600 hover:bg-green-700"
            disabled={currentCard.isLearned}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {currentCard.isLearned ? 'Already Learned' : 'Mark as Learned'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlashcardViewer;
