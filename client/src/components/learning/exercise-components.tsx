import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/sounds";
import { Heart, Volume2, RotateCcw, Check, X, ArrowRight } from "lucide-react";

// Flashcard Component
export function FlashcardExercise({ question, onAnswer }: {
  question: any;
  onAnswer: (rating: 'bad' | 'ok' | 'good') => void;
}) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(true);
    soundManager.play('click');
  };

  const handleAnswer = (rating: 'bad' | 'ok' | 'good') => {
    soundManager.play(rating === 'bad' ? 'incorrect' : 'correct');
    onAnswer(rating);
    setFlipped(false);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        className={`w-full max-w-md h-64 relative cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? 'rotate-y-180' : ''
        }`}
        onClick={!flipped ? handleFlip : undefined}
      >
        {/* Front */}
        <Card className={`absolute inset-0 backface-hidden hover:shadow-lg transition-shadow ${
          !flipped ? 'opacity-100' : 'opacity-0'
        }`}>
          <CardContent className="flex items-center justify-center h-full text-center p-6">
            <div>
              <div className="text-3xl font-bold mb-4 text-blue-600">
                {question.question}
              </div>
              <p className="text-gray-500 text-sm">Click to reveal answer</p>
            </div>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className={`absolute inset-0 backface-hidden rotate-y-180 ${
          flipped ? 'opacity-100' : 'opacity-0'
        }`}>
          <CardContent className="flex items-center justify-center h-full text-center p-6">
            <div>
              <div className="text-2xl font-semibold mb-2 text-green-600">
                {question.answer}
              </div>
              <p className="text-gray-600 text-sm">How well did you know this?</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleAnswer('bad')}
          >
            <X className="h-4 w-4 mr-2" />
            Again
          </Button>
          <Button
            variant="outline"
            className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
            onClick={() => handleAnswer('ok')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Hard
          </Button>
          <Button
            variant="outline"
            className="border-green-200 text-green-600 hover:bg-green-50"
            onClick={() => handleAnswer('good')}
          >
            <Check className="h-4 w-4 mr-2" />
            Easy
          </Button>
        </div>
      )}
    </div>
  );
}

