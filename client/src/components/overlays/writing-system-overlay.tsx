import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Volume2 } from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface WritingSystemOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: string;
  languageName: string;
}

const WRITING_SYSTEMS = {
  ja: {
    name: "Japanese Writing Systems",
    systems: [
      {
        name: "Hiragana",
        description: "Phonetic script for native Japanese words",
        characters: [
          { char: "あ", romaji: "a", sound: "ah" },
          { char: "か", romaji: "ka", sound: "kah" },
          { char: "さ", romaji: "sa", sound: "sah" },
          { char: "た", romaji: "ta", sound: "tah" },
          { char: "な", romaji: "na", sound: "nah" },
          { char: "は", romaji: "ha", sound: "hah" },
          { char: "ま", romaji: "ma", sound: "mah" },
          { char: "や", romaji: "ya", sound: "yah" },
          { char: "ら", romaji: "ra", sound: "rah" },
          { char: "わ", romaji: "wa", sound: "wah" }
        ]
      },
      {
        name: "Katakana",
        description: "Phonetic script for foreign words",
        characters: [
          { char: "ア", romaji: "a", sound: "ah" },
          { char: "カ", romaji: "ka", sound: "kah" },
          { char: "サ", romaji: "sa", sound: "sah" },
          { char: "タ", romaji: "ta", sound: "tah" },
          { char: "ナ", romaji: "na", sound: "nah" },
          { char: "ハ", romaji: "ha", sound: "hah" },
          { char: "マ", romaji: "ma", sound: "mah" },
          { char: "ヤ", romaji: "ya", sound: "yah" },
          { char: "ラ", romaji: "ra", sound: "rah" },
          { char: "ワ", romaji: "wa", sound: "wah" }
        ]
      },
      {
        name: "Kanji",
        description: "Chinese characters with meaning and pronunciation",
        characters: [
          { char: "人", romaji: "jin/hito", sound: "person" },
          { char: "水", romaji: "sui/mizu", sound: "water" },
          { char: "火", romaji: "ka/hi", sound: "fire" },
          { char: "木", romaji: "boku/ki", sound: "tree" },
          { char: "金", romaji: "kin/kane", sound: "metal/money" },
          { char: "土", romaji: "do/tsuchi", sound: "earth" },
          { char: "日", romaji: "nichi/hi", sound: "sun/day" },
          { char: "月", romaji: "getsu/tsuki", sound: "moon/month" },
          { char: "年", romaji: "nen/toshi", sound: "year" },
          { char: "時", romaji: "ji/toki", sound: "time" }
        ]
      }
    ]
  },
  zh: {
    name: "Chinese Writing System",
    systems: [
      {
        name: "Simplified Characters",
        description: "Modern simplified Chinese characters",
        characters: [
          { char: "人", romaji: "rén", sound: "person" },
          { char: "水", romaji: "shuǐ", sound: "water" },
          { char: "火", romaji: "huǒ", sound: "fire" },
          { char: "木", romaji: "mù", sound: "tree" },
          { char: "金", romaji: "jīn", sound: "metal/gold" },
          { char: "土", romaji: "tǔ", sound: "earth" },
          { char: "日", romaji: "rì", sound: "sun/day" },
          { char: "月", romaji: "yuè", sound: "moon/month" },
          { char: "年", romaji: "nián", sound: "year" },
          { char: "时", romaji: "shí", sound: "time" }
        ]
      },
      {
        name: "Radicals",
        description: "Building blocks of Chinese characters",
        characters: [
          { char: "氵", romaji: "shuǐ", sound: "water radical" },
          { char: "亻", romaji: "rén", sound: "person radical" },
          { char: "艹", romaji: "cǎo", sound: "grass radical" },
          { char: "扌", romaji: "shǒu", sound: "hand radical" },
          { char: "口", romaji: "kǒu", sound: "mouth radical" },
          { char: "心", romaji: "xīn", sound: "heart radical" },
          { char: "木", romaji: "mù", sound: "tree radical" },
          { char: "言", romaji: "yán", sound: "speech radical" },
          { char: "金", romaji: "jīn", sound: "metal radical" },
          { char: "食", romaji: "shí", sound: "food radical" }
        ]
      }
    ]
  },
  ko: {
    name: "Korean Writing System",
    systems: [
      {
        name: "Hangul Consonants",
        description: "Korean consonant letters",
        characters: [
          { char: "ㄱ", romaji: "g/k", sound: "giyeok" },
          { char: "ㄴ", romaji: "n", sound: "nieun" },
          { char: "ㄷ", romaji: "d/t", sound: "digeut" },
          { char: "ㄹ", romaji: "r/l", sound: "rieul" },
          { char: "ㅁ", romaji: "m", sound: "mieum" },
          { char: "ㅂ", romaji: "b/p", sound: "bieup" },
          { char: "ㅅ", romaji: "s", sound: "siot" },
          { char: "ㅇ", romaji: "ng", sound: "ieung" },
          { char: "ㅈ", romaji: "j", sound: "jieut" },
          { char: "ㅎ", romaji: "h", sound: "hieut" }
        ]
      },
      {
        name: "Hangul Vowels",
        description: "Korean vowel letters",
        characters: [
          { char: "ㅏ", romaji: "a", sound: "a" },
          { char: "ㅓ", romaji: "eo", sound: "eo" },
          { char: "ㅗ", romaji: "o", sound: "o" },
          { char: "ㅜ", romaji: "u", sound: "u" },
          { char: "ㅡ", romaji: "eu", sound: "eu" },
          { char: "ㅣ", romaji: "i", sound: "i" },
          { char: "ㅑ", romaji: "ya", sound: "ya" },
          { char: "ㅕ", romaji: "yeo", sound: "yeo" },
          { char: "ㅛ", romaji: "yo", sound: "yo" },
          { char: "ㅠ", romaji: "yu", sound: "yu" }
        ]
      }
    ]
  },
  ru: {
    name: "Russian Writing System",
    systems: [
      {
        name: "Cyrillic Alphabet",
        description: "Russian Cyrillic letters",
        characters: [
          { char: "А", romaji: "A", sound: "ah" },
          { char: "Б", romaji: "B", sound: "beh" },
          { char: "В", romaji: "V", sound: "veh" },
          { char: "Г", romaji: "G", sound: "geh" },
          { char: "Д", romaji: "D", sound: "deh" },
          { char: "Е", romaji: "E", sound: "yeh" },
          { char: "Ж", romaji: "Zh", sound: "zheh" },
          { char: "З", romaji: "Z", sound: "zeh" },
          { char: "И", romaji: "I", sound: "ee" },
          { char: "Й", romaji: "Y", sound: "y" }
        ]
      }
    ]
  },
  hr: {
    name: "Serbian/Croatian Writing Systems",
    systems: [
      {
        name: "Cyrillic Script",
        description: "Serbian Cyrillic alphabet",
        characters: [
          { char: "А", romaji: "A", sound: "ah" },
          { char: "Б", romaji: "B", sound: "beh" },
          { char: "В", romaji: "V", sound: "veh" },
          { char: "Г", romaji: "G", sound: "geh" },
          { char: "Д", romaji: "D", sound: "deh" },
          { char: "Ђ", romaji: "Đ", sound: "djeh" },
          { char: "Е", romaji: "E", sound: "eh" },
          { char: "Ж", romaji: "Ž", sound: "zheh" },
          { char: "З", romaji: "Z", sound: "zeh" },
          { char: "И", romaji: "I", sound: "ee" }
        ]
      },
      {
        name: "Latin Script",
        description: "Croatian Latin alphabet",
        characters: [
          { char: "A", romaji: "A", sound: "ah" },
          { char: "B", romaji: "B", sound: "beh" },
          { char: "C", romaji: "C", sound: "tseh" },
          { char: "Č", romaji: "Č", sound: "cheh" },
          { char: "Ć", romaji: "Ć", sound: "tyeh" },
          { char: "D", romaji: "D", sound: "deh" },
          { char: "Dž", romaji: "Dž", sound: "djeh" },
          { char: "Đ", romaji: "Đ", sound: "djeh" },
          { char: "E", romaji: "E", sound: "eh" },
          { char: "F", romaji: "F", sound: "ef" }
        ]
      }
    ]
  }
};

