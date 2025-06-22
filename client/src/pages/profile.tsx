import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Users, Package, Bell, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { FriendsOverlay } from "@/components/overlays/friends-overlay";
import { CustomizeProfileOverlay } from "@/components/overlays/customize-profile-overlay";
import { NotificationOverlay } from "@/components/overlays/notification-overlay";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "achievements"],
    enabled: !!user?.id,
  });

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const mockStats = {
    totalXP: user?.totalXp || 1250,
    streak: user?.currentStreak || 15,
    languages: 3,
    friends: 12
  };

  // Use real achievements data from API
  const userAchievementsList = (userAchievements as any[]) || [];
  const achievementsList = (achievements as any[]) || [];
  
  const combinedAchievements = userAchievementsList.map((ua: any) => {
    const achievement = achievementsList.find((a: any) => a.id === ua.achievementId);
    return achievement ? {
      ...achievement,
      progress: ua.progress,
      completed: ua.completed,
      unlockedAt: ua.unlockedAt
    } : null;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Profile" />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <Card className="mb-8 hover-lift">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                      {user ? getInitials(user.username) : "U"}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{user?.username || "Username"}</h2>
                      <p className="text-lg text-muted-foreground">{user?.nickname || "Add a nickname"}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Member since {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowCustomize(true)}>
                    Customize
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{user?.totalXp || 0}</div>
                    <div className="text-sm text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{user?.currentStreak || 0}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-sm text-muted-foreground">Languages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-sm text-muted-foreground">Friends</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Tabs */}
            <Card>
              <Tabs defaultValue="achievements" className="w-full">
                <div className="border-b border-border">
                  <TabsList className="h-auto p-0 bg-transparent">
                    <TabsTrigger 
                      value="achievements" 
                      className="px-6 py-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    >
                      Achievements
                    </TabsTrigger>
                    <TabsTrigger 
                      value="xp-history" 
                      className="px-6 py-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    >
                      XP History
                    </TabsTrigger>
                    <TabsTrigger 
                      value="friends" 
                      className="px-6 py-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      onClick={() => setFriendsOpen(true)}
                    >
                      Friends
                    </TabsTrigger>
                    <TabsTrigger 
                      value="collection" 
                      className="px-6 py-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    >
                      Collection
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="achievements" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {combinedAchievements.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No achievements unlocked yet</p>
                        <p className="text-sm">Complete lessons to earn your first achievement!</p>
                      </div>
                    ) : (
                      combinedAchievements.map((achievement: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <Trophy className="text-primary w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{achievement.name}</h3>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </div>
                          </div>
                          <Progress 
                            value={achievement.progress} 
                            className={achievement.completed ? '[&>div]:bg-secondary' : ''}
                          />
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="xp-history" className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">XP History</h3>
                    <p>Your learning progress over time will appear here.</p>
                  </div>
                </TabsContent>

                <TabsContent value="friends" className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Friends</h3>
                    <p>Connect with other learners to share your progress.</p>
                    <Button 
                      className="mt-4"
                      onClick={() => setFriendsOpen(true)}
                    >
                      Manage Friends
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="collection" className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Item Collection</h3>
                    <p>Items you've purchased from the shop will appear here.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>

      <FriendsOverlay open={friendsOpen} onOpenChange={setFriendsOpen} />
      <CustomizeProfileOverlay isOpen={showCustomize} onClose={() => setShowCustomize(false)} />
      <NotificationOverlay isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}
