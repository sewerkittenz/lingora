import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

// Auth pages
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import ConfirmEmail from "@/pages/auth/confirm-email";

// Main app pages  
import Home from "@/pages/home";
import Lessons from "@/pages/lessons";
import LessonsList from "@/pages/lessons-list";
import Lesson from "@/pages/lesson";
import Learn from "@/pages/learn";
import Profile from "@/pages/profile";
import Subscriptions from "@/pages/subscriptions";
import Settings from "@/pages/settings";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/confirm-email" component={ConfirmEmail} />
      
      {/* Main app routes */}
      <Route path="/home" component={Home} />
      <Route path="/lessons" component={Lessons} />
      <Route path="/lessons/:languageCode" component={LessonsList} />
      <Route path="/learn/:lessonId?" component={Learn} />
      <Route path="/profile" component={Profile} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
