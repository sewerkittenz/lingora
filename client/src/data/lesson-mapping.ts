// Map lesson IDs to language codes and specific lesson files
export interface LessonMapping {
  languageCode: string;
  lessonNumber: number;
  level: string;
  type: string;
}

export const getLessonMapping = (lessonId: number): LessonMapping => {
  // Map lesson ID ranges to different languages
  if (lessonId <= 100) {
    // Japanese lessons (1-100)
    const lessonNumber = lessonId;
    let level = 'kana';
    
    if (lessonNumber <= 10) level = 'kana';
    else if (lessonNumber <= 22) level = 'jlpt-n5';
    else if (lessonNumber <= 37) level = 'jlpt-n4';
    else if (lessonNumber <= 55) level = 'jlpt-n3';
    else if (lessonNumber <= 75) level = 'jlpt-n2';
    else level = 'jlpt-n1';
    
    return {
      languageCode: 'ja',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId <= 200) {
    // Chinese lessons (101-200)
    const lessonNumber = lessonId - 100;
    let level = 'beginner';
    
    if (lessonNumber <= 25) level = 'beginner';
    else if (lessonNumber <= 50) level = 'intermediate';
    else if (lessonNumber <= 75) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'zh',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId <= 300) {
    // Korean lessons (201-300)
    const lessonNumber = lessonId - 200;
    let level = 'beginner';
    
    if (lessonNumber <= 25) level = 'beginner';
    else if (lessonNumber <= 50) level = 'intermediate';
    else if (lessonNumber <= 75) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'ko',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId <= 400) {
    // Russian lessons (301-400)
    const lessonNumber = lessonId - 300;
    let level = 'beginner';
    
    if (lessonNumber <= 25) level = 'beginner';
    else if (lessonNumber <= 50) level = 'intermediate';
    else if (lessonNumber <= 75) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'ru',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId <= 500) {
    // German lessons (401-500)
    const lessonNumber = lessonId - 400;
    let level = 'beginner';
    
    if (lessonNumber <= 25) level = 'beginner';
    else if (lessonNumber <= 50) level = 'intermediate';
    else if (lessonNumber <= 75) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'de',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId <= 600) {
    // Spanish lessons (501-600)
    const lessonNumber = lessonId - 500;
    let level = 'beginner';
    
    if (lessonNumber <= 25) level = 'beginner';
    else if (lessonNumber <= 50) level = 'intermediate';
    else if (lessonNumber <= 75) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'es',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else {
    // Serbo-Croatian lessons (601-700)
    const lessonNumber = lessonId - 600;
    let level = 'beginner';
    
    if (lessonNumber <= 25) level = 'beginner';
    else if (lessonNumber <= 50) level = 'intermediate';
    else if (lessonNumber <= 75) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'hr',
      lessonNumber,
      level,
      type: 'mixed'
    };
  }
};