import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface DragDropComponentProps {
  question: string;
  answer: string;
  onAnswer: (answer: string) => void;
  showWritingMode?: boolean;
  showRomaji?: boolean;
  pronunciation?: string;
  languageCode?: string;
  allItems?: any[];
}

export function DragDropComponent({ 
  question, 
  answer, 
  onAnswer, 
  showWritingMode = false,
  showRomaji = true,
  pronunciation,
  languageCode = 'en',
  allItems = []
}: DragDropComponentProps) {
  const [droppedItems, setDroppedItems] = useState<string[]>([]);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [isWritingMode, setIsWritingMode] = useState(showWritingMode);

  // Create sentence construction exercise with intelligent distractors
  const createSentenceExercise = () => {
    if (!answer || typeof answer !== 'string') {
      return {
        targetSentence: 'Unknown',
        words: ['Unknown']
      };
    }

    // Get answer words
    const answerWords = answer.split(' ').filter(word => word.trim());
    
    // Create intelligent distractors from other lesson items
    let distractors: string[] = [];
    
    if (allItems && allItems.length > 0) {
      // Extract words from other answers in the lesson
      const otherAnswers = allItems
        .filter(item => item && item.answer && item.answer !== answer)
        .map(item => item.answer)
        .slice(0, 10);
      
      // Split other answers into individual words
      const otherWords = otherAnswers
        .flatMap(ans => ans.split(' '))
        .filter(word => word.trim() && !answerWords.includes(word))
        .slice(0, 6);
      
      distractors = otherWords;
    }
    
    // If not enough distractors from lesson data, add generic ones
    if (distractors.length < 4) {
      const genericDistractors = languageCode === 'ja' || languageCode === 'zh' || languageCode === 'ko'
        ? ['the', 'a', 'is', 'are', 'not', 'very']
        : ['not', 'very', 'really', 'quite', 'also', 'then'];
      
      distractors = [...distractors, ...genericDistractors].slice(0, 6);
    }
    
    // Combine correct words with distractors and shuffle
    const allWords = [...answerWords, ...distractors.slice(0, Math.max(4, answerWords.length))];
    
    return {
      targetSentence: answer,
      words: allWords.sort(() => Math.random() - 0.5)
    };
  };

  const { targetSentence, words: shuffledWords } = createSentenceExercise();

  const handleWordClick = (word: string) => {
    if (!droppedItems.includes(word)) {
      setDroppedItems(prev => [...prev, word]);
    }
  };

  const handleWordRemove = (index: number) => {
    setDroppedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const finalAnswer = isWritingMode ? writtenAnswer : droppedItems.join(' ');
    
    // Check if answer is correct and provide visual feedback
    const normalizeAnswer = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
    const userNormalized = normalizeAnswer(finalAnswer);
    const correctNormalized = normalizeAnswer(targetSentence);
    
    const isCorrect = userNormalized === correctNormalized || 
                     targetSentence.toLowerCase().includes(userNormalized) ||
                     userNormalized.includes(correctNormalized);
    
    // Show feedback before proceeding
    if (isCorrect) {
      // Visual success feedback
      const submitButton = document.querySelector('[data-drag-submit]') as HTMLElement;
      if (submitButton) {
        submitButton.style.backgroundColor = '#22c55e';
        submitButton.textContent = '✓ Correct!';
      }
    } else {
      // Visual error feedback
      const submitButton = document.querySelector('[data-drag-submit]') as HTMLElement;
      if (submitButton) {
        submitButton.style.backgroundColor = '#ef4444';
        submitButton.textContent = '✗ Try Again';
      }
    }
    
    setTimeout(() => {
      onAnswer(finalAnswer);
    }, 1000);
  };

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (!droppedItems.includes(word)) {
      setDroppedItems(prev => [...prev, word]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">{question}</h3>
        {showRomaji && pronunciation && (
          <p className="text-muted-foreground mb-4">Pronunciation: {pronunciation}</p>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={!isWritingMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsWritingMode(false)}
        >
          Drag & Drop
        </Button>
        <Button
          variant={isWritingMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsWritingMode(true)}
        >
          Writing Mode
        </Button>
      </div>

      {isWritingMode ? (
        /* Writing Mode */
        <div className="space-y-4">
          <Input
            value={writtenAnswer}
            onChange={(e) => setWrittenAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="text-center text-lg p-6"
          />
        </div>
      ) : (
        /* Drag & Drop Mode */
        <div className="space-y-6">
          {/* Drop Zone */}
          <Card className="border-2 border-dashed border-muted-foreground/30">
            <CardContent 
              className="p-6 min-h-[120px] flex flex-wrap items-center justify-center gap-2"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {droppedItems.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  Drag words here or click to build your sentence
                </p>
              ) : (
                droppedItems.map((word, index) => (
                  <Badge 
                    key={index} 
                    variant="default" 
                    className="p-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleWordRemove(index)}
                  >
                    {word}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>

          {/* Word Bank */}
          <div className="space-y-3">
            <h4 className="text-center font-medium">Available Words</h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {shuffledWords.map((word, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`cursor-move ${droppedItems.includes(word) ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, word)}
                  onClick={() => handleWordClick(word)}
                  disabled={droppedItems.includes(word)}
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center">
        <Button 
          onClick={handleSubmit}
          className="w-full max-w-md"
          disabled={isWritingMode ? !writtenAnswer.trim() : droppedItems.length === 0}
          data-drag-submit
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
}