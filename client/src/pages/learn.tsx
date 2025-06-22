import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Heart } from "lucide-react";
import { Flashcard } from "@/components/learning/flashcard";
import { MultipleChoice } from "@/components/learning/multiple-choice";
import { DragDrop } from "@/components/learning/drag-drop";
import { FillBlanks } from "@/components/learning/fill-blanks";
import { LessonSettingsOverlay, type LessonSettings } from "@/components/learning/lesson-settings";
import { useSoundEffects } from "@/components/learning/sound-effects";
import { useAuth } from "@/hooks/use-auth";

export default function Learn() {
  const { lessonId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hearts, setHearts] = useState(user?.hearts || 5);
  const [itemsAnswered, setItemsAnswered] = useState(0);
  const [settings, setSettings] = useState<LessonSettings>({
    flashcards: true,
    dragAndDrop: true,
    fillInBlank: true,
    typing: true,
    multipleChoice: true,
    matching: true,
    itemsBeforeBreak: 25,
  });
  
  const { playCorrect, playIncorrect, playSkip } = useSoundEffects();

  // Load lesson data from API
  const { data: lessonData } = useQuery({
    queryKey: ["/api/lessons", lessonId],
    enabled: !!lessonId,
  });

  const questions = lessonData?.items || [];

  useEffect(() => {
    if (questions.length > 0) {
      setProgress((currentQuestionIndex / questions.length) * 100);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleAnswer = (isCorrect: boolean) => {
    setItemsAnswered(prev => prev + 1);
    
    if (isCorrect) {
      playCorrect();
      // Check if it's time for a break
      if (itemsAnswered > 0 && itemsAnswered % settings.itemsBeforeBreak === 0) {
        // Show break screen
        setTimeout(() => {
          // Continue after break
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
          } else {
            // Lesson complete
            setLocation('/lessons');
          }
        }, 2000);
      } else {
        // Move to next question
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
        } else {
          // Lesson complete
          setLocation('/lessons');
        }
      }
    } else {
      playIncorrect();
      // Wrong answer - lose a heart
      setHearts(Math.max(0, hearts - 1));
      if (hearts <= 1) {
        // No more hearts - go back to lessons
        setLocation('/lessons');
      }
    }
  };

  const handleSkip = () => {
    playSkip();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    } else {
      setLocation('/lessons');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!lessonData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading lesson...</h2>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson Complete!</h2>
          <Button onClick={() => setLocation('/lessons')}>
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/lessons')}
            className="text-neutral-600 hover:text-neutral-800"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-3" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-red-500">
              <Heart className="h-5 w-5 fill-current" />
              <span className="font-semibold">{hearts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <LessonSettingsOverlay 
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center space-y-4">
            {/* Render based on lesson item type */}
            {currentQuestion.type === 'hiragana' || currentQuestion.type === 'katakana' || currentQuestion.type === 'kanji' ? (
              <Flashcard
                character={currentQuestion.character!}
                romanji={currentQuestion.romanji || currentQuestion.romanization!}
                meaning={currentQuestion.meaning || currentQuestion.english!}
                onAnswer={handleAnswer}
              />
            ) : currentQuestion.type === 'vocabulary' ? (
              <MultipleChoice
                question={`What does "${currentQuestion.word || currentQuestion.character}" mean?`}
                options={[
                  currentQuestion.english || currentQuestion.meaning!,
                  "Wrong answer 1",
                  "Wrong answer 2", 
                  "Wrong answer 3"
                ]}
                correctAnswer={0}
                onAnswer={handleAnswer}
              />
            ) : (
              <div className="p-8 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Study Item</h3>
                <div className="space-y-2">
                  {currentQuestion.character && (
                    <div className="text-4xl font-bold text-primary">
                      {currentQuestion.character}
                    </div>
                  )}
                  {currentQuestion.word && (
                    <div className="text-3xl font-bold text-primary">
                      {currentQuestion.word}
                    </div>
                  )}
                  {(currentQuestion.romanji || currentQuestion.romanization || currentQuestion.pinyin) && (
                    <div className="text-lg text-muted-foreground">
                      {currentQuestion.romanji || currentQuestion.romanization || currentQuestion.pinyin}
                    </div>
                  )}
                  <div className="text-lg">
                    {currentQuestion.english || currentQuestion.meaning}
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => handleAnswer(false)}>
                    Hard
                  </Button>
                  <Button variant="outline" onClick={handleSkip}>
                    Good
                  </Button>
                  <Button onClick={() => handleAnswer(true)}>
                    Easy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}