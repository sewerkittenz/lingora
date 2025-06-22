import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";

export interface LessonSettings {
  flashcards: boolean;
  dragAndDrop: boolean;
  fillInBlank: boolean;
  typing: boolean;
  multipleChoice: boolean;
  matching: boolean;
  itemsBeforeBreak: number;
}

interface LessonSettingsProps {
  settings: LessonSettings;
  onSettingsChange: (settings: LessonSettings) => void;
}

export function LessonSettingsOverlay({ settings, onSettingsChange }: LessonSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setIsOpen(false);
  };

  const handleToggle = (key: keyof LessonSettings, value: boolean | number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const enabledModes = Object.entries(localSettings)
    .filter(([key, value]) => key !== 'itemsBeforeBreak' && value)
    .length;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-10 bg-white/90 backdrop-blur-sm"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lesson Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Exercise Types</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="flashcards">Flashcards</Label>
                  <Switch
                    id="flashcards"
                    checked={localSettings.flashcards}
                    onCheckedChange={(checked) => handleToggle('flashcards', checked)}
                    disabled={enabledModes === 1 && localSettings.flashcards}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dragAndDrop">Drag & Drop</Label>
                  <Switch
                    id="dragAndDrop"
                    checked={localSettings.dragAndDrop}
                    onCheckedChange={(checked) => handleToggle('dragAndDrop', checked)}
                    disabled={enabledModes === 1 && localSettings.dragAndDrop}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="fillInBlank">Fill in the Blank</Label>
                  <Switch
                    id="fillInBlank"
                    checked={localSettings.fillInBlank}
                    onCheckedChange={(checked) => handleToggle('fillInBlank', checked)}
                    disabled={enabledModes === 1 && localSettings.fillInBlank}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="typing">Typing</Label>
                  <Switch
                    id="typing"
                    checked={localSettings.typing}
                    onCheckedChange={(checked) => handleToggle('typing', checked)}
                    disabled={enabledModes === 1 && localSettings.typing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="multipleChoice">Multiple Choice</Label>
                  <Switch
                    id="multipleChoice"
                    checked={localSettings.multipleChoice}
                    onCheckedChange={(checked) => handleToggle('multipleChoice', checked)}
                    disabled={enabledModes === 1 && localSettings.multipleChoice}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="matching">Matching</Label>
                  <Switch
                    id="matching"
                    checked={localSettings.matching}
                    onCheckedChange={(checked) => handleToggle('matching', checked)}
                    disabled={enabledModes === 1 && localSettings.matching}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="itemsBeforeBreak" className="text-sm font-medium">
                Items before break: {localSettings.itemsBeforeBreak}
              </Label>
              <Slider
                id="itemsBeforeBreak"
                min={10}
                max={50}
                step={5}
                value={[localSettings.itemsBeforeBreak]}
                onValueChange={([value]) => handleToggle('itemsBeforeBreak', value)}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}