// Map lesson IDs to language codes and specific lesson files
export interface LessonMapping {
  languageCode: string;
  lessonNumber: number;
  level: string;
  type: string;
}

export const getLessonMapping = (lessonId: number): LessonMapping => {
  // Map lesson ID ranges to different languages - STRICT SEPARATION
  if (lessonId >= 1 && lessonId <= 200) {
    // Japanese lessons (1-200)
    const lessonNumber = lessonId;
    let level = 'kana';
    
    if (lessonNumber <= 30) level = 'kana';
    else if (lessonNumber <= 70) level = 'jlpt-n5';
    else if (lessonNumber <= 105) level = 'jlpt-n4';
    else if (lessonNumber <= 140) level = 'jlpt-n3';
    else if (lessonNumber <= 170) level = 'jlpt-n2';
    else level = 'jlpt-n1';
    
    return {
      languageCode: 'ja',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId >= 201 && lessonId <= 400) {
    // Chinese lessons (201-400)
    const lessonNumber = lessonId - 200;
    let level = 'beginner';
    
    if (lessonNumber <= 50) level = 'beginner';
    else if (lessonNumber <= 100) level = 'intermediate';
    else if (lessonNumber <= 150) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'zh',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId >= 401 && lessonId <= 600) {
    // Korean lessons (401-600)
    const lessonNumber = lessonId - 400;
    let level = 'beginner';
    
    if (lessonNumber <= 50) level = 'beginner';
    else if (lessonNumber <= 100) level = 'intermediate';
    else if (lessonNumber <= 150) level = 'advanced';
    else level = 'expert';
    
    return {
      languageCode: 'ko',
      lessonNumber,
      level,
      type: 'mixed'
    };
  } else if (lessonId >= 601 && lessonId <= 800) {
    // Russian lessons (601-800)
    const lessonNumber = lessonId - 600;
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
  } else if (lessonId >= 801 && lessonId <= 1000) {
    // German lessons (801-1000)
    const lessonNumber = lessonId - 800;
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
  } else if (lessonId >= 1001 && lessonId <= 1200) {
    // Spanish lessons (1001-1200)
    const lessonNumber = lessonId - 1000;
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
    // Serbo-Croatian lessons (1201-1400)
    const lessonNumber = lessonId - 1200;
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