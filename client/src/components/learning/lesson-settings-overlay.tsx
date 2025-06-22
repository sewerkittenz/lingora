import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Settings, Zap, Target, Edit, MousePointer } from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface LessonSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLesson: (settings: LessonSettings) => void;
}

export interface LessonSettings {
  exerciseTypes: {
    flashcards: boolean;
    multipleChoice: boolean;
    dragAndDrop: boolean;
    fillInBlanks: boolean;
    typing: boolean;
    matching: boolean;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
}

const EXERCISE_TYPES = [
  {
    key: 'flashcards',
    name: 'Flashcards',
    description: 'Spaced repetition with bad, ok, good ratings',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-blue-500'
  },
  {
    key: 'multipleChoice',
    name: 'Multiple Choice',
    description: 'Choose the correct answer from options',
    icon: <Target className="h-4 w-4" />,
    color: 'bg-green-500'
  },
  {
    key: 'dragAndDrop',
    name: 'Drag & Drop',
    description: 'Drag words to complete sentences',
    icon: <MousePointer className="h-4 w-4" />,
    color: 'bg-purple-500'
  },
  {
    key: 'fillInBlanks',
    name: 'Fill in Blanks',
    description: 'Type missing words or grammar',
    icon: <Edit className="h-4 w-4" />,
    color: 'bg-orange-500'
  },
  {
    key: 'typing',
    name: 'Type Answer',
    description: 'Write the meaning/translation',
    icon: <Edit className="h-4 w-4" />,
    color: 'bg-red-500'
  },
  {
    key: 'matching',
    name: 'Match Pairs',
    description: 'Connect words with their meanings',
    icon: <Target className="h-4 w-4" />,
    color: 'bg-teal-500'
  }
];

export function LessonSettingsOverlay({ isOpen, onClose, onStartLesson }: LessonSettingsOverlayProps) {
  const [settings, setSettings] = useState<LessonSettings>({
    exerciseTypes: {
      flashcards: true,
      multipleChoice: true,
      dragAndDrop: true,
      fillInBlanks: true,
      typing: false,
      matching: true,
    },
    difficulty: 'medium',
    soundEnabled: soundManager.isEnabled()
  });

  const handleExerciseTypeChange = (type: keyof LessonSettings['exerciseTypes'], enabled: boolean) => {
    const newTypes = { ...settings.exerciseTypes, [type]: enabled };
    const enabledCount = Object.values(newTypes).filter(Boolean).length;
    
    // Ensure at least one exercise type is enabled
    if (enabledCount === 0) {
      soundManager.play('incorrect');
      return;
    }
    
    soundManager.play('click');
    setSettings(prev => ({
      ...prev,
      exerciseTypes: newTypes
    }));
  };

  const handleSoundToggle = (enabled: boolean) => {
    soundManager.setEnabled(enabled);
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
    if (enabled) {
      soundManager.play('click');
    }
  };

  const handleStartLesson = () => {
    soundManager.play('click');
    onStartLesson(settings);
    onClose();
  };

  const enabledExerciseCount = Object.values(settings.exerciseTypes).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl font-bold">
                Lesson Settings
              </DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Exercise Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Exercise Types
                <Badge variant="secondary" className="ml-auto">
                  {enabledExerciseCount} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXERCISE_TYPES.map((exercise) => (
                  <div
                    key={exercise.key}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                      settings.exerciseTypes[exercise.key as keyof LessonSettings['exerciseTypes']]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleExerciseTypeChange(
                      exercise.key as keyof LessonSettings['exerciseTypes'],
                      !settings.exerciseTypes[exercise.key as keyof LessonSettings['exerciseTypes']]
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg text-white ${exercise.color}`}>
                        {exercise.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{exercise.name}</h3>
                          <Switch
                            checked={settings.exerciseTypes[exercise.key as keyof LessonSettings['exerciseTypes']]}
                            onCheckedChange={(checked) => handleExerciseTypeChange(
                              exercise.key as keyof LessonSettings['exerciseTypes'],
                              checked
                            )}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <p className="text-xs text-gray-600">{exercise.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {enabledExerciseCount === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Please select at least one exercise type to continue.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Difficulty Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Difficulty Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'easy', name: 'Easy', description: 'More hints, slower pace', color: 'bg-green-500' },
                  { key: 'medium', name: 'Medium', description: 'Balanced challenge', color: 'bg-yellow-500' },
                  { key: 'hard', name: 'Hard', description: 'Minimal hints, faster pace', color: 'bg-red-500' }
                ].map((level) => (
                  <div
                    key={level.key}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      settings.difficulty === level.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      soundManager.play('click');
                      setSettings(prev => ({ ...prev, difficulty: level.key as 'easy' | 'medium' | 'hard' }));
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full ${level.color} mb-2 mx-auto`}></div>
                    <h3 className="font-semibold text-sm text-center mb-1">{level.name}</h3>
                    <p className="text-xs text-gray-600 text-center">{level.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audio Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound-enabled" className="text-sm font-medium">
                    Sound Effects
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Play sounds for correct, incorrect, and button clicks
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Lesson Summary</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• {enabledExerciseCount} exercise types enabled</p>
                <p>• Difficulty: <span className="font-medium capitalize">{settings.difficulty}</span></p>
                <p>• Sound effects: <span className="font-medium">{settings.soundEnabled ? 'On' : 'Off'}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleStartLesson}
            disabled={enabledExerciseCount === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Lesson
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}