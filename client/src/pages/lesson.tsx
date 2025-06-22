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
  RefreshCw,
  Shuffle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { loadLessonContent } from "@/data/lesson-content";
import { DragDropComponent } from "@/components/learning/drag-drop-component";

// Quiz modes
type QuizMode = 'flashcard' | 'fill-blank' | 'multiple-choice' | 'type-answer' | 'drag-drop' | 'matching' | 'writing';

interface QuizItem {
  id: string;
  type: 'vocab' | 'grammar' | 'writing' | 'kanji' | 'pronunciation' | 'hiragana' | 'vocabulary';
  question: string;
  answer: string;
  options?: string[];
  translation?: string;
  pronunciation?: string;
  example?: string;
  difficulty?: number;
  word?: string;
  character?: string;
  english?: string;
  meaning?: string;
  romanji?: string;
  romanization?: string;
  pinyin?: string;
}

interface MatchingItem {
  id: string;
  english: string;
  foreign: string;
  matched: boolean;
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
  const [currentBatchItems, setCurrentBatchItems] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionProgress, setSessionProgress] = useState({
    wordsLearned: 0,
    correctCount: 0,
    incorrectCount: 0,
    skippedCount: 0,
    currentBatch: 1,
    totalBatches: 4 // 100 items / 25 = 4 batches
  });
  const [incorrectItems, setIncorrectItems] = useState<QuizItem[]>([]);
  const [showBatchSummary, setShowBatchSummary] = useState(false);
  const [currentLanguageCode, setCurrentLanguageCode] = useState('ja');

  // Matching mode state
  const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([]);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedForeign, setSelectedForeign] = useState<string | null>(null);

  // Drag and drop state
  const [draggedItems, setDraggedItems] = useState<string[]>([]);
  const [droppedItems, setDroppedItems] = useState<string[]>([]);

  // Utility functions
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getLanguageName = (code: string): string => {
    const names: { [key: string]: string } = {
      'ja': 'Japanese', 'zh': 'Chinese', 'ko': 'Korean', 'ru': 'Russian',
      'de': 'German', 'es': 'Spanish', 'hr': 'Serbo-Croatian'
    };
    return names[code] || 'Unknown';
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
    const word = words[wordIndex];
    const meaning = meanings[wordIndex];

    return {
      id: `additional-${index}`,
      type: 'vocab',
      question: `What does "${word}" mean?`,
      answer: meaning,
      options: generateOptions(meaning, languageCode),
      translation: meaning,
      pronunciation: word,
      difficulty: 1
    };
  };

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

  const generateFallbackQuiz = (languageCode: string = 'ja', lessonNumber: number = 1): QuizItem[] => {
    const items: QuizItem[] = [];
    
    for (let i = 0; i < 100; i++) {
      items.push(generateAdditionalVocab(languageCode, lessonNumber, i));
    }
    
    return items;
  };

  // Load real lesson content
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        
        // Parse lesson ID format: languageCode-lessonNumber (e.g., "ja-1" or "zh-5")
        const [languageCode, lessonNumberStr] = (lessonId || "ja-1").split('-');
        const lessonNumber = parseInt(lessonNumberStr || "1");
        setCurrentLanguageCode(languageCode);
        
        try {
          const items = await loadLessonContent(languageCode, lessonNumber);
          if (!items || items.length === 0) {
            throw new Error("No lesson content available");
          }
          
          const expandedItems = expandToHundredItems(items as QuizItem[], languageCode, lessonNumber);
          setOriginalItems(expandedItems);
          
          // Set first batch of 25 items
          const firstBatch = expandedItems.slice(0, 25);
          setQuizItems(firstBatch);
          setCurrentBatchItems(firstBatch);
          
          // Initialize coherent matching items for matching mode - exactly 12 pairs
          const validItems = firstBatch.filter(item => item && item.answer && item.translation);
          const matching = validItems.slice(0, 12).map((item, index) => {
            // Clean foreign word (remove numbers and variants)
            let foreignWord = item.answer;
            if (foreignWord.includes('(')) {
              foreignWord = foreignWord.split('(')[0].trim();
            }
            if (foreignWord.match(/\d+$/)) {
              foreignWord = foreignWord.replace(/\d+$/, '').trim();
            }
            
            // Clean English meaning
            let englishWord = item.translation || "Unknown";
            if (englishWord.includes('(')) {
              englishWord = englishWord.split('(')[0].trim();
            }
            
            return {
              id: `match-${index}`,
              english: englishWord,
              foreign: foreignWord,
              matched: false
            };
          });
          
          // Ensure we have exactly 12 unique pairs
          const uniqueMatching = matching.filter((item, index, self) => 
            index === self.findIndex((t) => t.english === item.english && t.foreign === item.foreign)
          ).slice(0, 12);
          
          setMatchingItems(uniqueMatching);
          
        } catch (contentError) {
          console.warn("Using fallback content for lesson", lessonId);
          const fallbackItems = generateFallbackQuiz(languageCode, lessonNumber);
          setOriginalItems(fallbackItems);
          setQuizItems(fallbackItems);
          
          // Set matching items for fallback too
          const fallbackMatching = fallbackItems.slice(0, 6).map((item, index) => ({
            id: `match-${index}`,
            english: item.translation || item.answer || "Unknown",
            foreign: item.answer || "Unknown",
            matched: false
          }));
          setMatchingItems(fallbackMatching);
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
        const fallbackItems = generateFallbackQuiz('ja', 1);
        setOriginalItems(fallbackItems);
        setQuizItems(fallbackItems);
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const currentItem = quizItems[currentQuestion];
  const progress = quizItems.length > 0 ? ((currentQuestion + 1) / quizItems.length) * 100 : 0;

  const shuffleQuiz = () => {
    setQuizItems(shuffleArray([...originalItems]));
    setIsShuffled(true);
    setCurrentQuestion(0);
    setIsAnswered(false);
    setShowFeedback(false);
  };

  const skipQuestion = () => {
    setSkippedItems(prev => prev + 1);
    setSessionProgress(prev => ({ ...prev, skippedCount: prev.skippedCount + 1 }));
    nextQuestion();
  };

  const handleAnswer = (answer: string) => {
    if (!currentItem) return;
    
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
    setShowFeedback(true);
    
    if (correct) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setSessionProgress(prev => ({ ...prev, correctCount: prev.correctCount + 1, wordsLearned: prev.wordsLearned + 1 }));
    } else {
      setHearts(prev => Math.max(0, prev - 1));
      setStreak(0);
      setIncorrectAnswers(prev => prev + 1);
      setSessionProgress(prev => ({ ...prev, incorrectCount: prev.incorrectCount + 1 }));
      // Add to incorrect items for review
      setIncorrectItems(prev => [...prev, currentItem]);
    }
  };

  const nextQuestion = () => {
    setCompletedItems(prev => prev + 1);
    
    if (currentQuestion < quizItems.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
      setShowFeedback(false);
      setFlashcardAnswered(false);
    } else {
      // Completed current batch of 25 items
      setShowBatchSummary(true);
    }
  };

  const continueToNextBatch = () => {
    const nextBatch = sessionProgress.currentBatch + 1;
    if (nextBatch <= sessionProgress.totalBatches) {
      const startIndex = (nextBatch - 1) * 25;
      const endIndex = Math.min(startIndex + 25, originalItems.length);
      const nextBatchItems = originalItems.slice(startIndex, endIndex);
      
      setQuizItems(nextBatchItems);
      setCurrentBatchItems(nextBatchItems);
      setCurrentQuestion(0);
      setSessionProgress(prev => ({ ...prev, currentBatch: nextBatch }));
      setShowBatchSummary(false);
      setUserAnswer("");
      setIsAnswered(false);
      setShowFeedback(false);
    } else {
      setShowSummary(true);
      setShowBatchSummary(false);
    }
  };

  const restartCurrentBatch = () => {
    setCurrentQuestion(0);
    setShowBatchSummary(false);
    setUserAnswer("");
    setIsAnswered(false);
    setShowFeedback(false);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSkippedItems(0);
  };

  const reviewIncorrectItems = () => {
    if (incorrectItems.length > 0) {
      setQuizItems(incorrectItems);
      setCurrentQuestion(0);
      setShowBatchSummary(false);
      setUserAnswer("");
      setIsAnswered(false);
      setShowFeedback(false);
    }
  };

  const handleMatchingSelection = (item: MatchingItem, type: 'english' | 'foreign') => {
    if (type === 'english') {
      setSelectedEnglish(selectedEnglish === item.english ? null : item.english);
    } else {
      setSelectedForeign(selectedForeign === item.foreign ? null : item.foreign);
    }

    // Check for match
    if (selectedEnglish && selectedForeign) {
      const englishItem = matchingItems.find(m => m.english === selectedEnglish);
      const foreignItem = matchingItems.find(m => m.foreign === selectedForeign);
      
      if (englishItem && foreignItem && englishItem.id === foreignItem.id) {
        // Correct match
        setMatchingItems(prev => prev.map(m => 
          m.id === englishItem.id ? { ...m, matched: true } : m
        ));
        setScore(prev => prev + 10);
      }
      
      setSelectedEnglish(null);
      setSelectedForeign(null);
    }
  };

  const renderQuizContent = () => {
    if (!currentItem) return null;

    switch (quizMode) {
      case 'multiple-choice':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{currentItem.question}</h3>
              {showRomaji && currentItem.pronunciation && (
                <p className="text-muted-foreground mb-4">{currentItem.pronunciation}</p>
              )}
            </div>
            
            <div className="space-y-3">
              {(currentItem?.options || []).map((option, index) => (
                <Button
                  key={index}
                  variant={isAnswered ? (option === currentItem?.answer ? "default" : "outline") : "outline"}
                  className={`w-full text-left p-4 h-auto ${
                    isAnswered 
                      ? option === currentItem?.answer 
                        ? "bg-green-100 border-green-500 text-green-700" 
                        : option === userAnswer 
                          ? "bg-red-100 border-red-500 text-red-700"
                          : ""
                      : "hover:bg-muted"
                  }`}
                  onClick={() => !isAnswered && handleAnswer(option)}
                  disabled={isAnswered}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Match the words</h3>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="font-medium text-center">{getLanguageName(currentLanguageCode)}</h4>
                {matchingItems.map((item) => (
                  <Button
                    key={`foreign-${item.id}`}
                    variant={selectedForeign === item.foreign ? "default" : "outline"}
                    className={`w-full ${item.matched ? "opacity-50" : ""}`}
                    onClick={() => !item.matched && handleMatchingSelection(item, 'foreign')}
                    disabled={item.matched}
                  >
                    {item.foreign}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-center">Meaning</h4>
                {shuffleArray(matchingItems).map((item) => (
                  <Button
                    key={`english-${item.id}`}
                    variant={selectedEnglish === item.english ? "default" : "outline"}
                    className={`w-full ${item.matched ? "opacity-50" : ""}`}
                    onClick={() => !item.matched && handleMatchingSelection(item, 'english')}
                    disabled={item.matched}
                  >
                    {item.english}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'drag-drop':
        return (
          <DragDropComponent
            question={currentItem.question}
            answer={currentItem.answer}
            onAnswer={handleAnswer}
            showWritingMode={showWritingMode}
            showRomaji={showRomaji}
            pronunciation={currentItem.pronunciation}
            languageCode={currentLanguageCode}
            allItems={currentBatchItems}
          />
        );

      case 'writing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{currentItem.question}</h3>
              {showRomaji && currentItem.pronunciation && (
                <p className="text-muted-foreground mb-4">Pronunciation: {currentItem.pronunciation}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="text-center text-lg p-6"
                disabled={isAnswered}
              />
              
              {!isAnswered && (
                <Button 
                  onClick={() => handleAnswer(userAnswer)}
                  className="w-full"
                  disabled={!userAnswer.trim()}
                >
                  Submit Answer
                </Button>
              )}
            </div>
          </div>
        );

      case 'flashcard':
        return (
          <div className="space-y-6">
            <Card className="min-h-[200px] flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="text-center p-8">
                {!flashcardAnswered ? (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{currentItem.question}</h3>
                    {showRomaji && currentItem.pronunciation && (
                      <p className="text-muted-foreground">{currentItem.pronunciation}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{currentItem.answer}</h3>
                    {currentItem.translation && (
                      <p className="text-lg text-muted-foreground">{currentItem.translation}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {!flashcardAnswered ? (
              <Button onClick={() => setFlashcardAnswered(true)} className="w-full">
                Show Answer
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsCorrect(false);
                    setIncorrectAnswers(prev => prev + 1);
                    nextQuestion();
                  }}
                >
                  Incorrect
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsCorrect(true);
                    setCorrectAnswers(prev => prev + 1);
                    setScore(prev => prev + 10);
                    nextQuestion();
                  }}
                >
                  Correct
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return renderQuizContent();
    }
  };

  if (isLoading || !currentItem || quizItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Lesson...</h3>
            <p className="text-muted-foreground">Preparing your learning content</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/lessons')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-semibold">{hearts}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{score}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shuffleQuiz}
                title="Shuffle questions"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} of {quizItems.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            {/* Quiz Mode Selector */}
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
              {(['flashcard', 'multiple-choice', 'matching', 'drag-drop', 'writing'] as QuizMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={quizMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuizMode(mode)}
                  className="capitalize"
                >
                  {mode.replace('-', ' ')}
                </Button>
              ))}
            </div>

            {renderQuizContent()}

            {/* Action Buttons */}
            {showFeedback && quizMode !== 'flashcard' && (
              <div className="mt-6 flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={skipQuestion}
                  className="flex-1"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </Button>
                <Button 
                  onClick={nextQuestion}
                  className="flex-1"
                >
                  {currentQuestion === quizItems.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Lesson Settings</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Show Romaji/Pronunciation</span>
                  <Button
                    variant={showRomaji ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRomaji(!showRomaji)}
                  >
                    {showRomaji ? "On" : "Off"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Writing Mode</span>
                  <Button
                    variant={showWritingMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowWritingMode(!showWritingMode)}
                  >
                    {showWritingMode ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batch Summary Modal */}
      {showBatchSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-6">Batch {sessionProgress.currentBatch} Complete!</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Words Learned:</span>
                  <span className="font-semibold">{sessionProgress.wordsLearned}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correct Answers:</span>
                  <span className="font-semibold text-green-600">{correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incorrect Answers:</span>
                  <span className="font-semibold text-red-600">{incorrectAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skipped:</span>
                  <span className="font-semibold text-yellow-600">{skippedItems}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  Batch {sessionProgress.currentBatch} of {sessionProgress.totalBatches}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={continueToNextBatch} className="w-full">
                  Continue to Next Batch
                </Button>
                <Button variant="outline" onClick={restartCurrentBatch} className="w-full">
                  Restart Current Batch
                </Button>
                {incorrectItems.length > 0 && (
                  <Button variant="outline" onClick={reviewIncorrectItems} className="w-full">
                    Review Incorrect Items ({incorrectItems.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Final Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-6">Lesson Complete!</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Total Words Learned:</span>
                  <span className="font-semibold">{sessionProgress.wordsLearned}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Correct:</span>
                  <span className="font-semibold text-green-600">{sessionProgress.correctCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Incorrect:</span>
                  <span className="font-semibold text-red-600">{sessionProgress.incorrectCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Skipped:</span>
                  <span className="font-semibold text-yellow-600">{sessionProgress.skippedCount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Score:</span>
                  <span>{score}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/lessons')}
                  className="flex-1"
                >
                  Back to Lessons
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentQuestion(0);
                    setShowSummary(false);
                    setScore(0);
                    setCorrectAnswers(0);
                    setIncorrectAnswers(0);
                    setSkippedItems(0);
                    setCompletedItems(0);
                    setSessionProgress({
                      wordsLearned: 0,
                      correctCount: 0,
                      incorrectCount: 0,
                      skippedCount: 0,
                      currentBatch: 1,
                      totalBatches: 4
                    });
                  }}
                  className="flex-1"
                >
                  Restart Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}