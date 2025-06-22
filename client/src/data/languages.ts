export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  gradient: string;
  levels: string[];
  writingSystem?: string;
  description: string;
}

export const LANGUAGES: LanguageInfo[] = [
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    gradient: 'from-red-500 to-pink-500',
    levels: ['kana', 'jlpt-n5', 'jlpt-n4', 'jlpt-n3', 'jlpt-n2', 'jlpt-n1'],
    writingSystem: 'Hiragana, Katakana, Kanji',
    description: 'Master the beautiful Japanese writing systems and language'
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    gradient: 'from-red-600 to-yellow-500',
    levels: ['beginner', 'intermediate', 'advanced', 'expert'],
    writingSystem: 'Simplified Chinese Characters',
    description: 'Learn Mandarin Chinese and traditional characters'
  },
  {
    code: 'hr',
    name: 'Serbo-Croatian',
    nativeName: 'Српскохрватски',
    flag: '🇭🇷',
    gradient: 'from-blue-600 to-red-600',
    levels: ['beginner', 'intermediate', 'advanced', 'expert'],
    writingSystem: 'Cyrillic',
    description: 'Learn the South Slavic languages'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    gradient: 'from-yellow-500 to-red-500',
    levels: ['beginner', 'intermediate', 'advanced', 'expert'],
    description: 'Speak Spanish with confidence across the globe'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    gradient: 'from-blue-600 to-red-500',
    levels: ['beginner', 'intermediate', 'advanced', 'expert'],
    writingSystem: 'Hangul',
    description: 'Discover Korean culture through language'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    gradient: 'from-blue-600 to-white',
    levels: ['beginner', 'intermediate', 'advanced', 'expert'],
    writingSystem: 'Cyrillic',
    description: 'Master the Cyrillic script and Russian grammar'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    gradient: 'from-black to-red-600',
    levels: ['beginner', 'intermediate', 'advanced', 'expert'],
    description: 'Learn precise German grammar and vocabulary'
  }
];

export function getLanguageByCode(code: string): LanguageInfo | undefined {
  return LANGUAGES.find(lang => lang.code === code);
}
