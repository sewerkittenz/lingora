// Lesson content data for generating comprehensive lessons
export const LESSON_DATA = {
  ja: {
    name: 'Japanese',
    levels: {
      'kana': {
        name: 'Kana',
        lessons: Array.from({length: 30}, (_, i) => ({
          id: i + 1,
          title: `Hiragana & Katakana ${i + 1}`,
          type: 'writing',
          content: generateKanaLesson(i + 1)
        }))
      },
      'jlpt-n5': {
        name: 'JLPT N5',
        lessons: Array.from({length: 40}, (_, i) => ({
          id: i + 31,
          title: `N5 Vocabulary ${i + 1}`,
          type: 'vocabulary',
          content: generateJapaneseVocab('n5', i + 1)
        }))
      },
      'jlpt-n4': {
        name: 'JLPT N4', 
        lessons: Array.from({length: 35}, (_, i) => ({
          id: i + 71,
          title: `N4 Grammar ${i + 1}`,
          type: 'grammar',
          content: generateJapaneseGrammar('n4', i + 1)
        }))
      },
      'jlpt-n3': {
        name: 'JLPT N3',
        lessons: Array.from({length: 35}, (_, i) => ({
          id: i + 106,
          title: `N3 Advanced ${i + 1}`,
          type: 'mixed',
          content: generateJapaneseMixed('n3', i + 1)
        }))
      },
      'jlpt-n2': {
        name: 'JLPT N2',
        lessons: Array.from({length: 30}, (_, i) => ({
          id: i + 141,
          title: `N2 Professional ${i + 1}`,
          type: 'advanced',
          content: generateJapaneseAdvanced('n2', i + 1)
        }))
      },
      'jlpt-n1': {
        name: 'JLPT N1',
        lessons: Array.from({length: 30}, (_, i) => ({
          id: i + 171,
          title: `N1 Master ${i + 1}`,
          type: 'expert',
          content: generateJapaneseExpert('n1', i + 1)
        }))
      }
    }
  },
  
  zh: {
    name: 'Chinese',
    levels: {
      'beginner': {
        name: 'Beginner',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 1,
          title: `Chinese Basics ${i + 1}`,
          type: 'vocabulary',
          content: generateChineseVocab('beginner', i + 1)
        }))
      },
      'intermediate': {
        name: 'Intermediate',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 51,
          title: `Chinese Grammar ${i + 1}`,
          type: 'grammar',
          content: generateChineseGrammar('intermediate', i + 1)
        }))
      },
      'advanced': {
        name: 'Advanced',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 101,
          title: `Chinese Characters ${i + 1}`,
          type: 'writing',
          content: generateChineseWriting('advanced', i + 1)
        }))
      },
      'expert': {
        name: 'Expert',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 151,
          title: `Chinese Literature ${i + 1}`,
          type: 'expert',
          content: generateChineseExpert('expert', i + 1)
        }))
      }
    }
  },

  hr: {
    name: 'Serbo-Croatian',
    levels: {
      'beginner': {
        name: 'Beginner',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 1,
          title: `Croatian Basics ${i + 1}`,
          type: 'vocabulary',
          content: generateCroatianVocab('beginner', i + 1)
        }))
      },
      'intermediate': {
        name: 'Intermediate', 
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 51,
          title: `Croatian Grammar ${i + 1}`,
          type: 'grammar',
          content: generateCroatianGrammar('intermediate', i + 1)
        }))
      },
      'advanced': {
        name: 'Advanced',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 101,
          title: `Cyrillic Script ${i + 1}`,
          type: 'writing',
          content: generateCroatianWriting('advanced', i + 1)
        }))
      },
      'expert': {
        name: 'Expert',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 151,
          title: `Croatian Culture ${i + 1}`,
          type: 'expert',
          content: generateCroatianExpert('expert', i + 1)
        }))
      }
    }
  },

  es: {
    name: 'Spanish',
    levels: {
      'beginner': {
        name: 'Beginner',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 1,
          title: `Spanish Basics ${i + 1}`,
          type: 'vocabulary',
          content: generateSpanishVocab('beginner', i + 1)
        }))
      },
      'intermediate': {
        name: 'Intermediate',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 51,
          title: `Spanish Grammar ${i + 1}`,
          type: 'grammar',
          content: generateSpanishGrammar('intermediate', i + 1)
        }))
      },
      'advanced': {
        name: 'Advanced',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 101,
          title: `Spanish Conversation ${i + 1}`,
          type: 'conversation',
          content: generateSpanishConversation('advanced', i + 1)
        }))
      },
      'expert': {
        name: 'Expert',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 151,
          title: `Spanish Literature ${i + 1}`,
          type: 'expert',
          content: generateSpanishExpert('expert', i + 1)
        }))
      }
    }
  },

  ko: {
    name: 'Korean',
    levels: {
      'beginner': {
        name: 'Beginner',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 1,
          title: `Korean Hangul ${i + 1}`,
          type: 'writing',
          content: generateKoreanHangul('beginner', i + 1)
        }))
      },
      'intermediate': {
        name: 'Intermediate',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 51,
          title: `Korean Grammar ${i + 1}`,
          type: 'grammar',
          content: generateKoreanGrammar('intermediate', i + 1)
        }))
      },
      'advanced': {
        name: 'Advanced',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 101,
          title: `Korean Honorifics ${i + 1}`,
          type: 'advanced',
          content: generateKoreanHonorifics('advanced', i + 1)
        }))
      },
      'expert': {
        name: 'Expert',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 151,
          title: `Korean Culture ${i + 1}`,
          type: 'expert',
          content: generateKoreanExpert('expert', i + 1)
        }))
      }
    }
  },

  ru: {
    name: 'Russian',
    levels: {
      'beginner': {
        name: 'Beginner',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 1,
          title: `Russian Cyrillic ${i + 1}`,
          type: 'writing',
          content: generateRussianCyrillic('beginner', i + 1)
        }))
      },
      'intermediate': {
        name: 'Intermediate',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 51,
          title: `Russian Cases ${i + 1}`,
          type: 'grammar',
          content: generateRussianCases('intermediate', i + 1)
        }))
      },
      'advanced': {
        name: 'Advanced',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 101,
          title: `Russian Verbs ${i + 1}`,
          type: 'advanced',
          content: generateRussianVerbs('advanced', i + 1)
        }))
      },
      'expert': {
        name: 'Expert',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 151,
          title: `Russian Literature ${i + 1}`,
          type: 'expert',
          content: generateRussianExpert('expert', i + 1)
        }))
      }
    }
  },

  de: {
    name: 'German',
    levels: {
      'beginner': {
        name: 'Beginner',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 1,
          title: `German Basics ${i + 1}`,
          type: 'vocabulary',
          content: generateGermanVocab('beginner', i + 1)
        }))
      },
      'intermediate': {
        name: 'Intermediate',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 51,
          title: `German Cases ${i + 1}`,
          type: 'grammar',
          content: generateGermanCases('intermediate', i + 1)
        }))
      },
      'advanced': {
        name: 'Advanced',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 101,
          title: `German Compound Words ${i + 1}`,
          type: 'advanced',
          content: generateGermanCompounds('advanced', i + 1)
        }))
      },
      'expert': {
        name: 'Expert',
        lessons: Array.from({length: 50}, (_, i) => ({
          id: i + 151,
          title: `German Philosophy ${i + 1}`,
          type: 'expert',
          content: generateGermanExpert('expert', i + 1)
        }))
      }
    }
  }
};

