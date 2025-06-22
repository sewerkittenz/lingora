import type { Express } from "express";
import fs from "fs/promises";
import path from "path";

export function registerLessonRoutes(app: Express) {
  // Get lesson data from JSON files
  app.get("/api/lessons/:lessonId", async (req, res) => {
    try {
      const lessonId = req.params.lessonId;
      const [language, lessonNumber] = lessonId.split('-');
      
      if (!language || !lessonNumber) {
        return res.status(400).json({ error: "Invalid lesson ID format" });
      }

      // Map lesson ID to file path
      const lessonFile = `lesson-${lessonNumber.padStart(3, '0')}.json`;
      const lessonPath = path.join(process.cwd(), 'client/src/data/lessons', language, lessonFile);
      
      try {
        const lessonData = await fs.readFile(lessonPath, 'utf-8');
        const lesson = JSON.parse(lessonData);
        res.json(lesson);
      } catch (fileError) {
        console.error("Lesson file not found:", lessonPath);
        return res.status(404).json({ error: "Lesson not found" });
      }
    } catch (error) {
      console.error("Get lesson error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get lessons list for a language
  app.get("/api/languages/:languageCode/lessons", async (req, res) => {
    try {
      const { languageCode } = req.params;
      const { level } = req.query;

      // Map language codes to folder names
      const languageMap: Record<string, string> = {
        'zh': 'chinese',
        'ja': 'japanese', 
        'es': 'spanish',
        'ko': 'korean',
        'ru': 'russian',
        'de': 'german',
        'hr': 'serbo-croatian'
      };
      
      const folderName = languageMap[languageCode] || languageCode;
      const lessonsDir = path.join(process.cwd(), 'client/src/data/lessons', folderName);
      
      try {
        const files = await fs.readdir(lessonsDir);
        const lessonFiles = files.filter(f => 
          (f.startsWith('lesson-') && f.endsWith('.json')) ||
          (f.match(/^lesson-\d{3}\.json$/))
        );
        
        const lessons = [];
        for (const file of lessonFiles) {
          try {
            const lessonData = await fs.readFile(path.join(lessonsDir, file), 'utf-8');
            const lesson = JSON.parse(lessonData);
            
            // Extract lesson number from filename if not in lesson data
            const lessonId = lesson.id || parseInt(file.match(/lesson-(\d+)\.json/)?.[1] || '0');
            
            // Set the correct level based on language and lesson ID
            let lessonLevel = lesson.level || 'beginner';
            if (languageCode === 'ja') {
              // Japanese has JLPT levels
              if (lessonId <= 10) lessonLevel = 'kana';
              else if (lessonId <= 20) lessonLevel = 'jlpt-n5';
              else if (lessonId <= 30) lessonLevel = 'jlpt-n4';
              else if (lessonId <= 40) lessonLevel = 'jlpt-n3';
              else if (lessonId <= 50) lessonLevel = 'jlpt-n2';
              else lessonLevel = 'jlpt-n1';
            } else {
              // Other languages use standard levels
              if (lessonId <= 12) lessonLevel = 'beginner';
              else if (lessonId <= 25) lessonLevel = 'intermediate';
              else if (lessonId <= 38) lessonLevel = 'advanced';
              else lessonLevel = 'expert';
            }
            
            // Filter by level if specified
            if (!level || lessonLevel === level) {
              lessons.push({
                id: lessonId,
                title: lesson.title || `Lesson ${lessonId + 1}`,
                description: lesson.description || `Practice ${languageCode} fundamentals`,
                level: lessonLevel,
                itemCount: lesson.items?.length || 0
              });
            }
          } catch (parseError) {
            console.error(`Error parsing lesson file ${file}:`, parseError);
          }
        }
        
        // Sort by lesson ID
        lessons.sort((a, b) => a.id - b.id);
        res.json(lessons);
      } catch (dirError) {
        console.error("Lessons directory not found:", lessonsDir);
        return res.status(404).json({ error: "Language lessons not found" });
      }
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}