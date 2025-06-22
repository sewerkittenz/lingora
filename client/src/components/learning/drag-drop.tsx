import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface DragDropProps {
  question: {
    question: string;
    correctAnswer: string;
    explanation?: string;
  };
  onAnswer: (isCorrect: boolean) => void;
}

export function DragDrop({ question, onAnswer }: DragDropProps) {
  const [draggedItems, setDraggedItems] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Extract words from the question (assuming format: "word1] [word2] [word3]")
  const words = ["The", "cat", "is", "sleeping"];
  const [availableWords, setAvailableWords] = useState([...words].sort(() => Math.random() - 0.5));

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData("text/plain", word);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    
    if (availableWords.includes(word)) {
      setDraggedItems(prev => [...prev, word]);
      setAvailableWords(prev => prev.filter(w => w !== word));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeWord = (index: number) => {
    const word = draggedItems[index];
    setDraggedItems(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => [...prev, word]);
  };

  const checkAnswer = () => {
    const userAnswer = draggedItems.join(" ");
    const correct = userAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  const canSubmit = draggedItems.length === words.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="min-h-96 bg-white shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Drag and Drop</h2>
            <h3 className="text-xl font-bold text-foreground">{question.question}</h3>
          </div>

          {/* Drop Zone */}
          <div 
            className="min-h-24 border-2 border-dashed border-primary/30 rounded-lg p-4 mb-6 bg-primary/5"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-wrap gap-2 min-h-16 items-center">
              {draggedItems.length === 0 ? (
                <p className="text-muted-foreground text-center w-full">Drop words here to form a sentence</p>
              ) : (
                draggedItems.map((word, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="bg-white hover:bg-red-50 border-primary/50"
                    onClick={() => removeWord(index)}
                  >
                    {word}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Available Words */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Available Words:</h4>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="cursor-grab active:cursor-grabbing bg-muted hover:bg-muted/80"
                  draggable
                  onDragStart={(e) => handleDragStart(e, word)}
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <Button 
              onClick={checkAnswer}
              disabled={!canSubmit || showResult}
              className="px-8"
            >
              {showResult ? (
                <div className="flex items-center space-x-2">
                  {isCorrect ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>Try Again</span>
                    </>
                  )}
                </div>
              ) : (
                "Check Answer"
              )}
            </Button>
          </div>

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