// Generator functions for different lesson types
function generateKanaLesson(lessonNum: number) {
  const kanaData = [
    { kana: 'あ', romaji: 'a', meaning: 'vowel a' },
    { kana: 'か', romaji: 'ka', meaning: 'ka sound' },
    { kana: 'さ', romaji: 'sa', meaning: 'sa sound' },
    // Add more kana data based on lesson number
  ];
  
  return {
    vocabulary: kanaData.slice(0, 10).map((item, i) => ({
      id: i + 1,
      word: item.kana,
      translation: item.meaning,
      romanization: item.romaji,
      pronunciation: item.romaji,
      examples: [`${item.kana} - ${item.romaji}`]
    })),
    exercises: generateExercises(kanaData.slice(0, 10), 'kana')
  };
}

function generateJapaneseVocab(level: string, lessonNum: number) {
  const vocab = getJapaneseVocabByLevel(level, lessonNum);
  return {
    vocabulary: vocab,
    exercises: generateExercises(vocab, 'vocabulary')
  };
}

function generateJapaneseGrammar(level: string, lessonNum: number) {
  const grammar = getJapaneseGrammarByLevel(level, lessonNum);
  return {
    grammar: grammar,
    exercises: generateExercises(grammar, 'grammar')
  };
}

function generateJapaneseMixed(level: string, lessonNum: number) {
  const vocab = getJapaneseVocabByLevel(level, lessonNum);
  const grammar = getJapaneseGrammarByLevel(level, lessonNum);
  return {
    vocabulary: vocab.slice(0, 5),
    grammar: grammar.slice(0, 5),
    exercises: generateExercises([...vocab.slice(0, 5), ...grammar.slice(0, 5)], 'mixed')
  };
}

