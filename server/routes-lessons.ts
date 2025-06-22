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

      // Use direct folder name if it matches, otherwise map language code
      const folderName = languageMap[language] || language;
      
      // Map lesson ID to file path - try different formats
      const lessonFile = `lesson-${lessonNumber.padStart(3, '0')}.json`;
      const lessonPath = path.join(process.cwd(), 'client/src/data/lessons', folderName, lessonFile);
      
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

      const languageFolder = languageMap[languageCode];
      if (!languageFolder) {
        return res.status(400).json({ error: "Unsupported language" });
      }

      const lessonsDir = path.join(process.cwd(), 'client/src/data/lessons', languageFolder);
      
      try {
        const files = await fs.readdir(lessonsDir);
        const jsonFiles = files.filter(file => file.endsWith('.json') && file.startsWith('lesson-'));
        
        const lessons = [];
        for (const file of jsonFiles) {
          try {
            const filePath = path.join(lessonsDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const lessonData = JSON.parse(content);
            
            // Add lesson metadata
            const lessonNumber = parseInt(file.replace('lesson-', '').replace('.json', ''));
            lessons.push({
              id: lessonNumber,
              title: lessonData.title || `Lesson ${lessonNumber}`,
              description: lessonData.description || `Learn ${languageFolder} fundamentals`,
              level: lessonData.level || 'beginner',
              xpReward: lessonData.xpReward || 25,
              itemCount: lessonData.vocabulary?.length || lessonData.exercises?.length || 10,
              languageCode
            });
          } catch (parseError) {
            console.error(`Error parsing lesson file ${file}:`, parseError);
          }
        }
        
        // Filter by level if specified
        const filteredLessons = level 
          ? lessons.filter(lesson => lesson.level === level)
          : lessons;
          
        // Sort by lesson ID
        filteredLessons.sort((a, b) => a.id - b.id);
        
        res.json(filteredLessons);
      } catch (dirError) {
        console.error("Error reading lessons directory:", dirError);
        res.json([]); // Return empty array if directory doesn't exist
      }
    } catch (error) {
      console.error("Get lessons error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}