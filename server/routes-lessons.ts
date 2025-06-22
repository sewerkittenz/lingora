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

      const lessonsDir = path.join(process.cwd(), 'client/src/data/lessons', languageCode);
      
      try {
        const files = await fs.readdir(lessonsDir);
        const lessonFiles = files.filter(f => f.startsWith('lesson-') && f.endsWith('.json'));
        
        const lessons = [];
        for (const file of lessonFiles) {
          try {
            const lessonData = await fs.readFile(path.join(lessonsDir, file), 'utf-8');
            const lesson = JSON.parse(lessonData);
            
            // Set the correct level based on language
            let lessonLevel = lesson.level;
            if (languageCode === 'ja') {
              // Japanese has special levels
              if (lesson.id <= 30) lessonLevel = 'kana';
              else if (lesson.id <= 60) lessonLevel = 'jlpt-n5';
              else if (lesson.id <= 90) lessonLevel = 'jlpt-n4';
              else if (lesson.id <= 120) lessonLevel = 'jlpt-n3';
              else if (lesson.id <= 150) lessonLevel = 'jlpt-n2';
              else lessonLevel = 'jlpt-n1';
            } else {
              // Other languages use standard levels
              if (lesson.id <= 50) lessonLevel = 'beginner';
              else if (lesson.id <= 100) lessonLevel = 'intermediate';
              else if (lesson.id <= 150) lessonLevel = 'advanced';
              else lessonLevel = 'expert';
            }
            
            // Filter by level if specified
            if (!level || lessonLevel === level) {
              lessons.push({
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
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