import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix all lesson data issues
async function fixLessonIssues() {
  console.log('Starting comprehensive lesson data fixes...');
  
  const languages = ['ja', 'zh', 'ko', 'ru', 'de', 'es', 'hr'];
  let totalFixed = 0;
  
  for (const lang of languages) {
    console.log(`\nFixing ${lang} lessons...`);
    
    for (let lessonNum = 1; lessonNum <= 200; lessonNum++) {
      const filePath = path.join(__dirname, '..', 'client', 'src', 'data', 'lessons', `${lang}-${lessonNum}.json`);
      
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          let modified = false;
          
          if (data && data.length > 0) {
            data.forEach(item => {
              // Fix 1: Remove numbers and variants from answers
              if (item.answer) {
                const originalAnswer = item.answer;
                // Remove trailing numbers like "word1", "word2"
                item.answer = item.answer.replace(/\d+$/, '').trim();
                // Remove variant patterns like "(variant 1)", "(variant 2)"
                item.answer = item.answer.replace(/\s*\(variant\s*\d+\)\s*/gi, '').trim();
                // Remove other number patterns
                item.answer = item.answer.replace(/\s*\d+\s*$/, '').trim();
                
                if (originalAnswer !== item.answer) {
                  modified = true;
                }
              }
              
              // Fix 2: Ensure translations exist and are clean
              if (item.translation) {
                const originalTranslation = item.translation;
                item.translation = item.translation.replace(/\s*\(variant\s*\d+\)\s*/gi, '').trim();
                item.translation = item.translation.replace(/\s*\d+\s*$/, '').trim();
                
                if (originalTranslation !== item.translation) {
                  modified = true;
                }
              } else if (!item.translation && item.answer) {
                // Add missing translations for basic words
                const basicTranslations = {
                  'ja': {
                    'こんにちは': 'hello',
                    'ありがとう': 'thank you',
                    'すみません': 'excuse me',
                    'はい': 'yes',
                    'いいえ': 'no',
                    'おはよう': 'good morning',
                    'こんばんは': 'good evening',
                    'さようなら': 'goodbye'
                  },
                  'zh': {
                    '你好': 'hello',
                    '谢谢': 'thank you',
                    '对不起': 'sorry',
                    '是': 'yes',
                    '不是': 'no',
                    '早上好': 'good morning',
                    '晚上好': 'good evening',
                    '再见': 'goodbye'
                  },
                  'ko': {
                    '안녕하세요': 'hello',
                    '감사합니다': 'thank you',
                    '죄송합니다': 'sorry',
                    '네': 'yes',
                    '아니요': 'no',
                    '좋은 아침': 'good morning',
                    '좋은 저녁': 'good evening',
                    '안녕히 가세요': 'goodbye'
                  },
                  'ru': {
                    'привет': 'hello',
                    'спасибо': 'thank you',
                    'извините': 'excuse me',
                    'да': 'yes',
                    'нет': 'no',
                    'доброе утро': 'good morning',
                    'добрый вечер': 'good evening',
                    'до свидания': 'goodbye'
                  },
                  'de': {
                    'hallo': 'hello',
                    'danke': 'thank you',
                    'entschuldigung': 'excuse me',
                    'ja': 'yes',
                    'nein': 'no',
                    'guten morgen': 'good morning',
                    'guten abend': 'good evening',
                    'auf wiedersehen': 'goodbye'
                  },
                  'es': {
                    'hola': 'hello',
                    'gracias': 'thank you',
                    'perdón': 'sorry',
                    'sí': 'yes',
                    'no': 'no',
                    'buenos días': 'good morning',
                    'buenas noches': 'good evening',
                    'adiós': 'goodbye'
                  },
                  'hr': {
                    'zdravo': 'hello',
                    'hvala': 'thank you',
                    'oprostite': 'excuse me',
                    'da': 'yes',
                    'ne': 'no',
                    'dobro jutro': 'good morning',
                    'dobra večer': 'good evening',
                    'doviđenja': 'goodbye'
                  }
                };
                
                if (basicTranslations[lang] && basicTranslations[lang][item.answer]) {
                  item.translation = basicTranslations[lang][item.answer];
                  modified = true;
                }
              }
              
              // Fix 3: Ensure questions are properly formatted
              if (item.question) {
                const originalQuestion = item.question;
                // Fix questions that don't have proper format
                if (!item.question.includes('"') && item.answer) {
                  item.question = `What does "${item.answer}" mean?`;
                  modified = true;
                }
                // Clean up question formatting
                item.question = item.question.replace(/\s*\d+\s*$/, '').trim();
                
                if (originalQuestion !== item.question) {
                  modified = true;
                }
              }
              
              // Fix 4: Ensure options exist and are not blank
              if (!item.options || item.options.length === 0 || item.options.some(opt => !opt || opt.trim() === '')) {
                // Generate proper options based on language
                const correctAnswer = item.translation || item.answer || 'unknown';
                const wrongOptions = generateWrongOptions(lang, correctAnswer);
                item.options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
                modified = true;
              }
              
              // Fix 5: Add pronunciations for relevant languages
              if (['ja', 'zh', 'ko', 'ru'].includes(lang) && !item.pronunciation && item.answer) {
                item.pronunciation = generatePronunciation(lang, item.answer);
                if (item.pronunciation) {
                  modified = true;
                }
              }
            });
            
            if (modified) {
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              totalFixed++;
              if (totalFixed % 50 === 0) {
                console.log(`Fixed ${totalFixed} lessons so far...`);
              }
            }
          }
        } catch (error) {
          console.error(`Error fixing ${filePath}:`, error.message);
        }
      }
    }
  }
  
  console.log(`\nCompleted! Fixed ${totalFixed} lesson files.`);
}

