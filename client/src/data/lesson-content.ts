// Real lesson content mapping for each language and lesson
import { DirectLesson } from "./lesson-structure";

interface LessonContent {
  id: string;
  items: QuizItem[];
}

interface QuizItem {
  id: string;
  type: 'vocab' | 'grammar' | 'writing' | 'kanji' | 'pronunciation';
  question: string;
  answer: string;
  options?: string[];
  translation?: string;
  pronunciation?: string;
  example?: string;
  difficulty?: number;
}

// Load lesson content from JSON files
export const loadLessonContent = async (languageCode: string, lessonId: number): Promise<QuizItem[]> => {
  try {
    // Map language codes to folder names
    const folderMap: { [key: string]: string } = {
      'ja': 'japanese',
      'zh': 'chinese', 
      'ko': 'korean',
      'ru': 'russian',
      'de': 'german',
      'es': 'spanish',
      'hr': 'serbo-croatian'
    };

    const folderName = folderMap[languageCode] || languageCode;
    
    // Import lesson data dynamically
    const lessonData = await import(`./lessons/${folderName}/lesson-${lessonId}.json`);
    
    // Convert lesson data to quiz items
    const items: QuizItem[] = [];
    
    if (lessonData.items) {
      lessonData.items.forEach((item: any, index: number) => {
        // Vocabulary items
        if (item.word && item.translation) {
          items.push({
            id: `${lessonId}-vocab-${index}`,
            type: 'vocab',
            question: `What does "${item.word}" mean?`,
            answer: item.translation,
            options: generateMultipleChoiceOptions(item.translation, 'vocab', languageCode),
            translation: item.translation,
            pronunciation: item.pronunciation || item.reading,
            example: item.example,
            difficulty: item.difficulty || 1
          });

          // Reverse translation
          items.push({
            id: `${lessonId}-vocab-reverse-${index}`,
            type: 'vocab',
            question: `How do you say "${item.translation}" in ${getLanguageName(languageCode)}?`,
            answer: item.word,
            options: generateMultipleChoiceOptions(item.word, 'word', languageCode),
            translation: item.translation,
            pronunciation: item.pronunciation || item.reading,
            example: item.example,
            difficulty: item.difficulty || 1
          });
        }

        // Grammar items
        if (item.grammar && item.pattern) {
          items.push({
            id: `${lessonId}-grammar-${index}`,
            type: 'grammar',
            question: item.question || `Complete the sentence: ${item.pattern}`,
            answer: item.answer || item.grammar,
            options: generateGrammarOptions(item.grammar, languageCode),
            translation: item.meaning,
            example: item.example,
            difficulty: item.difficulty || 2
          });
        }

        // Writing system items (for languages with unique scripts)
        if (item.character && ['ja', 'zh', 'ko', 'ru'].includes(languageCode)) {
          items.push({
            id: `${lessonId}-writing-${index}`,
            type: 'writing',
            question: `What is the reading of "${item.character}"?`,
            answer: item.reading || item.pronunciation,
            options: generateReadingOptions(item.reading || item.pronunciation, languageCode),
            translation: item.meaning,
            difficulty: item.difficulty || 2
          });
        }
      });
    }

    // Ensure minimum 25 items per lesson
    while (items.length < 25) {
      const baseIndex = items.length;
      items.push(generateFallbackItem(languageCode, lessonId, baseIndex));
    }

    // Shuffle and limit to 25 items
    return shuffleArray(items).slice(0, 25);
    
  } catch (error) {
    console.error(`Error loading lesson ${lessonId} for ${languageCode}:`, error);
    return generateFallbackLesson(languageCode, lessonId);
  }
};

const generateMultipleChoiceOptions = (correct: string, type: 'vocab' | 'word', languageCode: string): string[] => {
  const options = [correct];
  
  // Generate plausible wrong answers based on language
  const wrongAnswers = generateWrongAnswers(correct, type, languageCode);
  options.push(...wrongAnswers.slice(0, 3));
  
  return shuffleArray(options);
};

const generateGrammarOptions = (correct: string, languageCode: string): string[] => {
  const grammarOptions: { [key: string]: string[] } = {
    'ja': ['は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで'],
    'zh': ['的', '了', '在', '是', '有', '没', '很', '也'],
    'ko': ['은/는', '이/가', '을/를', '에', '에서', '와/과', '하고', '부터'],
    'ru': ['в', 'на', 'за', 'под', 'над', 'через', 'для', 'без'],
    'de': ['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine'],
    'es': ['el', 'la', 'un', 'una', 'en', 'de', 'por', 'para'],
    'hr': ['u', 'na', 'za', 'od', 'do', 'sa', 'bez', 'kroz']
  };

  const langOptions = grammarOptions[languageCode] || ['a', 'an', 'the', 'in', 'on', 'at', 'for'];
  const options = [correct];
  
  // Add 3 random grammar options that aren't the correct answer
  const filtered = langOptions.filter(opt => opt !== correct);
  options.push(...shuffleArray(filtered).slice(0, 3));
  
  return shuffleArray(options);
};

