// Direct lesson structure for immediate loading without API calls
export interface DirectLesson {
  id: number;
  title: string;
  level: string;
  type: string;
  difficulty: number;
  isUnlocked: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  xpReward: number;
}

export const generateDirectLessons = (languageCode: string): DirectLesson[] => {
  const lessons: DirectLesson[] = [];
  
  // Define level structures based on language
  const levelStructures = {
    ja: [
      { level: 'kana', count: 10, types: ['hiragana', 'katakana'] },
      { level: 'jlpt-n5', count: 12, types: ['vocab', 'grammar', 'kanji'] },
      { level: 'jlpt-n4', count: 15, types: ['vocab', 'grammar', 'kanji', 'reading'] },
      { level: 'jlpt-n3', count: 18, types: ['vocab', 'grammar', 'kanji', 'reading', 'listening'] },
      { level: 'jlpt-n2', count: 20, types: ['vocab', 'grammar', 'kanji', 'reading', 'listening'] },
      { level: 'jlpt-n1', count: 25, types: ['vocab', 'grammar', 'kanji', 'reading', 'listening', 'advanced'] }
    ],
    zh: [
      { level: 'beginner', count: 15, types: ['pinyin', 'characters', 'vocab', 'tones'] },
      { level: 'intermediate', count: 20, types: ['grammar', 'vocab', 'characters', 'reading'] },
      { level: 'advanced', count: 25, types: ['grammar', 'vocab', 'writing', 'literature'] },
      { level: 'expert', count: 40, types: ['advanced-grammar', 'literature', 'writing', 'culture'] }
    ],
    ko: [
      { level: 'beginner', count: 12, types: ['hangul', 'vocab', 'basic-grammar'] },
      { level: 'intermediate', count: 18, types: ['grammar', 'vocab', 'honorifics', 'writing'] },
      { level: 'advanced', count: 25, types: ['advanced-grammar', 'culture', 'writing', 'literature'] },
      { level: 'expert', count: 45, types: ['expert-grammar', 'culture', 'literature', 'business'] }
    ],
    ru: [
      { level: 'beginner', count: 14, types: ['alphabet', 'vocab', 'cases', 'basic-grammar'] },
      { level: 'intermediate', count: 22, types: ['grammar', 'vocab', 'verbs', 'writing'] },
      { level: 'advanced', count: 28, types: ['advanced-grammar', 'literature', 'writing', 'culture'] },
      { level: 'expert', count: 36, types: ['expert-grammar', 'literature', 'culture', 'business'] }
    ],
    de: [
      { level: 'beginner', count: 16, types: ['alphabet', 'vocab', 'articles', 'basic-grammar'] },
      { level: 'intermediate', count: 24, types: ['grammar', 'vocab', 'compounds', 'writing'] },
      { level: 'advanced', count: 30, types: ['advanced-grammar', 'literature', 'philosophy', 'culture'] },
      { level: 'expert', count: 30, types: ['expert-grammar', 'philosophy', 'literature', 'business'] }
    ],
    es: [
      { level: 'beginner', count: 18, types: ['alphabet', 'vocab', 'conjugation', 'basic-grammar'] },
      { level: 'intermediate', count: 26, types: ['grammar', 'vocab', 'conversation', 'writing'] },
      { level: 'advanced', count: 32, types: ['advanced-grammar', 'literature', 'culture', 'conversation'] },
      { level: 'expert', count: 24, types: ['expert-grammar', 'literature', 'culture', 'business'] }
    ],
    hr: [
      { level: 'beginner', count: 14, types: ['alphabet', 'vocab', 'cases', 'basic-grammar'] },
      { level: 'intermediate', count: 20, types: ['grammar', 'vocab', 'writing', 'culture'] },
      { level: 'advanced', count: 26, types: ['advanced-grammar', 'literature', 'culture', 'writing'] },
      { level: 'expert', count: 40, types: ['expert-grammar', 'literature', 'culture', 'regional'] }
    ]
  };

  const structure = levelStructures[languageCode as keyof typeof levelStructures] || levelStructures.es;
  let lessonId = 1;

  structure.forEach(levelInfo => {
    for (let i = 0; i < levelInfo.count; i++) {
      const typeIndex = i % levelInfo.types.length;
      const type = levelInfo.types[typeIndex];
      
      lessons.push({
        id: lessonId,
        title: `${levelInfo.level.replace('-', ' ')} ${type.replace('-', ' ')} ${Math.floor(i / levelInfo.types.length) + 1}`,
        level: levelInfo.level,
        type: type,
        difficulty: lessonId,
        isUnlocked: lessonId <= 3, // First 3 lessons unlocked by default
        isLocked: lessonId > 3, // Lock lessons beyond first 3
        isCompleted: false,
        xpReward: 50 + (lessonId * 2)
      });
      lessonId++;
    }
  });

  return lessons;
};

export const getLessonsByLevel = (lessons: DirectLesson[], level: string): DirectLesson[] => {
  return lessons.filter(lesson => lesson.level === level);
};

export const getLevelsForLanguage = (languageCode: string): string[] => {
  const levelMaps = {
    ja: ['kana', 'jlpt-n5', 'jlpt-n4', 'jlpt-n3', 'jlpt-n2', 'jlpt-n1'],
    zh: ['beginner', 'intermediate', 'advanced', 'expert'],
    ko: ['beginner', 'intermediate', 'advanced', 'expert'],
    ru: ['beginner', 'intermediate', 'advanced', 'expert'],
    de: ['beginner', 'intermediate', 'advanced', 'expert'],
    es: ['beginner', 'intermediate', 'advanced', 'expert'],
    hr: ['beginner', 'intermediate', 'advanced', 'expert']
  };
  
  return levelMaps[languageCode as keyof typeof levelMaps] || levelMaps.es;
};