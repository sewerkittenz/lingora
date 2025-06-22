import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getLanguageByCode } from "@/data/languages";

export default function LessonsList() {
  const { languageCode } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string>("");
  const { user } = useAuth();

  const language = getLanguageByCode(languageCode || "");

  // Load lessons for this specific language
  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/languages", languageCode, "lessons"],
    enabled: !!languageCode,
  });

  // Set default active level when language loads
  useEffect(() => {
    if (language && language.levels.length > 0 && !activeLevel) {
      setActiveLevel(language.levels[0]);
    }
  }, [language, activeLevel]);

  if (!language) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Language Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/lessons">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className={`text-6xl w-20 h-20 bg-gradient-to-br ${language.gradient} rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}>
                  {language.flag}
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{language.name}</h1>
                  <p className="text-xl text-muted-foreground">{language.nativeName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{language.description}</p>
                </div>
              </div>
              
              {language.writingSystem && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Writing System</h3>
                  <p className="text-blue-800">{language.writingSystem}</p>
                </div>
              )}
            </div>

            {/* Level Tabs */}
            <Tabs value={activeLevel} onValueChange={setActiveLevel} className="mb-8">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {language.levels.map((level) => (
                  <TabsTrigger key={level} value={level} className="capitalize">
                    {level.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TabsTrigger>
                ))}
              </TabsList>

              {language.levels.map((level) => (
                <TabsContent key={level} value={level}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons
                      .filter((lesson: any) => lesson.level === level)
                      .map((lesson: any, index: number) => (
                      <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${language.gradient} flex items-center justify-center text-white font-bold`}>
                                {lesson.id}
                              </div>
                              <div>
                                <h3 className="font-semibold">{lesson.title}</h3>
                                <p className="text-sm text-muted-foreground">{lesson.description}</p>
                              </div>
                            </div>
                            <Play className="h-6 w-6 text-primary" />
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Items</span>
                              <span>{lesson.itemCount || 10}</span>
                            </div>
                            <Progress value={0} className="h-2" />
                            
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Level: {lesson.level}</span>
                              <span>25 XP</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Link href={`/learn/${languageCode}-${lesson.id}`} className="block">
                              <Button className="w-full">
                                <Play className="h-4 w-4 mr-2" />
                                Start Lesson
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Show message if no lessons for this level */}
                    {lessons.filter((lesson: any) => lesson.level === level).length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                          Coming Soon
                        </h3>
                        <p className="text-muted-foreground">
                          Lessons for {level.replace('-', ' ')} level are being prepared.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}