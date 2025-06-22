import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixAllLessonIssues() {
  console.log('Fixing all lesson data issues...');
  
  const lessonDirs = ['chinese', 'japanese', 'korean', 'russian', 'german', 'spanish', 'croatian'];
  let totalFixed = 0;
  
  for (const dir of lessonDirs) {
    const dirPath = path.join(__dirname, '..', 'client', 'src', 'data', 'lessons', dir);
    
    if (fs.existsSync(dirPath)) {
      console.log(`\nProcessing ${dir} lessons...`);
      const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          let modified = false;
          
          if (data && data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
              // Fix Issue 1: Remove numbers and variants from words
              if (item.word) {
                const originalWord = item.word;
                item.word = item.word.replace(/\d+$/, '').trim();
                item.word = item.word.replace(/\s*\(variant\s*\d+\)/, '').trim();
                
                if (originalWord !== item.word) {
                  modified = true;
                }
              }
              
              // Fix Issue 2: Remove variant text from english meanings
              if (item.english) {
                const originalEnglish = item.english;
                item.english = item.english.replace(/\s*\(variant\s*\d+\)/, '').trim();
                
                if (originalEnglish !== item.english) {
                  modified = true;
                }
              }
              
              // Fix Issue 3: Add missing fields for proper quiz functionality
              if (!item.question && item.word && item.english) {
                item.question = `What does "${item.word}" mean?`;
                modified = true;
              }
              
              if (!item.answer && item.english) {
                item.answer = item.english;
                modified = true;
              }
              
              if (!item.translation && item.english) {
                item.translation = item.english;
                modified = true;
              }
              
              // Fix Issue 4: Add proper options for multiple choice
              if (!item.options && item.english) {
                item.options = generateCorrectOptions(item.english, data.items);
                modified = true;
              }
              
              // Fix Issue 5: Clean up pronunciation fields
              if (item.pinyin && !item.pronunciation) {
                item.pronunciation = item.pinyin;
                modified = true;
              }
              
              if (item.romanization && !item.pronunciation) {
                item.pronunciation = item.romanization;
                modified = true;
              }
            });
            
            // Fix Issue 6: Ensure we have exactly 100 unique items per lesson
            if (data.items.length > 100) {
              // Remove duplicates first
              const uniqueItems = [];
              const seen = new Set();
              
              for (const item of data.items) {
                const key = `${item.word}-${item.english}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  uniqueItems.push(item);
                }
              }
              
              data.items = uniqueItems.slice(0, 100);
              modified = true;
            }
            
            if (modified) {
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              totalFixed++;
            }
          }
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error.message);
        }
      }
    }
  }
  
  console.log(`\nFixed ${totalFixed} lesson files total.`);
}

function generateCorrectOptions(correctAnswer, allItems) {
  // Get 3 wrong answers from the same lesson
  const wrongAnswers = allItems
    .filter(item => item.english && item.english !== correctAnswer)
    .map(item => item.english)
    .slice(0, 3);
  
  // Fill with generic options if not enough
  const fallbackOptions = ['good', 'bad', 'big', 'small', 'hot', 'cold'];
  while (wrongAnswers.length < 3) {
    const fallback = fallbackOptions[wrongAnswers.length];
    if (fallback !== correctAnswer) {
      wrongAnswers.push(fallback);
    }
  }
  
  // Combine and shuffle
  const allOptions = [correctAnswer, ...wrongAnswers.slice(0, 3)];
  return allOptions.sort(() => Math.random() - 0.5);
}

// Run the fix
fixAllLessonIssues().catch(console.error);