function generateJapaneseAdvanced(level: string, lessonNum: number) {
  // Similar pattern for advanced content
  return generateJapaneseMixed(level, lessonNum);
}

function generateJapaneseExpert(level: string, lessonNum: number) {
  // Similar pattern for expert content
  return generateJapaneseMixed(level, lessonNum);
}

// Similar generator functions for other languages...
function generateChineseVocab(level: string, lessonNum: number) {
  const vocab = getChineseVocabByLevel(level, lessonNum);
  return {
    vocabulary: vocab,
    exercises: generateExercises(vocab, 'vocabulary')
  };
}

function generateChineseGrammar(level: string, lessonNum: number) {
  const grammar = getChineseGrammarByLevel(level, lessonNum);
  return {
    grammar: grammar,
    exercises: generateExercises(grammar, 'grammar')
  };
}

function generateChineseWriting(level: string, lessonNum: number) {
  const writing = getChineseWritingByLevel(level, lessonNum);
  return {
    writing: writing,
    exercises: generateExercises(writing, 'writing')
  };
}

function generateChineseExpert(level: string, lessonNum: number) {
  return generateChineseVocab(level, lessonNum);
}

// Continue similar patterns for Croatian, Spanish, Korean, Russian, German...
function generateCroatianVocab(level: string, lessonNum: number) {
  const vocab = getCroatianVocabByLevel(level, lessonNum);
  return {
    vocabulary: vocab,
    exercises: generateExercises(vocab, 'vocabulary')
  };
}

function generateCroatianGrammar(level: string, lessonNum: number) {
  const grammar = getCroatianGrammarByLevel(level, lessonNum);
  return {
    grammar: grammar,
    exercises: generateExercises(grammar, 'grammar')
  };
}

function generateCroatianWriting(level: string, lessonNum: number) {
  const writing = getCroatianWritingByLevel(level, lessonNum);
  return {
    writing: writing,
    exercises: generateExercises(writing, 'writing')
  };
}

function generateCroatianExpert(level: string, lessonNum: number) {
  return generateCroatianVocab(level, lessonNum);
}

// Spanish generators
function generateSpanishVocab(level: string, lessonNum: number) {
  const vocab = getSpanishVocabByLevel(level, lessonNum);
  return {
    vocabulary: vocab,
    exercises: generateExercises(vocab, 'vocabulary')
  };
}

function generateSpanishGrammar(level: string, lessonNum: number) {
  const grammar = getSpanishGrammarByLevel(level, lessonNum);
  return {
    grammar: grammar,
    exercises: generateExercises(grammar, 'grammar')
  };
}

function generateSpanishConversation(level: string, lessonNum: number) {
  const conversation = getSpanishConversationByLevel(level, lessonNum);
  return {
    conversation: conversation,
    exercises: generateExercises(conversation, 'conversation')
  };
}

function generateSpanishExpert(level: string, lessonNum: number) {
  return generateSpanishVocab(level, lessonNum);
}

// Korean generators
function generateKoreanHangul(level: string, lessonNum: number) {
  const hangul = getKoreanHangulByLevel(level, lessonNum);
  return {
    hangul: hangul,
    exercises: generateExercises(hangul, 'writing')
  };
}

function generateKoreanGrammar(level: string, lessonNum: number) {
  const grammar = getKoreanGrammarByLevel(level, lessonNum);
  return {
    grammar: grammar,
    exercises: generateExercises(grammar, 'grammar')
  };
}

function generateKoreanHonorifics(level: string, lessonNum: number) {
  const honorifics = getKoreanHonorificeByLevel(level, lessonNum);
  return {
    honorifics: honorifics,
    exercises: generateExercises(honorifics, 'advanced')
  };
}

function generateKoreanExpert(level: string, lessonNum: number) {
  return generateKoreanGrammar(level, lessonNum);
}

// Russian generators
function generateRussianCyrillic(level: string, lessonNum: number) {
  const cyrillic = getRussianCyrillicByLevel(level, lessonNum);
  return {
    cyrillic: cyrillic,
    exercises: generateExercises(cyrillic, 'writing')
  };
}

function generateRussianCases(level: string, lessonNum: number) {
  const cases = getRussianCasesByLevel(level, lessonNum);
  return {
    cases: cases,
    exercises: generateExercises(cases, 'grammar')
  };
}