export function WritingSystemOverlay({ isOpen, onClose, languageCode, languageName }: WritingSystemOverlayProps) {
  const [activeTab, setActiveTab] = useState(0);
  const writingData = WRITING_SYSTEMS[languageCode as keyof typeof WRITING_SYSTEMS];

  if (!writingData) {
    return null;
  }

  const playSound = (sound: string) => {
    soundManager.play('click');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {writingData.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 gap-2">
              {writingData.systems.map((system, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  {system.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {writingData.systems.map((system, systemIndex) => (
              <TabsContent key={systemIndex} value={systemIndex.toString()} className="mt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">{system.name}</h3>
                    <p className="text-gray-600 mb-4">{system.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {system.characters.map((char, charIndex) => (
                      <Card
                        key={charIndex}
                        className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
                        onClick={() => playSound(char.sound)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl font-bold mb-2 text-blue-600 group-hover:text-purple-600 transition-colors">
                            {char.char}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {char.romaji}
                          </div>
                          <div className="text-xs text-gray-500">
                            {char.sound}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSound(char.sound);
                            }}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-800">Learning Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {languageCode === 'ja' && (
              <>
                <li>• Start with Hiragana, then Katakana, then basic Kanji</li>
                <li>• Practice stroke order for proper character formation</li>
                <li>• Learn common Kanji radicals to understand character meanings</li>
              </>
            )}
            {languageCode === 'zh' && (
              <>
                <li>• Learn basic radicals first - they're building blocks of characters</li>
                <li>• Practice tones along with character recognition</li>
                <li>• Focus on stroke order for better memorization</li>
              </>
            )}
            {languageCode === 'ko' && (
              <>
                <li>• Learn consonants and vowels separately first</li>
                <li>• Practice combining letters into syllable blocks</li>
                <li>• Remember that Korean reads left-to-right, top-to-bottom</li>
              </>
            )}
            {(languageCode === 'ru' || languageCode === 'hr') && (
              <>
                <li>• Focus on letters that look similar to Latin but sound different</li>
                <li>• Practice handwriting to improve recognition</li>
                <li>• Learn common letter combinations and sounds</li>
              </>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}