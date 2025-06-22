import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Volume2, 
  Settings, 
  X, 
  Check, 
  SkipForward,
  Heart,
  Star,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { generateDirectLessons } from "@/data/lesson-structure";
import { loadLessonContent } from "@/data/lesson-content";
import { getLessonMapping } from "@/data/lesson-mapping";

// Quiz modes
type QuizMode = 'flashcard' | 'fill-blank' | 'multiple-choice' | 'type-answer' | 'drag-drop';

interface QuizItem {
  id: string;
  type: 'vocab' | 'grammar' | 'writing' | 'kanji' | 'pronunciation';
  question: string;
  answer: string;
  options?: string[];
  translation?: string;
  pronunciation?: string;
  example?: string;
  difficulty?: number;
}

export default function Lesson() {
  const { lessonId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('multiple-choice');
  const [showSettings, setShowSettings] = useState(false);

  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real lesson content
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        const lessonNum = parseInt(lessonId || "1");
        const mapping = getLessonMapping(lessonNum);
        
        try {
          const items = await loadLessonContent(mapping.languageCode, mapping.lessonNumber);
          setQuizItems(items as QuizItem[]);
        } catch (contentError) {
          console.warn("Using fallback content for lesson", lessonNum);
          setQuizItems(generateFallbackQuiz(mapping.languageCode, mapping.lessonNumber));
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
        setQuizItems(generateFallbackQuiz('ja', 1));
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const generateFallbackQuiz = (languageCode: string = 'ja', lessonNumber: number = 1): QuizItem[] => {
    const items: QuizItem[] = [];
    
    const vocabPatterns: { [key: string]: any } = {
      'ja': { word: '学習', meaning: 'study', pronunciation: 'gakushuu' },
      'zh': { word: '学习', meaning: 'study', pronunciation: 'xuéxí' },
      'ko': { word: '학습', meaning: 'study', pronunciation: 'haksseup' },
      'ru': { word: 'изучение', meaning: 'study', pronunciation: 'izucheniye' },
      'de': { word: 'Lernen', meaning: 'study', pronunciation: 'lernen' },
      'es': { word: 'aprender', meaning: 'study', pronunciation: 'aprender' },
      'hr': { word: 'učenje', meaning: 'study', pronunciation: 'ucenje' }
    };
    
    const pattern = vocabPatterns[languageCode] || vocabPatterns['ja'];
    
    for (let i = 0; i < 25; i++) {
      const itemNum = i + 1;
      items.push({
        id: `${lessonNumber}-${itemNum}`,
        type: i < 15 ? 'vocab' : i < 22 ? 'grammar' : 'writing',
        question: `What does "${pattern.word}${itemNum}" mean?`,
        answer: `${pattern.meaning} ${itemNum}`,
        options: [
          `${pattern.meaning} ${itemNum}`,
          `practice ${itemNum}`,
          `work ${itemNum}`,
          `read ${itemNum}`
        ],
        translation: `${pattern.meaning} ${itemNum}`,
        pronunciation: `${pattern.pronunciation}${itemNum}`,
        example: `Example with ${pattern.word}${itemNum}.`,
        difficulty: Math.ceil(itemNum / 5)
      });
    }
    
    return items;
  };
  const currentItem = quizItems[currentQuestion];
  const progress = ((currentQuestion) / quizItems.length) * 100;

  const handleAnswer = (answer: string) => {
    setUserAnswer(answer);
    setIsAnswered(true);
    const correct = answer.toLowerCase().trim() === currentItem.answer.toLowerCase().trim();
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
      setStreak(streak + 1);
    } else {
      setHearts(Math.max(0, hearts - 1));
      setStreak(0);
    }
    
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestion < quizItems.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowFeedback(false);
    } else {
      // Lesson complete
      setLocation("/lessons");
    }
  };

  const handleSkip = () => {
    setStreak(0);
    handleNext();
  };

  const renderQuizContent = () => {
    if (!currentItem) return null;

    switch (quizMode) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{currentItem.question}</h2>
              {currentItem.pronunciation && (
                <p className="text-muted-foreground">{currentItem.pronunciation}</p>
              )}
            </div>
            
            <div className="grid gap-3">
              {currentItem.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    isAnswered 
                      ? option === currentItem.answer 
                        ? "default" 
                        : option === userAnswer 
                          ? "destructive" 
                          : "outline"
                      : "outline"
                  }
                  onClick={() => !isAnswered && handleAnswer(option)}
                  disabled={isAnswered}
                  className="p-4 h-auto text-left justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'type-answer':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{currentItem.question}</h2>
              {currentItem.pronunciation && (
                <p className="text-muted-foreground">{currentItem.pronunciation}</p>
              )}
            </div>
            
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="text-lg p-4"
              disabled={isAnswered}
              onKeyPress={(e) => e.key === 'Enter' && !isAnswered && userAnswer && handleAnswer(userAnswer)}
            />
            
            {!isAnswered && (
              <Button 
                onClick={() => handleAnswer(userAnswer)}
                disabled={!userAnswer.trim()}
                className="w-full"
              >
                Submit Answer
              </Button>
            )}
          </div>
        );

      case 'flashcard':
        return (
          <div className="space-y-4">
            <Card className="p-8 text-center min-h-[200px] flex items-center justify-center cursor-pointer"
                  onClick={() => !isAnswered && setIsAnswered(true)}>
              <div>
                <h2 className="text-3xl font-bold mb-4">{currentItem.question}</h2>
                {isAnswered && (
                  <div className="space-y-2">
                    <p className="text-xl text-primary">{currentItem.answer}</p>
                    {currentItem.translation && (
                      <p className="text-muted-foreground">{currentItem.translation}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
            
            {isAnswered && (
              <div className="flex gap-2 justify-center">
                <Button variant="destructive" onClick={() => handleAnswer("wrong")}>
                  Hard
                </Button>
                <Button variant="outline" onClick={() => handleAnswer("ok")}>
                  Good
                </Button>
                <Button variant="default" onClick={() => handleAnswer(currentItem.answer)}>
                  Easy
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return renderQuizContent();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-xl font-semibold mb-2">Loading Lesson...</h2>
          <p className="text-muted-foreground">Preparing your learning materials</p>
        </Card>
      </div>
    );
  }

  if (hearts === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold mb-4">Out of Hearts!</h2>
          <p className="text-muted-foreground mb-6">
            You've run out of hearts. Take a break and try again later!
          </p>
          <div className="space-y-2">
            <Button onClick={() => setLocation("/lessons")} className="w-full">
              Back to Lessons
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setHearts(5)}
              className="w-full"
            >
              <Heart className="w-4 h-4 mr-2" />
              Refill Hearts
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/lessons")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            
            <div className="flex-1 mx-4">
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-bold">{hearts}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold">{score}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b bg-muted/50 p-4">
          <div className="container mx-auto">
            <h3 className="font-semibold mb-3">Quiz Mode</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'multiple-choice', label: 'Multiple Choice' },
                { key: 'type-answer', label: 'Type Answer' },
                { key: 'flashcard', label: 'Flashcards' },
                { key: 'fill-blank', label: 'Fill Blanks' },
                { key: 'drag-drop', label: 'Drag & Drop' }
              ].map(mode => (
                <Badge
                  key={mode.key}
                  variant={quizMode === mode.key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setQuizMode(mode.key as QuizMode)}
                >
                  {mode.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <Badge variant="outline" className="mb-2">
              {currentItem?.type} • Question {currentQuestion + 1} of {quizItems.length}
            </Badge>
            {streak > 0 && (
              <div className="flex items-center justify-center space-x-1 text-orange-500">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">{streak} streak</span>
              </div>
            )}
          </div>

          <Card className="p-6 mb-6">
            <CardContent className="p-0">
              {renderQuizContent()}
            </CardContent>
          </Card>

          {/* Feedback */}
          {showFeedback && (
            <Card className={`p-4 mb-4 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              
              {!isCorrect && (
                <p className="text-sm text-muted-foreground mb-2">
                  Correct answer: <strong>{currentItem.answer}</strong>
                </p>
              )}
              
              {currentItem.example && (
                <p className="text-sm text-muted-foreground">
                  Example: {currentItem.example}
                </p>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {showFeedback ? (
              <Button onClick={handleNext} className="flex-1">
                {currentQuestion < quizItems.length - 1 ? 'Continue' : 'Complete Lesson'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}