function generateRussianVerbs(level: string, lessonNum: number) {
  const verbs = getRussianVerbsByLevel(level, lessonNum);
  return {
    verbs: verbs,
    exercises: generateExercises(verbs, 'advanced')
  };
}

function generateRussianExpert(level: string, lessonNum: number) {
  return generateRussianVerbs(level, lessonNum);
}

// German generators
function generateGermanVocab(level: string, lessonNum: number) {
  const vocab = getGermanVocabByLevel(level, lessonNum);
  return {
    vocabulary: vocab,
    exercises: generateExercises(vocab, 'vocabulary')
  };
}

function generateGermanCases(level: string, lessonNum: number) {
  const cases = getGermanCasesByLevel(level, lessonNum);
  return {
    cases: cases,
    exercises: generateExercises(cases, 'grammar')
  };
}

function generateGermanCompounds(level: string, lessonNum: number) {
  const compounds = getGermanCompoundsByLevel(level, lessonNum);
  return {
    compounds: compounds,
    exercises: generateExercises(compounds, 'advanced')
  };
}

function generateGermanExpert(level: string, lessonNum: number) {
  return generateGermanCompounds(level, lessonNum);
}

// Exercise generation helper
function generateExercises(data: any[], type: string) {
  return [
    {
      type: 'flashcard',
      questions: data.slice(0, 5).map((item, i) => ({
        id: i + 1,
        question: item.word || item.kana || item.term,
        answer: item.translation || item.meaning,
        options: []
      }))
    },
    {
      type: 'multiple-choice',
      questions: data.slice(0, 5).map((item, i) => ({
        id: i + 1,
        question: `What does "${item.word || item.kana || item.term}" mean?`,
        answer: item.translation || item.meaning,
        options: generateMultipleChoiceOptions(item.translation || item.meaning, data)
      }))
    },
    {
      type: 'fill-blank',
      questions: data.slice(0, 3).map((item, i) => ({
        id: i + 1,
        sentence: `Complete: ${item.example || `This is a ${item.word || item.term}`}`,
        answer: item.word || item.term,
        blank: '___'
      }))
    },
    {
      type: 'drag-drop',
      questions: data.slice(0, 3).map((item, i) => ({
        id: i + 1,
        sentence: `${item.example || `This means ${item.translation}`}`,
        words: [item.word || item.term, ...generateDragDropWords(data)],
        correctOrder: [item.word || item.term]
      }))
    }
  ];
}

function generateMultipleChoiceOptions(correct: string, allData: any[]) {
  const options = [correct];
  const otherOptions = allData
    .filter(item => (item.translation || item.meaning) !== correct)
    .slice(0, 3)
    .map(item => item.translation || item.meaning);
  
  return [...options, ...otherOptions].sort(() => Math.random() - 0.5);
}

function generateDragDropWords(data: any[]) {
  return data.slice(1, 4).map(item => item.word || item.term);
}

// Data getters - these would contain actual lesson content
function getJapaneseVocabByLevel(level: string, lessonNum: number) {
  // Return actual Japanese vocabulary based on level and lesson number
  return Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    word: `日本語${i + 1}`,
    translation: `Japanese word ${i + 1}`,
    romanization: `nihongo${i + 1}`,
    pronunciation: `nihongo${i + 1}`,
    examples: [`Example sentence ${i + 1}`]
  }));
}

function getJapaneseGrammarByLevel(level: string, lessonNum: number) {
  return Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    pattern: `Grammar pattern ${i + 1}`,
    meaning: `Grammar meaning ${i + 1}`,
    example: `Example: Grammar ${i + 1}`,
    usage: `Usage explanation ${i + 1}`
  }));
}

// Similar data getters for other languages...
function getChineseVocabByLevel(level: string, lessonNum: number) {
  return Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    word: `中文${i + 1}`,
    translation: `Chinese word ${i + 1}`,
    pinyin: `zhongwen${i + 1}`,
    examples: [`Chinese example ${i + 1}`]
  }));
}

function getChineseGrammarByLevel(level: string, lessonNum: number) {
  return Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    pattern: `Chinese grammar ${i + 1}`,
    meaning: `Grammar meaning ${i + 1}`,
    example: `Chinese grammar example ${i + 1}`
  }));
}

function getChineseWritingByLevel(level: string, lessonNum: number) {
  return Array.from({length: 8}, (_, i) => ({
    id: i + 1,
    character: `字${i + 1}`,
    meaning: `Character meaning ${i + 1}`,
    strokes: i + 3,
    radicals: [`Radical ${i + 1}`]
  }));
}

