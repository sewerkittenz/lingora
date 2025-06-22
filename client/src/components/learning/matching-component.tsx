import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface MatchingPair {
  id: string;
  english: string;
  foreign: string;
  matched: boolean;
}

interface MatchingComponentProps {
  items: MatchingPair[];
  onComplete: (score: number) => void;
  showRomaji?: boolean;
  pronunciation?: { [key: string]: string };
}

export function MatchingComponent({ 
  items, 
  onComplete, 
  showRomaji = true,
  pronunciation = {}
}: MatchingComponentProps) {
  const [matchingItems, setMatchingItems] = useState<MatchingPair[]>(items);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedForeign, setSelectedForeign] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleEnglishClick = (english: string) => {
    setSelectedEnglish(selectedEnglish === english ? null : english);
    setFeedback({ type: null, message: '' });
  };

  const handleForeignClick = (foreign: string) => {
    setSelectedForeign(selectedForeign === foreign ? null : foreign);
    
    // Check for match when both are selected
    if (selectedEnglish && foreign) {
      const englishItem = matchingItems.find(item => item.english === selectedEnglish);
      const foreignItem = matchingItems.find(item => item.foreign === foreign);
      
      setAttempts(prev => prev + 1);
      
      if (englishItem && foreignItem && englishItem.id === foreignItem.id) {
        // Correct match
        setMatchingItems(prev => prev.map(item => 
          item.id === englishItem.id ? { ...item, matched: true } : item
        ));
        setScore(prev => prev + 10);
        setFeedback({ 
          type: 'correct', 
          message: `Correct! "${selectedEnglish}" matches "${foreign}"` 
        });
        
        // Check if all items are matched
        const updatedItems = matchingItems.map(item => 
          item.id === englishItem.id ? { ...item, matched: true } : item
        );
        
        if (updatedItems.every(item => item.matched)) {
          setTimeout(() => {
            onComplete(score + 10);
          }, 1500);
        }
      } else {
        // Incorrect match
        setFeedback({ 
          type: 'incorrect', 
          message: `Incorrect. "${selectedEnglish}" doesn't match "${foreign}"` 
        });
      }
      
      // Clear selections after a delay
      setTimeout(() => {
        setSelectedEnglish(null);
        setSelectedForeign(null);
        setFeedback({ type: null, message: '' });
      }, 1500);
    } else {
      setSelectedForeign(foreign);
    }
  };

  const resetExercise = () => {
    setMatchingItems(items.map(item => ({ ...item, matched: false })));
    setSelectedEnglish(null);
    setSelectedForeign(null);
    setScore(0);
    setAttempts(0);
    setFeedback({ type: null, message: '' });
  };

  const shuffledForeignItems = shuffleArray(matchingItems);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Match the Words</h3>
        <p className="text-muted-foreground mb-4">
          Click an English word, then click its matching foreign language word
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <span>Score: {score}</span>
          <span>Attempts: {attempts}</span>
          <span>Remaining: {matchingItems.filter(item => !item.matched).length}</span>
        </div>
      </div>

      {/* Feedback */}
      {feedback.type && (
        <Card className={`border-2 ${feedback.type === 'correct' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              {feedback.type === 'correct' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${feedback.type === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                {feedback.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* English Section */}
        <div className="space-y-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <h4 className="font-semibold text-blue-800">English</h4>
            </CardContent>
          </Card>
          
          {matchingItems.map((item) => (
            <Button
              key={`english-${item.id}`}
              variant={
                item.matched ? "secondary" :
                selectedEnglish === item.english ? "default" : "outline"
              }
              className={`w-full h-auto p-4 text-left ${
                item.matched ? "opacity-60 cursor-not-allowed" :
                selectedEnglish === item.english ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => !item.matched && handleEnglishClick(item.english)}
              disabled={item.matched}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{item.english}</span>
                {item.matched && <Check className="w-5 h-5 text-green-600" />}
              </div>
            </Button>
          ))}
        </div>
        
        {/* Foreign Language Section */}
        <div className="space-y-3">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <h4 className="font-semibold text-green-800">Foreign Language</h4>
            </CardContent>
          </Card>
          
          {shuffledForeignItems.map((item) => (
            <Button
              key={`foreign-${item.id}`}
              variant={
                item.matched ? "secondary" :
                selectedForeign === item.foreign ? "default" : "outline"
              }
              className={`w-full h-auto p-4 text-left ${
                item.matched ? "opacity-60 cursor-not-allowed" :
                selectedForeign === item.foreign ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => !item.matched && handleForeignClick(item.foreign)}
              disabled={item.matched}
            >
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{item.foreign}</span>
                  {item.matched && <Check className="w-5 h-5 text-green-600" />}
                </div>
                {showRomaji && pronunciation[item.foreign] && (
                  <span className="text-sm text-muted-foreground block">
                    {pronunciation[item.foreign]}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={resetExercise}
          disabled={matchingItems.every(item => item.matched)}
        >
          Reset Exercise
        </Button>
      </div>
    </div>
  );
}