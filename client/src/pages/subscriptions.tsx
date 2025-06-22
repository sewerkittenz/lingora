import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Smartphone, Wallet, Coffee } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Subscriptions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Perfect for getting started",
      features: [
        { text: "5 hearts per day", included: true },
        { text: "3 languages maximum", included: true },
        { text: "Sequential level progression", included: true },
        { text: "No streak freeze", included: false },
        { text: "Limited lesson access", included: false },
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      popular: false,
      current: user?.subscriptionType === "free",
    },
    {
      name: "Premium Monthly",
      price: "$10",
      period: "/month",
      description: "Full access for 30 days",
      features: [
        { text: "Unlimited hearts", included: true },
        { text: "All languages unlocked", included: true },
        { text: "Skip to any level", included: true },
        { text: "Streak freeze protection", included: true },
        { text: "Double XP boost", included: true },
        { text: "Exclusive cheat sheets", included: true },
      ],
      buttonText: "Upgrade Now",
      buttonVariant: "default" as const,
      popular: true,
      current: user?.subscriptionType === "premium_monthly",
    },
    {
      name: "Premium Yearly",
      price: "$50",
      period: "/year",
      description: "Best value for serious learners",
      badge: "Save 58%",
      features: [
        { text: "Everything in Monthly", included: true },
        { text: "366 days of access", included: true },
        { text: "Priority support", included: true },
        { text: "Early access to features", included: true },
      ],
      buttonText: "Choose Yearly",
      buttonVariant: "secondary" as const,
      popular: false,
      current: user?.subscriptionType === "premium_yearly",
    },
  ];

  const paymentMethods = [
    { name: "PayPal", icon: Wallet },
    { name: "GCash", icon: Smartphone },
    { name: "BlueWallet", icon: Wallet },
    { name: "Buy Me a Coffee", icon: Coffee },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Subscriptions" />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Unlock Your Learning Potential</h2>
              <p className="text-xl text-muted-foreground">Choose the plan that fits your language learning goals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`relative hover-lift ${
                    plan.popular ? 'border-2 border-primary shadow-xl scale-105' : 'border-2 border-border'
                  } ${plan.current ? 'bg-primary/5' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center mb-2">
                        <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                        {plan.current && <Crown className="w-5 h-5 text-accent ml-2" />}
                      </div>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className={`text-4xl font-bold ${plan.popular ? 'text-primary' : plan.name === 'Premium Yearly' ? 'text-secondary' : 'text-foreground'}`}>
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                      {plan.badge && (
                        <Badge variant="secondary" className="bg-secondary/20 text-secondary mb-2">
                          {plan.badge}
                        </Badge>
                      )}
                      <p className="text-muted-foreground">{plan.description}</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-secondary mr-3 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.current ? (
                      <Button 
                        variant="outline"
                        className="w-full py-3 cursor-default"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : plan.name === "Free" ? (
                      <Button 
                        variant="outline"
                        className="w-full py-3"
                        disabled
                      >
                        Free Plan
                      </Button>
                    ) : (
                      <div className="w-full">
                        <PayPalButton
                          amount={plan.price.replace('$', '')}
                          currency="USD"
                          intent="CAPTURE"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="text-center">
              <p className="text-muted-foreground mb-6">Secure payment methods</p>
              <div className="flex justify-center space-x-8">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.name} className="flex items-center space-x-2 text-muted-foreground">
                      <Icon className="w-6 h-6" />
                      <span className="text-sm">{method.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