const generateReadingOptions = (correct: string, languageCode: string): string[] => {
  const readingOptions: { [key: string]: string[] } = {
    'ja': ['ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to'],
    'zh': ['ma', 'ba', 'pa', 'fa', 'da', 'ta', 'na', 'la', 'ga', 'ka', 'ha', 'zha', 'cha', 'sha'],
    'ko': ['ga', 'na', 'da', 'ra', 'ma', 'ba', 'sa', 'a', 'ja', 'cha', 'ka', 'ta', 'pa', 'ha'],
    'ru': ['a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'k', 'l', 'm', 'n', 'o', 'p']
  };

  const langOptions = readingOptions[languageCode] || ['a', 'e', 'i', 'o', 'u'];
  const options = [correct];
  
  const filtered = langOptions.filter(opt => opt !== correct);
  options.push(...shuffleArray(filtered).slice(0, 3));
  
  return shuffleArray(options);
};

const generateWrongAnswers = (correct: string, type: 'vocab' | 'word', languageCode: string): string[] => {
  // This would ideally use a dictionary of similar words/meanings
  // For now, generate plausible alternatives
  const alternatives: string[] = [];
  
  if (type === 'vocab') {
    // Generate similar meaning words
    const synonyms = [
      'study', 'learn', 'practice', 'work', 'read', 'write', 'speak', 'listen',
      'school', 'teacher', 'student', 'book', 'pen', 'paper', 'desk', 'class'
    ];
    alternatives.push(...synonyms.filter(s => s !== correct.toLowerCase()));
  } else {
    // Generate similar sounding/looking words
    const similarWords = generateSimilarWords(correct, languageCode);
    alternatives.push(...similarWords);
  }
  
  return shuffleArray(alternatives);
};

const generateSimilarWords = (word: string, languageCode: string): string[] => {
  // Generate words that look or sound similar
  const similar: string[] = [];
  
  // Basic pattern: change one character, add/remove characters
  for (let i = 0; i < word.length; i++) {
    const chars = word.split('');
    chars[i] = getRandomCharForLanguage(languageCode);
    similar.push(chars.join(''));
  }
  
  return similar.slice(0, 5);
};

const getRandomCharForLanguage = (languageCode: string): string => {
  const chars: { [key: string]: string[] } = {
    'ja': ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
    'zh': ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
    'ko': ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ'],
    'ru': ['а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'к'],
    'de': ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
    'es': ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
    'hr': ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  };
  
  const langChars = chars[languageCode] || ['a', 'b', 'c', 'd', 'e'];
  return langChars[Math.floor(Math.random() * langChars.length)];
};

const generateFallbackItem = (languageCode: string, lessonId: number, index: number): QuizItem => {
  const patterns: { [key: string]: any } = {
    'ja': {
      question: `学習 ${index + 1}`,
      answer: `Learning ${index + 1}`,
      pronunciation: `gakushuu${index + 1}`
    },
    'zh': {
      question: `学习 ${index + 1}`,
      answer: `Learning ${index + 1}`,
      pronunciation: `xuéxí${index + 1}`
    },
    'ko': {
      question: `학습 ${index + 1}`,
      answer: `Learning ${index + 1}`,
      pronunciation: `haksseup${index + 1}`
    },
    'ru': {
      question: `изучение ${index + 1}`,
      answer: `Learning ${index + 1}`,
      pronunciation: `izucheniye${index + 1}`
    },
    'de': {
      question: `Lernen ${index + 1}`,
      answer: `Learning ${index + 1}`,
      pronunciation: `lernen${index + 1}`
    },
    'es': {
      question: `aprender ${index + 1}`,
      answer: `Learning ${index + 1}`,
      pronunciation: `aprender${index + 1}`
    },
    'hr': {
      question: `učenje ${index + 1}`,
      answer: `Learning ${index + 1}`,
      pronunciation: `ucenje${index + 1}`
    }
  };

  const pattern = patterns[languageCode] || patterns['es'];
  
  return {
    id: `${lessonId}-fallback-${index}`,
    type: 'vocab',
    question: `What does "${pattern.question}" mean?`,
    answer: pattern.answer,
    options: generateMultipleChoiceOptions(pattern.answer, 'vocab', languageCode),
    translation: pattern.answer,
    pronunciation: pattern.pronunciation,
    example: `Example sentence with ${pattern.question}.`,
    difficulty: 1
  };
};

const generateFallbackLesson = (languageCode: string, lessonId: number): QuizItem[] => {
  const items: QuizItem[] = [];
  
  for (let i = 0; i < 25; i++) {
    items.push(generateFallbackItem(languageCode, lessonId, i));
  }
  
  return items;
};

const getLanguageName = (code: string): string => {
  const names: { [key: string]: string } = {
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ko': 'Korean', 
    'ru': 'Russian',
    'de': 'German',
    'es': 'Spanish',
    'hr': 'Serbo-Croatian'
  };
  
  return names[code] || 'Unknown';
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};