import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp, BookOpen, Languages, Trophy, Users, ShoppingBag, Repeat } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ShopOverlay } from "@/components/overlays/shop-overlay";
import { FriendsOverlay } from "@/components/overlays/friends-overlay";
import { TradeOverlay } from "@/components/overlays/trade-overlay";
import { Link } from "wouter";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const { user } = useAuth();

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  // Query user progress data from Supabase
  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const { data: wordsLearned } = useQuery({
    queryKey: ["/api/users", user?.id, "words-learned"],
    enabled: !!user?.id,
  });

  const { data: grammarPoints } = useQuery({
    queryKey: ["/api/users", user?.id, "grammar-points"],
    enabled: !!user?.id,
  });

  const stats = [
    {
      title: "Day Streak",
      value: user?.currentStreak || 0,
      icon: Flame,
      color: "text-red-500",
      bgColor: "bg-red-100",
      description: "Keep it up!",
    },
    {
      title: "Progress",
      value: userProgress ? `${Math.round(userProgress.overallProgress)}%` : "0%",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/20",
      description: "Overall progress",
      progressValue: userProgress ? userProgress.overallProgress : 0,
    },
    {
      title: "Words Learned",
      value: wordsLearned?.count || 0,
      icon: BookOpen,
      color: "text-secondary",
      bgColor: "bg-secondary/20",
      description: "Vocabulary mastered",
    },
    {
      title: "Grammar Points",
      value: grammarPoints?.count || 0,
      icon: Languages,
      color: "text-accent",
      bgColor: "bg-accent/20",
      description: "Rules understood",
    },
  ];

  const quickActions = [
    {
      title: "Shop",
      icon: ShoppingBag,
      color: "text-accent",
      bgColor: "bg-accent/10",
      hoverColor: "hover:bg-accent hover:text-white",
      onClick: () => setShopOpen(true),
    },
    {
      title: "Friends",
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      hoverColor: "hover:bg-secondary hover:text-white",
      onClick: () => setFriendsOpen(true),
    },
    {
      title: "Profile",
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverColor: "hover:bg-primary hover:text-white",
      onClick: () => {},
    },
    {
      title: "Trade",
      icon: Repeat,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      hoverColor: "hover:bg-purple-500 hover:text-white",
      onClick: () => setTradeOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.nickname || user?.username || "Learner"}!
              </h1>
              <p className="text-muted-foreground">Ready to continue your language learning journey?</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                      </div>
                      <h3 className="font-medium text-foreground">{stat.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                      {stat.title === "Progress" && (
                        <Progress value={stat.progressValue || 0} className="mt-2" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Word of the Day */}
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Word of the Day</h2>
                    <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">学习</h3>
                          <p className="text-indigo-200">/xué xí/</p>
                        </div>
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <Languages className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-indigo-100 mb-2">To study or learn</p>
                      <p className="text-sm text-indigo-200">Chinese • Beginner Level</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Continue Learning */}
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Continue Learning</h2>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Start your learning journey today!</p>
                      <Button asChild>
                        <Link href="/lessons">
                          Choose a Language
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Leaderboard */}
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Top Learners</h2>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 4).map((user: any, index: number) => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            index === 0 ? 'bg-accent' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-primary'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {user.username?.slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.totalXp} XP</p>
                          </div>
                          {index === 0 && (
                            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Trophy className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={action.title}
                            variant="ghost"
                            className={`flex flex-col items-center p-4 h-auto ${action.bgColor} ${action.hoverColor} transition-all duration-200 group`}
                            onClick={action.onClick}
                          >
                            <Icon className={`w-6 h-6 ${action.color} group-hover:text-white mb-2`} />
                            <span className={`text-sm font-medium ${action.color} group-hover:text-white`}>
                              {action.title}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlays */}
      <ShopOverlay open={shopOpen} onOpenChange={setShopOpen} />
      <FriendsOverlay open={friendsOpen} onOpenChange={setFriendsOpen} />
      <TradeOverlay open={tradeOpen} onOpenChange={setTradeOpen} />
    </div>
  );
}
