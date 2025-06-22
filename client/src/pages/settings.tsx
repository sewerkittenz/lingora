import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Shield, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ResetPasswordOverlay } from "@/components/overlays/reset-password-overlay";
import { ChangeEmailOverlay } from "@/components/overlays/change-email-overlay";

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const { user } = useAuth();

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (username.length <= 2) return email;
    const masked = username[0] + "*".repeat(username.length - 2) + username[username.length - 1];
    return `${masked}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Settings" />
        
        <main className="p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Account Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                    <Input 
                      id="username"
                      value={user?.username || ""}
                      className="mt-1 bg-muted"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                    <Input 
                      id="email"
                      value={maskEmail(user?.email || "")}
                      className="mt-1 bg-muted"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-5 h-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold text-foreground">Security</h2>
                </div>
                <div className="space-y-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-4 h-auto bg-muted hover:bg-muted/80"
                    onClick={() => setShowResetPassword(true)}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-foreground">Reset Password</h3>
                      <p className="text-sm text-muted-foreground">Change your account password</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-4 h-auto bg-muted hover:bg-muted/80"
                    onClick={() => setShowChangeEmail(true)}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-foreground">Change Email</h3>
                      <p className="text-sm text-muted-foreground">Update your email address</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Learning Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Daily Reminder</h3>
                      <p className="text-sm text-muted-foreground">Get notified to practice daily</p>
                    </div>
                    <Switch 
                      checked={dailyReminder}
                      onCheckedChange={setDailyReminder}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Sound Effects</h3>
                      <p className="text-sm text-muted-foreground">Play sounds for correct/incorrect answers</p>
                    </div>
                    <Switch 
                      checked={soundEffects}
                      onCheckedChange={setSoundEffects}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-destructive mr-2" />
                  <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full"
                >
                  Delete Account
                </Button>
                <p className="text-sm text-destructive/80 mt-2">
                  This action cannot be undone. All your progress will be permanently deleted.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <ResetPasswordOverlay isOpen={showResetPassword} onClose={() => setShowResetPassword(false)} />
      <ChangeEmailOverlay isOpen={showChangeEmail} onClose={() => setShowChangeEmail(false)} />
    </div>
  );
}
