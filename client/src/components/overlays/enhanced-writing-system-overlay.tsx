import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLanguageByCode } from "@/data/languages";

interface WritingSystemOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: string;
}

const WRITING_SYSTEMS = {
  ja: {
    name: "Japanese Writing System",
    systems: [
      {
        name: "Hiragana",
        description: "Phonetic script for native Japanese words",
        characters: [
          { char: "あ", romaji: "a" }, { char: "か", romaji: "ka" }, { char: "さ", romaji: "sa" },
          { char: "た", romaji: "ta" }, { char: "な", romaji: "na" }, { char: "は", romaji: "ha" },
          { char: "ま", romaji: "ma" }, { char: "や", romaji: "ya" }, { char: "ら", romaji: "ra" },
          { char: "わ", romaji: "wa" }, { char: "ん", romaji: "n" }
        ]
      },
      {
        name: "Katakana", 
        description: "Phonetic script for foreign words",
        characters: [
          { char: "ア", romaji: "a" }, { char: "カ", romaji: "ka" }, { char: "サ", romaji: "sa" },
          { char: "タ", romaji: "ta" }, { char: "ナ", romaji: "na" }, { char: "ハ", romaji: "ha" },
          { char: "マ", romaji: "ma" }, { char: "ヤ", romaji: "ya" }, { char: "ラ", romaji: "ra" },
          { char: "ワ", romaji: "wa" }, { char: "ン", romaji: "n" }
        ]
      },
      {
        name: "Kanji",
        description: "Chinese characters for meaning",
        characters: [
          { char: "日", romaji: "hi/nichi", meaning: "sun, day" },
          { char: "本", romaji: "hon/moto", meaning: "book, origin" },
          { char: "人", romaji: "hito/jin", meaning: "person" },
          { char: "大", romaji: "oo/dai", meaning: "big" },
          { char: "小", romaji: "ko/sho", meaning: "small" }
        ]
      }
    ]
  },
  zh: {
    name: "Chinese Writing System",
    systems: [
      {
        name: "Simplified Characters",
        description: "Simplified Chinese characters used in mainland China",
        characters: [
          { char: "中", pinyin: "zhōng", meaning: "middle, China" },
          { char: "国", pinyin: "guó", meaning: "country" },
          { char: "人", pinyin: "rén", meaning: "person" },
          { char: "大", pinyin: "dà", meaning: "big" },
          { char: "小", pinyin: "xiǎo", meaning: "small" },
          { char: "好", pinyin: "hǎo", meaning: "good" },
          { char: "水", pinyin: "shuǐ", meaning: "water" },
          { char: "火", pinyin: "huǒ", meaning: "fire" }
        ]
      }
    ]
  },
  hr: {
    name: "Serbo-Croatian Writing System", 
    systems: [
      {
        name: "Cyrillic Script",
        description: "Traditional Cyrillic alphabet used in Serbian",
        characters: [
          { char: "А", latin: "A", sound: "a" },
          { char: "Б", latin: "B", sound: "b" },
          { char: "В", latin: "V", sound: "v" },
          { char: "Г", latin: "G", sound: "g" },
          { char: "Д", latin: "D", sound: "d" },
          { char: "Ђ", latin: "Đ", sound: "đ" },
          { char: "Е", latin: "E", sound: "e" },
          { char: "Ж", latin: "Ž", sound: "ž" },
          { char: "З", latin: "Z", sound: "z" },
          { char: "И", latin: "I", sound: "i" }
        ]
      }
    ]
  },
  ko: {
    name: "Korean Writing System",
    systems: [
      {
        name: "Hangul",
        description: "Korean phonetic alphabet",
        characters: [
          { char: "ㄱ", romaja: "g/k", type: "consonant" },
          { char: "ㄴ", romaja: "n", type: "consonant" },
          { char: "ㄷ", romaja: "d/t", type: "consonant" },
          { char: "ㄹ", romaja: "r/l", type: "consonant" },
          { char: "ㅏ", romaja: "a", type: "vowel" },
          { char: "ㅓ", romaja: "eo", type: "vowel" },
          { char: "ㅗ", romaja: "o", type: "vowel" },
          { char: "ㅜ", romaja: "u", type: "vowel" }
        ]
      }
    ]
  },
  ru: {
    name: "Russian Writing System",
    systems: [
      {
        name: "Cyrillic Alphabet",
        description: "Russian Cyrillic script",
        characters: [
          { char: "А", latin: "A", sound: "a" },
          { char: "Б", latin: "B", sound: "b" },
          { char: "В", latin: "V", sound: "v" },
          { char: "Г", latin: "G", sound: "g" },
          { char: "Д", latin: "D", sound: "d" },
          { char: "Е", latin: "E", sound: "ye" },
          { char: "Ж", latin: "Zh", sound: "zh" },
          { char: "З", latin: "Z", sound: "z" },
          { char: "И", latin: "I", sound: "i" },
          { char: "Й", latin: "Y", sound: "y" }
        ]
      }
    ]
  }
};

export function EnhancedWritingSystemOverlay({ isOpen, onClose, languageCode }: WritingSystemOverlayProps) {
  const language = getLanguageByCode(languageCode);
  const writingSystem = WRITING_SYSTEMS[languageCode as keyof typeof WRITING_SYSTEMS];

  if (!writingSystem) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {writingSystem.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {writingSystem.systems.map((system, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {system.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {writingSystem.systems.map((system, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{system.name}</h3>
                    <p className="text-muted-foreground mb-4">{system.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {system.characters.map((char, charIndex) => (
                      <Card key={charIndex} className="p-3 hover:bg-accent/50 transition-colors">
                        <CardContent className="p-0 text-center">
                          <div className="text-2xl font-bold mb-2">{char.char}</div>
                          <div className="text-sm space-y-1">
                            {(char as any).romaji && (
                              <div className="text-muted-foreground">{(char as any).romaji}</div>
                            )}
                            {(char as any).pinyin && (
                              <div className="text-muted-foreground">{(char as any).pinyin}</div>
                            )}
                            {(char as any).latin && (
                              <div className="text-muted-foreground">{(char as any).latin}</div>
                            )}
                            {(char as any).romaja && (
                              <div className="text-muted-foreground">{(char as any).romaja}</div>
                            )}
                            {(char as any).meaning && (
                              <div className="text-xs text-muted-foreground">{(char as any).meaning}</div>
                            )}
                            {(char as any).sound && (
                              <div className="text-xs text-muted-foreground">/{(char as any).sound}/</div>
                            )}
                            {(char as any).type && (
                              <div className="text-xs text-primary capitalize">{(char as any).type}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}