
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  RotateCcw, 
  CheckCircle, 
  X, 
  Search, 
  Filter,
  Zap,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Flashcard {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isLearned: boolean;
  lastReviewed: string;
  reviewCount: number;
}

const FlashcardViewer = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [studyMode, setStudyMode] = useState<'all' | 'unlearned'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadFlashcards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [flashcards, searchTerm, filterSubject, filterStatus, studyMode]);

  const loadFlashcards = () => {
    const saved = localStorage.getItem('studygenie_flashcards');
    if (saved) {
      const cards = JSON.parse(saved);
      setFlashcards(cards);
    } else {
      // Sample flashcards for demonstration
      const sampleCards: Flashcard[] = [
        {
          id: '1',
          topicId: '1',
          topicTitle: 'Calculus Integration',
          subject: 'Mathematics',
          question: 'What is the integral of x² dx?',
          answer: '(x³/3) + C, where C is the constant of integration',
          difficulty: 'medium',
          isLearned: false,
          lastReviewed: new Date().toISOString(),
          reviewCount: 0
        },
        {
          id: '2',
          topicId: '2',
          topicTitle: 'Quantum Mechanics',
          subject: 'Physics',
          question: 'What is the Schrödinger equation?',
          answer: 'iℏ ∂Ψ/∂t = ĤΨ, where Ψ is the wave function and Ĥ is the Hamiltonian operator',
          difficulty: 'hard',
          isLearned: false,
          lastReviewed: new Date().toISOString(),
          reviewCount: 0
        },
        {
          id: '3',
          topicId: '3',
          topicTitle: 'Organic Chemistry',
          subject: 'Chemistry',
          question: 'What is a nucleophilic substitution reaction?',
          answer: 'A reaction where a nucleophile replaces a leaving group in a molecule, common in organic chemistry',
          difficulty: 'medium',
          isLearned: true,
          lastReviewed: new Date().toISOString(),
          reviewCount: 3
        }
      ];
      setFlashcards(sampleCards);
      saveFlashcards(sampleCards);
    }
  };

  const saveFlashcards = (cards: Flashcard[]) => {
    localStorage.setItem('studygenie_flashcards', JSON.stringify(cards));
  };

  const applyFilters = () => {
    let filtered = [...flashcards];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.topicTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (filterSubject !== 'all') {
      filtered = filtered.filter(card => card.subject === filterSubject);
    }

    // Apply status filter
    if (filterStatus === 'learned') {
      filtered = filtered.filter(card => card.isLearned);
    } else if (filterStatus === 'unlearned') {
      filtered = filtered.filter(card => !card.isLearned);
    }

    // Apply study mode filter
    if (studyMode === 'unlearned') {
      filtered = filtered.filter(card => !card.isLearned);
    }

    setFilteredCards(filtered);
    if (filtered.length > 0 && currentCardIndex >= filtered.length) {
      setCurrentCardIndex(0);
    }
  };

  const generateFlashcards = async () => {
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

      const newFlashcards: Flashcard[] = [];
      
      topics.forEach((topic: any, topicIndex: number) => {
        // Generate 3-5 flashcards per topic
        const cardCount = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < cardCount; i++) {
          const sampleQuestions = [
            {
              q: `What are the key concepts in ${topic.title}?`,
              a: `The main concepts include fundamental principles, applications, and theoretical foundations of ${topic.title}.`
            },
            {
              q: `How does ${topic.title} relate to ${topic.subject}?`,
              a: `${topic.title} is a crucial component of ${topic.subject} that helps understand core principles and their applications.`
            },
            {
              q: `What are the practical applications of ${topic.title}?`,
              a: `${topic.title} has numerous applications in real-world scenarios, research, and advanced studies in ${topic.subject}.`
            }
          ];

          const questionData = sampleQuestions[i % sampleQuestions.length];
          
          newFlashcards.push({
            id: `generated-${Date.now()}-${topicIndex}-${i}`,
            topicId: topic.id,
            topicTitle: topic.title,
            subject: topic.subject,
            question: questionData.q,
            answer: questionData.a,
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
            isLearned: false,
            lastReviewed: new Date().toISOString(),
            reviewCount: 0
          });
        }
      });

      const allCards = [...flashcards, ...newFlashcards];
      setFlashcards(allCards);
      saveFlashcards(allCards);

      toast({
        title: "Flashcards Generated! 🧠",
        description: `Created ${newFlashcards.length} new flashcards from your topics`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsLearned = (cardId: string, learned: boolean) => {
    const updatedCards = flashcards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          isLearned: learned,
          lastReviewed: new Date().toISOString(),
          reviewCount: card.reviewCount + 1
        };
      }
      return card;
    });

    setFlashcards(updatedCards);
    saveFlashcards(updatedCards);

    toast({
      title: learned ? "Great job! 🎉" : "Keep practicing! 💪",
      description: learned ? "Card marked as learned" : "Card marked for review",
    });

    // Auto advance to next card
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (filteredCards.length === 0) return;
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    if (filteredCards.length === 0) return;
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false);
  };

  const getSubjects = () => {
    return [...new Set(flashcards.map(card => card.subject))];
  };

  const getStats = () => {
    const total = flashcards.length;
    const learned = flashcards.filter(card => card.isLearned).length;
    const unlearned = total - learned;
    const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
    
    return { total, learned, unlearned, percentage };
  };

  const stats = getStats();
  const currentCard = filteredCards[currentCardIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Flashcards</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Study with AI-generated flashcards
          </p>
        </div>
        <Button 
          onClick={generateFlashcards}
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
              Generate Cards
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-500">Total Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.learned}</div>
            <p className="text-sm text-gray-500">Learned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.unlearned}</div>
            <p className="text-sm text-gray-500">To Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.percentage}%</div>
            <p className="text-sm text-gray-500">Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Learning Progress</span>
            <span className="text-sm text-gray-500">{stats.learned}/{stats.total}</span>
          </div>
          <Progress value={stats.percentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {getSubjects().map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                <SelectItem value="learned">Learned</SelectItem>
                <SelectItem value="unlearned">To Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={studyMode} onValueChange={(value: 'all' | 'unlearned') => setStudyMode(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Study Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                <SelectItem value="unlearned">Review Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Viewer */}
      {filteredCards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {flashcards.length === 0 ? 'No Flashcards Yet' : 'No Cards Match Filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {flashcards.length === 0 
                ? 'Generate AI flashcards from your syllabus topics'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {flashcards.length === 0 && (
              <Button onClick={generateFlashcards} disabled={isGenerating}>
                <Zap className="h-4 w-4 mr-2" />
                Generate Your First Cards
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Card Counter */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Card {currentCardIndex + 1} of {filteredCards.length}
            </p>
          </div>

          {/* Flashcard */}
          <div className="flex justify-center">
            <div 
              className="relative w-full max-w-2xl h-80 cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front of card */}
                <Card className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        Question
                      </Badge>
                      <Badge className="bg-white/20 text-white">
                        {currentCard?.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-blue-100">
                      {currentCard?.subject} • {currentCard?.topicTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-full">
                    <p className="text-lg font-medium text-center px-6">
                      {currentCard?.question}
                    </p>
                  </CardContent>
                </Card>

                {/* Back of card */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-green-500 to-teal-600 text-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        Answer
                      </Badge>
                      <Badge className={`${currentCard?.isLearned ? 'bg-green-700' : 'bg-orange-500'} text-white`}>
                        {currentCard?.isLearned ? 'Learned' : 'Review'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-full">
                    <p className="text-lg font-medium text-center px-6">
                      {currentCard?.answer}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" onClick={prevCard}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-w-[100px]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isFlipped ? 'Show Question' : 'Show Answer'}
            </Button>

            <Button variant="outline" onClick={nextCard}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Learning Actions */}
          {isFlipped && currentCard && (
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => markAsLearned(currentCard.id, false)}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <X className="h-4 w-4 mr-2" />
                Need Review
              </Button>
              <Button
                onClick={() => markAsLearned(currentCard.id, true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Got It!
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Click the card to flip, or use keyboard arrows to navigate
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardViewer;
