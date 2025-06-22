import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WritingSystemOverlay } from "@/components/overlays/writing-system-overlay";
import { Eye, BookOpen, Users, Trophy, Flame, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LANGUAGES, getLanguageByCode } from "@/data/languages";
import { soundManager } from "@/lib/sounds";

export default function LessonsEnhanced() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [writingSystemOpen, setWritingSystemOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const { user } = useAuth();

  const { data: userLanguages = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "languages"],
    enabled: !!user?.id,
  });

  const getLanguageProgress = (languageCode: string) => {
    const userLang = userLanguages.find((ul: any) => ul.languageId === getLanguageByCode(languageCode)?.id);
    return userLang?.progressPercent || 0;
  };

  const getLanguageStats = (languageCode: string) => {
    const userLang = userLanguages.find((ul: any) => ul.languageId === getLanguageByCode(languageCode)?.id);
    return {
      wordsLearned: userLang?.wordsLearned || 0,
      grammarPoints: userLang?.grammarPointsLearned || 0,
      xpEarned: userLang?.xpEarned || 0,
      currentLevel: userLang?.currentLevel || 'beginner'
    };
  };

  const openWritingSystem = (languageCode: string) => {
    soundManager.play('click');
    setSelectedLanguage(languageCode);
    setWritingSystemOpen(true);
  };

  const getLanguageIcon = (code: string) => {
    const icons = {
      'ja': '日',
      'zh': '中',
      'es': 'Es',
      'ko': '한',
      'ru': 'Ру',
      'de': 'De',
      'hr': 'Ср'
    };
    return icons[code as keyof typeof icons] || code.slice(0, 2).toUpperCase();
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Language Learning" />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Master 7 World Languages
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Learn Japanese, Chinese, Korean, Russian, German, Spanish, and Serbo-Croatian with our comprehensive lesson system
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>1,400 Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Interactive Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Achievement System</span>
                </div>
              </div>
            </div>

            {/* Languages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {LANGUAGES.map((language) => {
                const progress = getLanguageProgress(language.code);
                const stats = getLanguageStats(language.code);
                const hasWritingSystem = language.writingSystem;

                return (
                  <Card 
                    key={language.code}
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/70 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${language.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                          {getLanguageIcon(language.code)}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {hasWritingSystem && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWritingSystem(language.code)}
                              className="p-2 h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Badge className={getDifficultyColor(stats.currentLevel)}>
                            {stats.currentLevel}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-bold">
                          {language.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 font-medium">
                          {language.nativeName}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {language.description}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-blue-600">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-blue-600">{stats.wordsLearned}</div>
                          <div className="text-xs text-gray-500">Words</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-purple-600">{stats.grammarPoints}</div>
                          <div className="text-xs text-gray-500">Grammar</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-orange-600">{stats.xpEarned}</div>
                          <div className="text-xs text-gray-500">XP</div>
                        </div>
                      </div>

                      {/* Levels Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Levels</span>
                          <span className="font-medium">{language.levels.length} levels</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {language.levels.slice(0, 3).map((level) => (
                            <Badge key={level} variant="outline" className="text-xs px-2 py-0.5">
                              {level.replace('jlpt-', '').replace('-', ' ')}
                            </Badge>
                          ))}
                          {language.levels.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{language.levels.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Writing System Badge */}
                      {hasWritingSystem && (
                        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Eye className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-blue-800">Writing System</div>
                            <div className="text-xs text-blue-600">{language.writingSystem}</div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Link to={`/lessons/${language.code}`}>
                        <Button 
                          className={`w-full bg-gradient-to-r ${language.gradient} hover:opacity-90 text-white font-semibold py-2 rounded-xl transition-all duration-200 group-hover:shadow-lg`}
                          onClick={() => soundManager.play('click')}
                        >
                          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-4 bg-white/70 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">{user?.currentStreak || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Day Streak</p>
              </Card>
              <Card className="text-center p-4 bg-white/70 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-600">{user?.totalXp || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Total XP</p>
              </Card>
              <Card className="text-center p-4 bg-white/70 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-600">{userLanguages.length}</span>
                </div>
                <p className="text-sm text-gray-600">Languages</p>
              </Card>
              <Card className="text-center p-4 bg-white/70 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold text-purple-600">
                    {userLanguages.reduce((sum: number, ul: any) => sum + (ul.wordsLearned || 0), 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Words Learned</p>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <WritingSystemOverlay
        isOpen={writingSystemOpen}
        onClose={() => setWritingSystemOpen(false)}
        languageCode={selectedLanguage}
        languageName={LANGUAGES.find(l => l.code === selectedLanguage)?.name || ""}
      />
    </div>
  );
}