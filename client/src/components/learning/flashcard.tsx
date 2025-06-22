import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface FlashcardProps {
  question: {
    character?: string;
    romanji?: string;
    meaning?: string;
    question: string;
    correctAnswer: string;
    explanation?: string;
  };
  onAnswer: (isCorrect: boolean) => void;
}

export function Flashcard({ question, onAnswer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
  };

  const handleAnswer = (difficulty: 'hard' | 'good' | 'easy') => {
    const isCorrect = difficulty !== 'hard';
    onAnswer(isCorrect);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="min-h-96 bg-white shadow-xl">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center h-96">
          {!isFlipped ? (
            // Front of card
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">{question.question}</h2>
              {question.character && (
                <div className="text-6xl font-bold text-foreground mb-4">{question.character}</div>
              )}
              {question.romanji && (
                <p className="text-lg text-muted-foreground mb-6">{question.romanji}</p>
              )}
              <Button 
                onClick={handleFlip}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Show Answer</span>
              </Button>
            </div>
          ) : (
            // Back of card
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-2xl font-bold text-foreground mb-4">{question.correctAnswer}</div>
              {question.explanation && (
                <p className="text-muted-foreground mb-6 text-center">{question.explanation}</p>
              )}
              
              {showAnswer && (
                <div className="flex space-x-3 mt-4">
                  <Button 
                    variant="destructive"
                    onClick={() => handleAnswer('hard')}
                  >
                    Hard
                  </Button>
                  <Button 
                    className="bg-accent hover:bg-accent/90"
                    onClick={() => handleAnswer('good')}
                  >
                    Good
                  </Button>
                  <Button 
                    className="bg-secondary hover:bg-secondary/90"
                    onClick={() => handleAnswer('easy')}
                  >
                    Easy
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