function generateWrongOptions(lang, correctAnswer) {
  const wrongOptionsByLang = {
    'ja': ['good', 'bad', 'big', 'small', 'hot', 'cold', 'new', 'old'],
    'zh': ['water', 'fire', 'earth', 'wind', 'mountain', 'river', 'tree', 'flower'],
    'ko': ['family', 'friend', 'house', 'school', 'work', 'food', 'time', 'money'],
    'ru': ['book', 'table', 'chair', 'window', 'door', 'car', 'street', 'city'],
    'de': ['house', 'garden', 'street', 'car', 'book', 'table', 'chair', 'window'],
    'es': ['casa', 'jardín', 'calle', 'coche', 'libro', 'mesa', 'silla', 'ventana'],
    'hr': ['kuća', 'vrt', 'ulica', 'auto', 'knjiga', 'stol', 'stolica', 'prozor']
  };
  
  const options = wrongOptionsByLang[lang] || ['option1', 'option2', 'option3'];
  return options.filter(opt => opt !== correctAnswer).slice(0, 3);
}

function generatePronunciation(lang, word) {
  if (!word) return null;
  
  const pronunciationRules = {
    'ja': (w) => w.replace(/[ぁ-ゟ]/g, (char) => {
      // Simple hiragana to romaji mapping
      const mapping = {
        'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
        'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
        'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
        'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
        'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
        'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
        'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
        'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
        'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
        'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
        'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
        'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
        'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
        'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
        'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n'
      };
      return mapping[char] || char;
    }),
    'zh': (w) => {
      // Simple pinyin generation for common words
      const pinyinMap = {
        '你好': 'nǐ hǎo',
        '谢谢': 'xiè xiè',
        '对不起': 'duì bù qǐ',
        '是': 'shì',
        '不是': 'bù shì',
        '早上好': 'zǎo shàng hǎo',
        '晚上好': 'wǎn shàng hǎo',
        '再见': 'zài jiàn'
      };
      return pinyinMap[w] || w;
    },
    'ko': (w) => {
      // Simple romanization for Korean
      const romanMap = {
        '안녕하세요': 'annyeonghaseyo',
        '감사합니다': 'gamsahamnida',
        '죄송합니다': 'joesonghamnida',
        '네': 'ne',
        '아니요': 'aniyo',
        '좋은 아침': 'joeun achim',
        '좋은 저녁': 'joeun jeonyeok',
        '안녕히 가세요': 'annyeonghi gaseyo'
      };
      return romanMap[w] || w;
    },
    'ru': (w) => {
      // Simple transliteration for Russian
      const translitMap = {
        'привет': 'privet',
        'спасибо': 'spasibo',
        'извините': 'izvinite',
        'да': 'da',
        'нет': 'net',
        'доброе утро': 'dobroye utro',
        'добрый вечер': 'dobryy vecher',
        'до свидания': 'do svidaniya'
      };
      return translitMap[w] || w;
    }
  };
  
  return pronunciationRules[lang] ? pronunciationRules[lang](word) : null;
}

// Run the fix
fixLessonIssues().catch(console.error);