// Continue similar patterns for all other languages...
function getCroatianVocabByLevel(level: string, lessonNum: number) {
  return Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    word: `riječ${i + 1}`,
    translation: `Croatian word ${i + 1}`,
    examples: [`Croatian example ${i + 1}`]
  }));
}

function getCroatianGrammarByLevel(level: string, lessonNum: number) {
  return Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    pattern: `Croatian grammar ${i + 1}`,
    meaning: `Grammar meaning ${i + 1}`,
    example: `Croatian example ${i + 1}`
  }));
}

function getCroatianWritingByLevel(level: string, lessonNum: number) {
  return Array.from({length: 8}, (_, i) => ({
    id: i + 1,
    letter: `${String.fromCharCode(1040 + i)}`, // Cyrillic letters
    latin: `${String.fromCharCode(65 + i)}`,
    sound: `Sound ${i + 1}`
  }));
}

function getSpanishVocabByLevel(level: string, lessonNum: number) {
  return Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    word: `palabra${i + 1}`,
    translation: `Spanish word ${i + 1}`,
    examples: [`Spanish example ${i + 1}`]
  }));
}

function getSpanishGrammarByLevel(level: string, lessonNum: number) {
  return Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    pattern: `Spanish grammar ${i + 1}`,
    meaning: `Grammar meaning ${i + 1}`,
    example: `Spanish example ${i + 1}`
  }));
}

function getSpanishConversationByLevel(level: string, lessonNum: number) {
  return Array.from({length: 6}, (_, i) => ({
    id: i + 1,
    dialogue: `Spanish dialogue ${i + 1}`,
    translation: `Dialogue translation ${i + 1}`,
    context: `Conversation context ${i + 1}`
  }));
}

function getKoreanHangulByLevel(level: string, lessonNum: number) {
  return Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    hangul: `한글${i + 1}`,
    romanization: `hangul${i + 1}`,
    meaning: `Korean meaning ${i + 1}`
  }));
}

function getKoreanGrammarByLevel(level: string, lessonNum: number) {
  return Array.from({length: 5}, (_, i) => ({
    id: i + 1,
    pattern: `Korean grammar ${i + 1}`,
    meaning: `Grammar meaning ${i + 1}`,
    example: `Korean example ${i + 1}`
  }));
}

function getKoreanHonorificeByLevel(level: string, lessonNum: number) {
  return Array.from({length: 6}, (_, i) => ({
    id: i + 1,
    formal: `Formal form ${i + 1}`,
    casual: `Casual form ${i + 1}`,
    context: `Usage context ${i + 1}`
  }));
}

function getRussianCyrillicByLevel(level: string, lessonNum: number) {
  return Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    cyrillic: `${String.fromCharCode(1040 + i)}`,
    latin: `${String.fromCharCode(65 + i)}`,
    sound: `Russian sound ${i + 1}`
  }));
}

function getRussianCasesByLevel(level: string, lessonNum: number) {
  return Array.from({length: 6}, (_, i) => ({
    id: i + 1,
    case: `Case ${i + 1}`,
    usage: `Case usage ${i + 1}`,
    example: `Russian case example ${i + 1}`
  }));
}

function getRussianVerbsByLevel(level: string, lessonNum: number) {
  return Array.from({length: 8}, (_, i) => ({
    id: i + 1,
    infinitive: `Russian verb ${i + 1}`,
    conjugations: [`Form 1`, `Form 2`, `Form 3`],
    meaning: `Verb meaning ${i + 1}`
  }));
}

function getGermanVocabByLevel(level: string, lessonNum: number) {
  return Array.from({length: 10}, (_, i) => ({
    id: i + 1,
    word: `Wort${i + 1}`,
    translation: `German word ${i + 1}`,
    article: i % 3 === 0 ? 'der' : i % 3 === 1 ? 'die' : 'das',
    examples: [`German example ${i + 1}`]
  }));
}

function getGermanCasesByLevel(level: string, lessonNum: number) {
  return Array.from({length: 4}, (_, i) => ({
    id: i + 1,
    case: ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'][i],
    usage: `German case usage ${i + 1}`,
    example: `German case example ${i + 1}`
  }));
}

function getGermanCompoundsByLevel(level: string, lessonNum: number) {
  return Array.from({length: 8}, (_, i) => ({
    id: i + 1,
    compound: `Zusammengesetzteswort${i + 1}`,
    parts: [`Teil1`, `Teil2`],
    meaning: `Compound meaning ${i + 1}`
  }));
}