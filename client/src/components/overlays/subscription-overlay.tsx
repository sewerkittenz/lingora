import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Crown, Check, Heart, Zap, Globe, Shield, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { soundManager } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface SubscriptionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'Forever',
    color: 'bg-gray-100 border-gray-300',
    icon: <Globe className="h-6 w-6" />,
    features: [
      { text: '5 hearts per day', icon: <Heart className="h-4 w-4 text-red-500" /> },
      { text: 'Basic lessons only', icon: <Check className="h-4 w-4 text-green-500" /> },
      { text: '3 languages max', icon: <Globe className="h-4 w-4 text-blue-500" /> },
      { text: 'No streak freeze', icon: <X className="h-4 w-4 text-red-500" /> },
      { text: 'Basic progress tracking', icon: <Check className="h-4 w-4 text-green-500" /> }
    ],
    limitations: [
      'Limited daily practice',
      'Must unlock levels sequentially',
      'No advanced features'
    ]
  },
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: 10,
    period: 'per month',
    color: 'bg-blue-100 border-blue-300',
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    features: [
      { text: 'Unlimited hearts', icon: <Heart className="h-4 w-4 text-red-500" /> },
      { text: 'All lessons unlocked', icon: <Check className="h-4 w-4 text-green-500" /> },
      { text: 'All 7 languages', icon: <Globe className="h-4 w-4 text-blue-500" /> },
      { text: 'Streak freeze protection', icon: <Shield className="h-4 w-4 text-purple-500" /> },
      { text: 'Double XP rewards', icon: <Zap className="h-4 w-4 text-yellow-500" /> },
      { text: 'Advanced cheat sheets', icon: <Star className="h-4 w-4 text-orange-500" /> },
      { text: 'Priority support', icon: <Crown className="h-4 w-4 text-yellow-600" /> }
    ],
    benefits: [
      'Learn at your own pace',
      'Access advanced content',
      'Accelerated progress'
    ]
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: 50,
    period: 'per year',
    originalPrice: 120,
    discount: '58% OFF',
    color: 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300',
    icon: <Crown className="h-6 w-6" />,
    bestValue: true,
    features: [
      { text: 'Everything in Monthly', icon: <Check className="h-4 w-4 text-green-500" /> },
      { text: 'Save $70 per year', icon: <Star className="h-4 w-4 text-yellow-500" /> },
      { text: 'Exclusive yearly rewards', icon: <Crown className="h-4 w-4 text-yellow-600" /> },
      { text: 'Early access to features', icon: <Zap className="h-4 w-4 text-blue-500" /> },
      { text: 'Premium community access', icon: <Globe className="h-4 w-4 text-purple-500" /> }
    ],
    benefits: [
      'Best value for money',
      'Long-term commitment rewards',
      'Premium community features'
    ]
  }
];

export function SubscriptionOverlay({ isOpen, onClose }: SubscriptionOverlayProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Subscription failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paypalOrderId) {
        // Redirect to PayPal for payment
        window.location.href = data.paypalUrl;
      } else {
        soundManager.play('finish');
        toast({
          title: "Subscription Updated!",
          description: "Your subscription has been activated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        onClose();
      }
    },
    onError: (error: Error) => {
      soundManager.play('incorrect');
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      soundManager.play('correct');
      toast({
        title: "Already on Free Plan",
        description: "You're currently using the free plan.",
      });
      return;
    }

    if (user?.subscriptionType === planId) {
      soundManager.play('correct');
      toast({
        title: "Already Subscribed",
        description: "You already have this subscription plan.",
      });
      return;
    }

    setIsProcessing(true);
    subscribeMutation.mutate(planId);
  };

  const isCurrentPlan = (planId: string) => {
    return user?.subscriptionType === planId || 
           (planId === 'free' && (!user?.subscriptionType || user?.subscriptionType === 'free'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-600" />
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Upgrade to Premium
              </DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Current Plan Banner */}
          {user?.subscriptionType && user.subscriptionType !== 'free' && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-green-800">
                      Current Plan: {SUBSCRIPTION_PLANS.find(p => p.id === user.subscriptionType)?.name}
                    </p>
                    <p className="text-sm text-green-600">
                      You have access to all premium features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-200 hover:scale-105",
                  plan.color,
                  selectedPlan === plan.id && "ring-2 ring-blue-500",
                  isCurrentPlan(plan.id) && "ring-2 ring-green-500"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      Best Value
                    </Badge>
                  </div>
                )}
                {isCurrentPlan(plan.id) && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white px-3 py-1">
                      Current
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className={cn(
                      "p-3 rounded-full",
                      plan.id === 'free' ? "bg-gray-200" :
                      plan.id === 'monthly' ? "bg-blue-200" :
                      "bg-gradient-to-br from-purple-200 to-pink-200"
                    )}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className="text-3xl font-bold">
                        ${plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{plan.period}</p>
                    {plan.discount && (
                      <Badge variant="destructive" className="bg-red-500">
                        {plan.discount}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {feature.icon}
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Benefits/Limitations */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {plan.benefits ? 'Benefits:' : 'Limitations:'}
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {(plan.benefits || plan.limitations)?.map((item, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan(plan.id) || isProcessing}
                    className={cn(
                      "w-full mt-4 transition-all duration-200",
                      plan.id === 'free' 
                        ? "bg-gray-500 hover:bg-gray-600"
                        : plan.id === 'monthly'
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                      isCurrentPlan(plan.id) && "bg-green-600 hover:bg-green-600"
                    )}
                  >
                    {isCurrentPlan(plan.id) 
                      ? "Current Plan" 
                      : plan.id === 'free' 
                      ? "Free Forever" 
                      : isProcessing 
                      ? "Processing..." 
                      : "Upgrade Now"
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Secure Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">SSL Encrypted</span>
                </div>
                <div className="text-2xl">💳</div>
                <div className="text-2xl">🅿️</div>
                <div className="text-sm text-gray-600">PayPal Secure</div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Cancel anytime • No hidden fees • 30-day money back guarantee
                </p>
                <p className="text-xs text-gray-500">
                  Your subscription will be processed securely through PayPal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">What's included in Premium?</h4>
                <p className="text-sm text-gray-600">
                  Unlimited hearts, all languages, streak freeze, double XP, advanced lessons, and priority support.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">How do I get a refund?</h4>
                <p className="text-sm text-gray-600">
                  Contact our support team within 30 days for a full refund, no questions asked.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}