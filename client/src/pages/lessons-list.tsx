import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Play, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getLanguageByCode } from "@/data/languages";

export default function LessonsList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState(0);
  const { languageCode } = useParams();
  const { user } = useAuth();

  const language = getLanguageByCode(languageCode!);

  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/languages", language?.id, "lessons"],
    enabled: !!language?.id,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "progress", language?.id],
    enabled: !!user?.id && !!language?.id,
  });

  const getLessonProgress = (lessonId: number) => {
    const progress = userProgress.find((p: any) => p.lessonId === lessonId);
    return progress?.progressPercent || 0;
  };

  const isLessonCompleted = (lessonId: number) => {
    const progress = userProgress.find((p: any) => p.lessonId === lessonId);
    return progress?.completed || false;
  };

  const isLessonUnlocked = (lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    const previousLesson = mockLessons[lessonIndex - 1];
    return isLessonCompleted(previousLesson.id);
  };

  // Mock lessons data - in real app this would come from the lessons query
  const mockLessons = [
    { id: 1, title: "Hiragana あ-お", description: "Learn the first 5 hiragana characters", progress: 100, completed: true },
    { id: 2, title: "Hiragana か-こ", description: "K-sounds in hiragana", progress: 60, completed: false },
    { id: 3, title: "Hiragana さ-そ", description: "S-sounds in hiragana", progress: 0, completed: false },
    { id: 4, title: "Hiragana た-と", description: "T-sounds in hiragana", progress: 0, completed: false },
    { id: 5, title: "Hiragana な-の", description: "N-sounds in hiragana", progress: 0, completed: false },
    { id: 6, title: "Hiragana は-ほ", description: "H-sounds in hiragana", progress: 0, completed: false },
  ];

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Language not found</h1>
          <Link href="/lessons">
            <Button>← Back to Languages</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <Link href="/lessons">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{language.name} Lessons</h1>
                <p className="text-sm text-muted-foreground">{language.nativeName} - Choose your level</p>
              </div>
            </div>

            {/* Level Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
              {language.levels.map((level, index) => (
                <Button
                  key={level}
                  variant="ghost"
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeLevel === index
                      ? "text-primary border-primary bg-primary/10"
                      : index > 0 ? "text-muted-foreground border-transparent cursor-not-allowed" : "text-muted-foreground border-transparent hover:text-primary"
                  }`}
                  onClick={() => index === 0 && setActiveLevel(index)}
                  disabled={index > 0}
                >
                  {level.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockLessons.map((lesson, index) => {
                const isCompleted = lesson.completed;
                const isActive = lesson.progress > 0 && !lesson.completed;
                const isLocked = !isLessonUnlocked(index);

                return (
                  <Card 
                    key={lesson.id} 
                    className={`hover-lift cursor-pointer border-2 transition-all duration-200 ${
                      isCompleted ? 'border-secondary/50 bg-secondary/5' :
                      isActive ? 'border-accent/50 bg-accent/5' :
                      isLocked ? 'opacity-50 cursor-not-allowed' : 'border-transparent hover:border-primary'
                    }`}
                  >
                    <CardContent className="p-4">
                      <Link href={isLocked ? "#" : `/learn/${lesson.id}`}>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {index + 1}
                              </div>
                              <h3 className="font-medium text-foreground">{lesson.title}</h3>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-secondary' :
                              isActive ? 'bg-accent animate-pulse' :
                              isLocked ? 'bg-muted' : 'bg-muted'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : isActive ? (
                                <Play className="w-3 h-3 text-white" />
                              ) : isLocked ? (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              ) : (
                                <Play className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                          
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Progress</span>
                            <span>{lesson.progress}%</span>
                          </div>
                          <Progress 
                            value={lesson.progress} 
                            className={`h-1.5 ${
                              isCompleted ? '[&>div]:bg-secondary' :
                              isActive ? '[&>div]:bg-accent' : ''
                            }`}
                          />
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
