import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="w-full max-w-md">
        <Card className="hover-lift shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-secondary" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">Check Your Email</h1>
            <p className="text-muted-foreground mb-8">
              We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account.
            </p>

            <Link href="/login">
              <Button className="w-full py-3 transform hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
