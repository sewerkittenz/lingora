import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Languages, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ConfirmEmail() {
  const [, setLocation] = useLocation();
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { toast } = useToast();

  const confirmEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("/api/auth/confirm-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      return response;
    },
    onSuccess: () => {
      setConfirmationStatus('success');
      toast({
        title: "Email confirmed!",
        description: "Your account has been verified.",
      });
    },
    onError: (error: any) => {
      setConfirmationStatus('error');
      toast({
        variant: "destructive",
        title: "Confirmation failed",
        description: error.message || "Invalid or expired token",
      });
    },
  });

  useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      confirmEmailMutation.mutate(token);
    } else {
      setConfirmationStatus('error');
    }
  }, []);

  const getContent = () => {
    switch (confirmationStatus) {
      case 'loading':
        return {
          icon: <Loader2 className="w-8 h-8 text-white animate-spin" />,
          title: "Confirming Email",
          description: "Please wait while we verify your email address...",
          buttonText: null,
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-8 h-8 text-white" />,
          title: "Email Confirmed!",
          description: "Your email has been successfully verified. You can now access all features of Lingora.",
          buttonText: "Continue to Login",
        };
      case 'error':
        return {
          icon: <XCircle className="w-8 h-8 text-white" />,
          title: "Confirmation Failed",
          description: "The confirmation link is invalid or has expired. Please try registering again or contact support.",
          buttonText: "Back to Login",
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl flex items-center justify-center shadow-xl">
            <Languages className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Lingora
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Email verification
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              confirmationStatus === 'success' 
                ? 'bg-gradient-to-br from-green-500 to-blue-500'
                : confirmationStatus === 'error'
                ? 'bg-gradient-to-br from-red-500 to-orange-500'
                : 'bg-gradient-to-br from-blue-500 to-green-500'
            }`}>
              {content.icon}
            </div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
            <CardDescription>
              {content.description}
            </CardDescription>
          </CardHeader>
          {content.buttonText && (
            <CardContent className="text-center space-y-4">
              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                {content.buttonText}
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}