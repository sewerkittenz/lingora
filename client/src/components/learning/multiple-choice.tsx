import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface MultipleChoiceProps {
  question: {
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanation?: string;
  };
  onAnswer: (isCorrect: boolean) => void;
}

export function MultipleChoice({ question, onAnswer }: MultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedOption(index);
    setShowResult(true);
    
    const isCorrect = index === question.correctAnswer;
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedOption(null);
      setShowResult(false);
    }, 1500);
  };

  const getOptionColor = (index: number) => {
    if (!showResult) {
      return selectedOption === index 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-muted hover:bg-muted/80 border-transparent hover:border-primary";
    }

    if (index === question.correctAnswer) {
      return "bg-secondary text-secondary-foreground border-secondary";
    }
    
    if (selectedOption === index && index !== question.correctAnswer) {
      return "bg-destructive text-destructive-foreground border-destructive";
    }

    return "bg-muted border-transparent";
  };

  const getOptionIcon = (index: number) => {
    if (!showResult) return null;

    if (index === question.correctAnswer) {
      return <Check className="w-5 h-5" />;
    }
    
    if (selectedOption === index && index !== question.correctAnswer) {
      return <X className="w-5 h-5" />;
    }

    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="min-h-96 bg-white shadow-xl">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Multiple Choice</h2>
            <h3 className="text-xl font-bold text-foreground mb-6">{question.question}</h3>
          </div>

          <div className="w-full space-y-3">
            {question.options?.map((option, index) => {
              const Icon = getOptionIcon(index);
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full p-4 h-auto text-left transition-all duration-200 border-2 ${getOptionColor(index)}`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{option}</span>
                    {Icon && <div className="ml-2">{Icon}</div>}
                  </div>
                </Button>
              );
            })}
          </div>

          {showResult && question.explanation && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
