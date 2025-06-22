import React, { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Lock, CheckCircle2, ArrowLeft, Eye, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getLanguageByCode } from "@/data/languages";
import { EnhancedWritingSystemOverlay } from "@/components/overlays/enhanced-writing-system-overlay";
import { generateDirectLessons, getLessonsByLevel, getLevelsForLanguage } from "@/data/lesson-structure";

export default function LessonsList() {
  const { languageCode } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string>("");
  const [showWritingSystem, setShowWritingSystem] = useState(false);
  const { user } = useAuth();

  const language = getLanguageByCode(languageCode || "");

  // Generate lessons directly without API calls
  const allLessons = generateDirectLessons(languageCode || "");
  const availableLevels = getLevelsForLanguage(languageCode || "");

  // Set initial active level
  useEffect(() => {
    if (availableLevels.length > 0 && !activeLevel) {
      setActiveLevel(availableLevels[0]);
    }
  }, [availableLevels, activeLevel]);

  // Filter lessons by level
  const getLessonsForLevel = (level: string) => {
    return getLessonsByLevel(allLessons, level);
  };

  if (!language) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Language not found</h2>
          <Link href="/lessons">
            <Button>Back to Languages</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Language Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/lessons">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Languages
                  </Button>
                </Link>
              </div>

              <div className="flex items-start gap-6">
                <div className="text-6xl">{language.flag}</div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold gradient-text mb-2">{language.name}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{language.nativeName}</p>
                  <p className="text-sm text-muted-foreground mb-4">{language.description}</p>
                </div>
              </div>
              
              {language.writingSystem && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Writing System</h3>
                      <p className="text-purple-800 dark:text-purple-200">{language.writingSystem}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowWritingSystem(true)}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Lessons by Level */}
            <Tabs value={activeLevel} onValueChange={setActiveLevel} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-8">
                {availableLevels.map((level) => (
                  <TabsTrigger key={level} value={level} className="text-xs lg:text-sm">
                    {level.replace('-', ' ').replace('jlpt ', 'JLPT ')}
                  </TabsTrigger>
                ))}
              </TabsList>

              {availableLevels.map((level) => {
                const lessons = getLessonsForLevel(level);
                
                return (
                  <TabsContent key={level} value={level}>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2 capitalize">
                        {level.replace('-', ' ').replace('jlpt', 'JLPT')} Level
                      </h2>
                      <p className="text-muted-foreground">
                        {lessons.length} lessons available • Start your learning journey
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {lessons.map((lesson) => (
                        <Card key={lesson.id} className={`hover-lift transition-all duration-200 ${lesson.isLocked ? 'opacity-60' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  lesson.isCompleted ? 'bg-green-100 text-green-600' : 
                                  lesson.isLocked ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'
                                }`}>
                                  {lesson.isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                   lesson.isLocked ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{lesson.title}</h3>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {lesson.type.replace('-', ' ')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{lesson.isCompleted ? '100%' : '0%'}</span>
                              </div>
                              <Progress value={lesson.isCompleted ? 100 : 0} className="h-2" />
                              
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Difficulty: {lesson.difficulty}</span>
                                <span>{lesson.xpReward} XP</span>
                              </div>
                            </div>

                            <div className="mt-4">
                              {lesson.isLocked ? (
                                <Button disabled variant="outline" className="w-full">
                                  <Lock className="w-4 h-4 mr-2" />
                                  Locked
                                </Button>
                              ) : (
                                <Link href={`/lesson/${lesson.id}`} className="block">
                                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                                    <Play className="h-4 w-4 mr-2" />
                                    {lesson.isCompleted ? 'Review' : 'Start'} Lesson
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {lessons.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                          No lessons available
                        </h3>
                        <p className="text-muted-foreground">
                          This level doesn't have lessons yet. Try other levels!
                        </p>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </main>
      </div>
      
      <EnhancedWritingSystemOverlay
        isOpen={showWritingSystem}
        onClose={() => setShowWritingSystem(false)}
        languageCode={languageCode || ""}
      />
    </div>
  );
}