import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Settings, Heart } from "lucide-react";
import { Flashcard } from "@/components/learning/flashcard";
import { MultipleChoice } from "@/components/learning/multiple-choice";
import { DragDrop } from "@/components/learning/drag-drop";
import { FillBlanks } from "@/components/learning/fill-blanks";
import { useAuth } from "@/hooks/use-auth";

interface Question {
  id: number;
  type: 'flashcard' | 'multiple-choice' | 'drag-drop' | 'fill-blanks';
  character?: string;
  romanji?: string;
  meaning?: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export default function Learn() {
  const { lessonId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hearts, setHearts] = useState(user?.hearts || 5);
  const [showSettings, setShowSettings] = useState(false);

  // Mock lesson data - in real app this would come from API
  const mockQuestions: Question[] = [
    {
      id: 1,
      type: 'flashcard',
      character: 'あ',
      romanji: 'a',
      question: 'What does this character mean?',
      correctAnswer: 'The sound "ah" - like in "father"',
      explanation: 'あ (a) is the first character in the hiragana syllabary.'
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: 'Which character represents the "ka" sound?',
      options: ['あ', 'か', 'さ', 'た'],
      correctAnswer: 1,
      explanation: 'か (ka) represents the "ka" sound in Japanese.'
    },
    {
      id: 3,
      type: 'fill-blanks',
      question: 'Complete the sentence: I __ to the store.',
      correctAnswer: 'went',
      explanation: 'Past tense of "go" is "went".'
    },
    {
      id: 4,
      type: 'drag-drop',
      question: 'Arrange these words to form a sentence: [The] [cat] [is] [sleeping]',
      correctAnswer: 'The cat is sleeping',
      explanation: 'This forms a complete sentence in English.'
    }
  ];

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const totalQuestions = mockQuestions.length;

  useEffect(() => {
    setProgress((currentQuestionIndex / totalQuestions) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  const handleAnswer = (isCorrect: boolean) => {
    if (!isCorrect) {
      setHearts(prev => Math.max(0, prev - 1));
      if (hearts <= 1) {
        // Game over - redirect to lessons
        setLocation('/lessons');
        return;
      }
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Lesson completed
      setLocation('/lessons');
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setLocation('/lessons');
    }
  };

  const handleExit = () => {
    setLocation('/lessons');
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'flashcard':
        return <Flashcard question={currentQuestion} onAnswer={handleAnswer} />;
      case 'multiple-choice':
        return <MultipleChoice question={currentQuestion} onAnswer={handleAnswer} />;
      case 'drag-drop':
        return <DragDrop question={currentQuestion} onAnswer={handleAnswer} />;
      case 'fill-blanks':
        return <FillBlanks question={currentQuestion} onAnswer={handleAnswer} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-indigo-600 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between text-white">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={handleExit}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex-1 max-w-md">
            <Progress 
              value={progress} 
              className="h-3 bg-white/20 [&>div]:bg-white" 
            />
          </div>
          <span className="text-sm font-medium">{currentQuestionIndex + 1}/{totalQuestions}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
            <Heart className="w-4 h-4 text-red-400 mr-2 fill-current" />
            <span className="font-medium">{hearts}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Learning Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {renderQuestion()}
        </div>
      </main>

      {/* Controls */}
      <footer className="p-6 flex items-center justify-between text-white">
        <Button
          variant="ghost"
          className="text-white hover:text-white/80 hover:bg-white/20"
          onClick={handleSkip}
        >
          Skip
        </Button>

        <div className="flex space-x-3">
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => handleAnswer(false)}
          >
            Hard
          </Button>
          <Button
            className="bg-accent hover:bg-accent/90 text-white"
            onClick={() => handleAnswer(true)}
          >
            Good
          </Button>
          <Button
            className="bg-secondary hover:bg-secondary/90 text-white"
            onClick={() => handleAnswer(true)}
          >
            Easy
          </Button>
        </div>
      </footer>
    </div>
  );
}
