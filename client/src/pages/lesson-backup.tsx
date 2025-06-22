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
type QuizMode = 'flashcard' | 'fill-blank' | 'multiple-choice' | 'type-answer' | 'drag-drop' | 'matching' | 'writing';

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
  const [flashcardAnswered, setFlashcardAnswered] = useState(false);
  const [completedItems, setCompletedItems] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [skippedItems, setSkippedItems] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showWritingMode, setShowWritingMode] = useState(false);

  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [originalItems, setOriginalItems] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real lesson content
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        
        // Parse lesson ID format: languageCode-lessonNumber (e.g., "ja-1" or "zh-5")
        const [languageCode, lessonNumberStr] = (lessonId || "ja-1").split('-');
        const lessonNumber = parseInt(lessonNumberStr || "1");
        
        try {
          const items = await loadLessonContent(languageCode, lessonNumber);
          const expandedItems = expandToHundredItems(items as QuizItem[], languageCode, lessonNumber);
          setOriginalItems(expandedItems);
          setQuizItems(expandedItems);
        } catch (contentError) {
          console.warn("Using fallback content for lesson", lessonId);
          const fallbackItems = generateFallbackQuiz(languageCode, lessonNumber);
          setOriginalItems(fallbackItems);
          setQuizItems(fallbackItems);
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

  const expandToHundredItems = (items: QuizItem[], languageCode: string, lessonNumber: number): QuizItem[] => {
    const expandedItems: QuizItem[] = [...items];
    
    // Generate additional items until we have 100
    while (expandedItems.length < 100) {
      const baseIndex = expandedItems.length;
      
      // Create variations of existing items
      items.forEach((item, index) => {
        if (expandedItems.length >= 100) return;
        
        // Add reverse translation
        if (item.type === 'vocab' && item.translation) {
          expandedItems.push({
            id: `${item.id}-reverse-${baseIndex}`,
            type: 'vocab',
            question: `How do you say "${item.translation}" in ${getLanguageName(languageCode)}?`,
            answer: item.question.includes('"') ? item.question.split('"')[1] : item.answer,
            options: generateOptions(item.answer, languageCode),
            translation: item.translation,
            pronunciation: item.pronunciation,
            difficulty: item.difficulty
          });
        }
        
        // Add pronunciation exercises for languages with special scripts
        if (['ja', 'zh', 'ko', 'ru'].includes(languageCode) && item.pronunciation) {
          expandedItems.push({
            id: `${item.id}-pronunciation-${baseIndex}`,
            type: 'pronunciation',
            question: `What is the pronunciation of "${item.answer}"?`,
            answer: item.pronunciation,
            options: generatePronunciationOptions(item.pronunciation, languageCode),
            translation: item.translation,
            difficulty: (item.difficulty || 1) + 1
          });
        }
        
        // Add writing exercises
        if (['ja', 'zh', 'ko', 'ru', 'hr'].includes(languageCode)) {
          expandedItems.push({
            id: `${item.id}-writing-${baseIndex}`,
            type: 'writing',
            question: `Write the ${getLanguageName(languageCode)} word for "${item.translation || item.answer}"`,
            answer: item.question.includes('"') ? item.question.split('"')[1] : item.answer,
            translation: item.translation,
            pronunciation: item.pronunciation,
            difficulty: (item.difficulty || 1) + 2
          });
        }
      });
      
      // If still not enough, generate additional vocabulary
      if (expandedItems.length < 100) {
        const additionalItem = generateAdditionalVocab(languageCode, lessonNumber, expandedItems.length);
        expandedItems.push(additionalItem);
      }
    }
    
    return expandedItems.slice(0, 100);
  };

  const generateAdditionalVocab = (languageCode: string, lessonNumber: number, index: number): QuizItem => {
    const vocabPatterns: { [key: string]: string[] } = {
      'ja': ['こんにちは', 'ありがとう', 'すみません', 'はい', 'いいえ', 'おはよう', 'こんばんは', 'さようなら'],
      'zh': ['你好', '谢谢', '对不起', '是', '不是', '早上好', '晚上好', '再见'],
      'ko': ['안녕하세요', '감사합니다', '죄송합니다', '네', '아니요', '좋은 아침', '좋은 저녁', '안녕히 가세요'],
      'ru': ['привет', 'спасибо', 'извините', 'да', 'нет', 'доброе утро', 'добрый вечер', 'до свидания'],
      'de': ['hallo', 'danke', 'entschuldigung', 'ja', 'nein', 'guten morgen', 'guten abend', 'auf wiedersehen'],
      'es': ['hola', 'gracias', 'perdón', 'sí', 'no', 'buenos días', 'buenas noches', 'adiós'],
      'hr': ['zdravo', 'hvala', 'oprostite', 'da', 'ne', 'dobro jutro', 'dobra večer', 'doviđenja']
    };

    const englishMeanings: { [key: string]: string[] } = {
      'ja': ['hello', 'thank you', 'excuse me', 'yes', 'no', 'good morning', 'good evening', 'goodbye'],
      'zh': ['hello', 'thank you', 'sorry', 'yes', 'no', 'good morning', 'good evening', 'goodbye'],
      'ko': ['hello', 'thank you', 'sorry', 'yes', 'no', 'good morning', 'good evening', 'goodbye'],
      'ru': ['hello', 'thank you', 'excuse me', 'yes', 'no', 'good morning', 'good evening', 'goodbye'],
      'de': ['hello', 'thank you', 'excuse me', 'yes', 'no', 'good morning', 'good evening', 'goodbye'],
      'es': ['hello', 'thank you', 'sorry', 'yes', 'no', 'good morning', 'good evening', 'goodbye'],
      'hr': ['hello', 'thank you', 'excuse me', 'yes', 'no', 'good morning', 'good evening', 'goodbye']
    };

    const words = vocabPatterns[languageCode] || vocabPatterns['es'];
    const meanings = englishMeanings[languageCode] || englishMeanings['es'];
    const wordIndex = index % words.length;

    return {
      id: `additional-${index}`,
      type: 'vocab',
      question: `What does "${words[wordIndex]}" mean?`,
      answer: meanings[wordIndex],
      options: generateOptions(meanings[wordIndex], languageCode),
      translation: meanings[wordIndex],
      difficulty: 1
    };
  };

  const generateOptions = (correct: string, languageCode: string): string[] => {
    const commonWords = [
      'hello', 'goodbye', 'thank you', 'please', 'yes', 'no', 'good', 'bad', 
      'big', 'small', 'hot', 'cold', 'new', 'old', 'fast', 'slow'
    ];
    
    const options = [correct];
    const availableOptions = commonWords.filter(word => word !== correct.toLowerCase());
    
    while (options.length < 4 && availableOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      options.push(availableOptions.splice(randomIndex, 1)[0]);
    }
    
    return shuffleArray(options);
  };

  const generatePronunciationOptions = (correct: string, languageCode: string): string[] => {
    const pronunciationVariants: { [key: string]: string[] } = {
      'ja': ['ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so'],
      'zh': ['ma', 'ba', 'pa', 'fa', 'da', 'ta', 'na', 'la'],
      'ko': ['ga', 'na', 'da', 'ra', 'ma', 'ba', 'sa', 'a'],
      'ru': ['da', 'net', 'kak', 'gde', 'chto', 'kto', 'kogda', 'pochemu']
    };

    const variants = pronunciationVariants[languageCode] || ['a', 'e', 'i', 'o'];
    const options = [correct];
    
    while (options.length < 4) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      if (!options.includes(variant)) {
        options.push(variant);
      }
    }
    
    return shuffleArray(options);
  };

  const getLanguageName = (code: string): string => {
    const names: { [key: string]: string } = {
      'ja': 'Japanese', 'zh': 'Chinese', 'ko': 'Korean', 'ru': 'Russian',
      'de': 'German', 'es': 'Spanish', 'hr': 'Serbo-Croatian'
    };
    return names[code] || 'Unknown';
  };

  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffleQuiz = () => {
    setQuizItems(shuffleArray([...originalItems]));
    setIsShuffled(true);
    setCurrentQuestion(0);
    setIsAnswered(false);
    setShowFeedback(false);
  };

  const skipQuestion = () => {
    setSkippedItems(prev => prev + 1);
    nextQuestion();
  };

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

  const playSound = (type: 'correct' | 'incorrect' | 'click' | 'finish') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handleAnswer = (answer: string) => {
    setUserAnswer(answer);
    setIsAnswered(true);
    
    // More flexible answer validation with null checks
    const normalizeAnswer = (str: string | undefined) => 
      str ? str.toLowerCase().trim().replace(/[^\w\s]/g, '') : '';
    const userNormalized = normalizeAnswer(answer);
    const correctNormalized = normalizeAnswer(currentItem?.answer);
    
    // Check for exact match or acceptable variations
    const correct = userNormalized === correctNormalized || 
                   (currentItem?.answer?.toLowerCase() || '').includes(userNormalized) ||
                   userNormalized.includes(correctNormalized);
    
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
      playSound('correct');
    } else {
      setHearts(Math.max(0, hearts - 1));
      setStreak(0);
      setIncorrectAnswers(incorrectAnswers + 1);
      playSound('incorrect');
    }
    
    setShowFeedback(true);
    
    // Auto advance after feedback for non-flashcard modes
    if (quizMode !== 'flashcard') {
      setTimeout(() => {
        handleNext();
      }, 2000);
    }
  };

  const handleFlashcardAnswer = (difficulty: 'easy' | 'ok' | 'hard') => {
    if (flashcardAnswered) return;
    
    setFlashcardAnswered(true);
    
    // Logic: Easy = correct, OK = somewhat correct, Hard = incorrect
    if (difficulty === 'easy') {
      setIsCorrect(true);
      setScore(score + 10);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
    } else if (difficulty === 'ok') {
      setIsCorrect(true);
      setScore(score + 5);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setIsCorrect(false);
      setHearts(Math.max(0, hearts - 1));
      setStreak(0);
      setIncorrectAnswers(incorrectAnswers + 1);
    }
    
    setShowFeedback(true);
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    const nextQuestion = currentQuestion + 1;
    setCompletedItems(completedItems + 1);
    
    // Check if we've completed 25 items (one batch)
    if (nextQuestion % 25 === 0 && nextQuestion < quizItems.length) {
      playSound('finish');
      setShowSummary(true);
      return;
    }
    
    if (nextQuestion < quizItems.length) {
      setCurrentQuestion(nextQuestion);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowFeedback(false);
      setFlashcardAnswered(false);
    } else {
      // Lesson complete
      playSound('finish');
      setShowSummary(true);
    }
  };

  const handleSkip = () => {
    setStreak(0);
    setSkippedItems(skippedItems + 1);
    handleNext();
  };

  const continueLearning = () => {
    playSound('click');
    setShowSummary(false);
    setCurrentBatch(currentBatch + 1);
  };

  const restartBatch = () => {
    playSound('click');
    const batchStart = (currentBatch - 1) * 25;
    setCurrentQuestion(batchStart);
    setShowSummary(false);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowFeedback(false);
    setFlashcardAnswered(false);
    // Reset statistics for the batch
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSkippedItems(0);
    setCompletedItems(0);
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
                  onClick={() => {
                    if (!isAnswered) {
                      playSound('click');
                      handleAnswer(option);
                    }
                  }}
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
                <Button variant="destructive" onClick={() => {
                  playSound('click');
                  handleFlashcardAnswer("hard");
                }} disabled={flashcardAnswered}>
                  Hard
                </Button>
                <Button variant="outline" onClick={() => {
                  playSound('click');
                  handleFlashcardAnswer("ok");
                }} disabled={flashcardAnswered}>
                  OK
                </Button>
                <Button variant="default" onClick={() => {
                  playSound('click');
                  handleFlashcardAnswer("easy");
                }} disabled={flashcardAnswered}>
                  Easy
                </Button>
              </div>
            )}
          </div>
        );

      case 'fill-blank':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Fill in the blank</h2>
              <p className="text-lg">{currentItem.question}</p>
            </div>
            
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Fill in the blank..."
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

      case 'drag-drop':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Match the pairs</h2>
              <p className="text-lg">{currentItem.question}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Words</h3>
                {currentItem.options?.slice(0, 3).map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full p-3"
                    onClick={() => {
                    if (!isAnswered) {
                      playSound('click');
                      handleAnswer(option);
                    }
                  }}
                    disabled={isAnswered}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Meanings</h3>
                {currentItem.options?.slice(3, 6).map((option, index) => (
                  <div key={index} className="p-3 border rounded-md bg-muted/50">
                    {option}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-muted-foreground">Quiz mode not supported</p>
          </div>
        );
    }
  };

  // Summary Modal Component
  const SummaryModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="p-8 max-w-md mx-4">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold">Batch Complete!</h2>
          <div className="space-y-2 text-left">
            <p>Words learned: <span className="font-semibold">{completedItems}</span></p>
            <p>Correct answers: <span className="font-semibold text-green-600">{correctAnswers}</span></p>
            <p>Incorrect answers: <span className="font-semibold text-red-600">{incorrectAnswers}</span></p>
            <p>Skipped items: <span className="font-semibold text-yellow-600">{skippedItems}</span></p>
          </div>
          <div className="flex gap-2 pt-4">
            {currentQuestion < quizItems.length - 1 && (
              <Button onClick={continueLearning} className="flex-1">
                Continue
              </Button>
            )}
            <Button onClick={restartBatch} variant="outline" className="flex-1">
              Restart
            </Button>
            <Button onClick={() => setLocation("/lessons")} variant="secondary" className="flex-1">
              Finish
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

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
      
      {/* Summary Modal */}
      {showSummary && <SummaryModal />}
    </div>
  );
}