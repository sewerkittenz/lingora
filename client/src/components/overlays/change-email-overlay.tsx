import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Shield, AlertCircle } from "lucide-react";

interface ChangeEmailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeEmailOverlay({ isOpen, onClose }: ChangeEmailOverlayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    newEmail: "",
  });
  const [step, setStep] = useState<'verify' | 'email' | 'sent'>('verify');

  const verifyPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      return apiRequest("/api/auth/verify-password", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
    },
    onSuccess: () => {
      setStep('email');
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Incorrect password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      return apiRequest("/api/auth/change-email", {
        method: "POST",
        body: JSON.stringify({ newEmail }),
      });
    },
    onSuccess: () => {
      setStep('sent');
      toast({
        title: "Verification Email Sent",
        description: "Check your new email address for verification instructions.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    verifyPasswordMutation.mutate(formData.password);
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your new email address.",
        variant: "destructive",
      });
      return;
    }
    changeEmailMutation.mutate(formData.newEmail);
  };

  const handleClose = () => {
    setFormData({ password: "", confirmPassword: "", newEmail: "" });
    setStep('verify');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Change Email Address
          </DialogTitle>
        </DialogHeader>
        
        {step === 'verify' && (
          <form onSubmit={handleVerifyPassword} className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  For security, please confirm your current password twice before proceeding.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Current Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your current password"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Enter your current password again"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={verifyPasswordMutation.isPending}
                className="flex-1"
              >
                {verifyPasswordMutation.isPending ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </form>
        )}

        {step === 'email' && (
          <form onSubmit={handleChangeEmail} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentEmail" className="text-sm font-medium">
                Current Email
              </Label>
              <Input
                id="currentEmail"
                value={user?.email || ""}
                className="bg-muted"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail" className="text-sm font-medium">
                New Email Address
              </Label>
              <Input
                id="newEmail"
                type="email"
                value={formData.newEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="Enter your new email address"
                className="mt-1"
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll send a verification link to this email address
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('verify')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={changeEmailMutation.isPending}
                className="flex-1"
              >
                {changeEmailMutation.isPending ? "Sending..." : "Send Verification"}
              </Button>
            </div>
          </form>
        )}

        {step === 'sent' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Verification Email Sent</h3>
            <p className="text-muted-foreground mb-4">
              We've sent a verification link to <strong>{formData.newEmail}</strong>
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Click the verification link in your email to complete the email change. Your current email will remain active until verified.
                </p>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}