// Multiple Choice Component
export function MultipleChoiceExercise({ question, onAnswer }: {
  question: any;
  onAnswer: (correct: boolean, selectedAnswer: string) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const isCorrect = selectedOption === question.answer;
    soundManager.play(isCorrect ? 'correct' : 'incorrect');
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(isCorrect, selectedOption);
      setSelectedOption(null);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">{question.question}</h3>
      </div>

      <div className="grid gap-3 max-w-md mx-auto">
        {question.options.map((option: string, index: number) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.answer;
          const showResult = submitted;

          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "p-4 h-auto text-left justify-start transition-all duration-200",
                isSelected && !showResult && "border-blue-500 bg-blue-50",
                showResult && isCorrect && "border-green-500 bg-green-50 text-green-700",
                showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 text-red-700",
                !submitted && "hover:scale-105"
              )}
              onClick={() => !submitted && setSelectedOption(option)}
              disabled={submitted}
            >
              <div className="flex items-center w-full">
                <span className="flex-1">{option}</span>
                {showResult && isCorrect && <Check className="h-4 w-4 text-green-600" />}
                {showResult && isSelected && !isCorrect && <X className="h-4 w-4 text-red-600" />}
              </div>
            </Button>
          );
        })}
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || submitted}
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {submitted ? "Checking..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

// Drag and Drop Component
export function DragDropExercise({ question, onAnswer }: {
  question: any;
  onAnswer: (correct: boolean) => void;
}) {
  const [droppedWords, setDroppedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>(question.words);
  const [submitted, setSubmitted] = useState(false);

  const handleDrop = (word: string) => {
    setDroppedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter(w => w !== word));
    soundManager.play('click');
  };

  const handleRemove = (word: string, index: number) => {
    setDroppedWords(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => [...prev, word]);
    soundManager.play('click');
  };

  const handleSubmit = () => {
    const isCorrect = JSON.stringify(droppedWords) === JSON.stringify(question.correctOrder);
    soundManager.play(isCorrect ? 'correct' : 'incorrect');
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setDroppedWords([]);
      setAvailableWords(question.words);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Arrange the words</h3>
        <p className="text-gray-600">{question.sentence}</p>
      </div>

      {/* Drop Zone */}
      <Card className="p-4 min-h-16 bg-gray-50">
        <div className="flex flex-wrap gap-2 min-h-8">
          {droppedWords.map((word, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => !submitted && handleRemove(word, index)}
            >
              {word}
              {!submitted && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
          {droppedWords.length === 0 && (
            <p className="text-gray-400 text-sm italic">Drop words here</p>
          )}
        </div>
      </Card>

      {/* Available Words */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableWords.map((word, index) => (
          <Badge
            key={index}
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => !submitted && handleDrop(word)}
          >
            {word}
          </Badge>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={droppedWords.length === 0 || submitted}
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {submitted ? "Checking..." : "Check Answer"}
        </Button>
      </div>
    </div>
  );
}

// Fill in Blanks Component
export function FillBlanksExercise({ question, onAnswer }: {
  question: any;
  onAnswer: (correct: boolean, userAnswer: string) => void;
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    soundManager.play(isCorrect ? 'correct' : 'incorrect');
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(isCorrect, userAnswer);
      setUserAnswer("");
      setSubmitted(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer.trim() && !submitted) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Fill in the blank</h3>
        <div className="text-lg mb-4">
          {question.sentence.split(question.blank).map((part: string, index: number) => (
            <span key={index}>
              {part}
              {index < question.sentence.split(question.blank).length - 1 && (
                <span className="inline-block mx-2">
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={cn(
                      "w-32 text-center inline-block",
                      submitted && userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
                        ? "border-green-500 bg-green-50"
                        : submitted && "border-red-500 bg-red-50"
                    )}
                    placeholder="Type here"
                    disabled={submitted}
                  />
                </span>
              )}
            </span>
          ))}
        </div>
        {submitted && (
          <p className={cn(
            "text-sm mt-2",
            userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
              ? "text-green-600"
              : "text-red-600"
          )}>
            {userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
              ? "Correct!"
              : `Correct answer: ${question.answer}`
            }
          </p>
        )}
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!userAnswer.trim() || submitted}
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {submitted ? "Checking..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

// Typing Exercise Component
export function TypingExercise({ question, onAnswer }: {
  question: any;
  onAnswer: (correct: boolean, userAnswer: string) => void;
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    soundManager.play(isCorrect ? 'correct' : 'incorrect');
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(isCorrect, userAnswer);
      setUserAnswer("");
      setSubmitted(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer.trim() && !submitted) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Type the translation</h3>
        <div className="text-2xl font-bold text-blue-600 mb-6">
          {question.question}
        </div>
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          className={cn(
            "text-lg text-center max-w-md mx-auto",
            submitted && userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
              ? "border-green-500 bg-green-50"
              : submitted && "border-red-500 bg-red-50"
          )}
          placeholder="Type your answer"
          disabled={submitted}
        />
        {submitted && (
          <p className={cn(
            "text-sm mt-4",
            userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
              ? "text-green-600"
              : "text-red-600"
          )}>
            {userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
              ? "Perfect!"
              : `Correct answer: ${question.answer}`
            }
          </p>
        )}
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!userAnswer.trim() || submitted}
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {submitted ? "Checking..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

// Matching Exercise Component
export function MatchingExercise({ question, onAnswer }: {
  question: any;
  onAnswer: (correct: boolean) => void;
}) {
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleLeftClick = (item: string) => {
    if (submitted) return;
    setSelectedLeft(selectedLeft === item ? null : item);
    soundManager.play('click');
  };

  const handleRightClick = (item: string) => {
    if (submitted || !selectedLeft) return;
    
    setMatches(prev => ({
      ...prev,
      [selectedLeft]: item
    }));
    setSelectedLeft(null);
    soundManager.play('click');
  };

  const handleSubmit = () => {
    const isCorrect = question.questions.every((q: any) => matches[q.left] === q.right);
    soundManager.play(isCorrect ? 'correct' : 'incorrect');
    setSubmitted(true);
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setMatches({});
      setSelectedLeft(null);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Match the pairs</h3>
      </div>

      <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Left Column */}
        <div className="space-y-3">
          {question.questions.map((q: any, index: number) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full h-12 text-left justify-start transition-all duration-200",
                selectedLeft === q.left && "border-blue-500 bg-blue-50",
                matches[q.left] && "border-green-500 bg-green-50",
                !submitted && "hover:scale-105"
              )}
              onClick={() => handleLeftClick(q.left)}
              disabled={submitted}
            >
              {q.left}
              {matches[q.left] && <ArrowRight className="h-4 w-4 ml-auto" />}
            </Button>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {question.questions.map((q: any, index: number) => {
            const isMatched = Object.values(matches).includes(q.right);
            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full h-12 text-left justify-start transition-all duration-200",
                  isMatched && "border-green-500 bg-green-50",
                  !submitted && selectedLeft && "hover:scale-105"
                )}
                onClick={() => handleRightClick(q.right)}
                disabled={submitted || !selectedLeft || isMatched}
              >
                {q.right}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(matches).length < question.questions.length || submitted}
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {submitted ? "Checking..." : "Check Matches"}
        </Button>
      </div>
    </div>
  );
}