import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface FillBlanksProps {
  question: {
    question: string;
    correctAnswer: string;
    explanation?: string;
  };
  onAnswer: (isCorrect: boolean) => void;
}

export function FillBlanks({ question, onAnswer }: FillBlanksProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const correct = userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  const getInputColor = () => {
    if (!showResult) return "";
    return isCorrect 
      ? "border-secondary text-secondary focus:border-secondary" 
      : "border-destructive text-destructive focus:border-destructive";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="min-h-96 bg-white shadow-xl">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Fill in the Blank</h2>
            <h3 className="text-xl font-bold text-foreground">{question.question}</h3>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="relative mb-6">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className={`text-center text-lg py-4 ${getInputColor()}`}
                disabled={showResult}
                autoFocus
              />
              {showResult && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isCorrect ? (
                    <Check className="w-5 h-5 text-secondary" />
                  ) : (
                    <X className="w-5 h-5 text-destructive" />
                  )}
                </div>
              )}
            </div>

            <div className="text-center">
              <Button 
                type="submit"
                disabled={!userAnswer.trim() || showResult}
                className="px-8"
              >
                {showResult ? (
                  isCorrect ? "Correct!" : `Correct answer: ${question.correctAnswer}`
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>

          {showResult && question.explanation && (
            <div className="mt-6 p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
