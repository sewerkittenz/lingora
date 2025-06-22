import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LANGUAGES, getLanguageByCode } from "@/data/languages";

export default function Lessons() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const { data: userLanguages = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "languages"],
    enabled: !!user?.id,
  });

  const getLanguageProgress = (languageCode: string) => {
    const userLang = userLanguages.find((ul: any) => ul.languageId === getLanguageByCode(languageCode)?.id);
    return userLang?.progressPercent || 0;
  };

  const getLanguageIcon = (code: string) => {
    switch (code) {
      case 'ja': return '日';
      case 'zh': return '中';
      case 'es': return 'Es';
      case 'ko': return '한';
      case 'ru': return 'Ру';
      case 'de': return 'De';
      case 'fr': return 'Fr';
      case 'it': return 'It';
      case 'hr': return 'Ср';
      default: return code.slice(0, 2).toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Languages" />
        
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Language</h2>
              <p className="text-muted-foreground">Select a language to start or continue your learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LANGUAGES.map((language) => {
                const progress = getLanguageProgress(language.code);
                const icon = getLanguageIcon(language.code);
                
                return (
                  <Card key={language.code} className="hover-lift cursor-pointer group">
                    <CardContent className="p-6">
                      <Link href={`/lessons/${language.code}`}>
                        <div>
                          <div className="flex items-center mb-4">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${language.gradient} text-white flex items-center justify-center text-2xl font-bold mr-4`}>
                              {icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {language.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{language.nativeName}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-muted-foreground">Levels</p>
                              <p className="font-medium text-foreground">{language.levels.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Words</p>
                              <p className="font-medium text-foreground">20,000+</p>
                            </div>
                          </div>

                          {language.writingSystem && (
                            <div className="pt-4 border-t border-border">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:text-primary/80 p-0 h-auto"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Writing System
                              </Button>
                            </div>
                          )}
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
