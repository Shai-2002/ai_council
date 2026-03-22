"use client";

import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onSubscribe } from "@/lib/placeholder";

export function PricingCards({ isDashboard = false }: { isDashboard?: boolean }) {
  const handleSubscribe = (plan: string) => {
    onSubscribe(plan);
  };

  const plans = [
    {
      name: "Free",
      price: "₹0",
      description: "For solopreneurs testing the waters.",
      features: ["Access to 2 roles (CEO, Product)", "5 messages per day", "Standard response times", "Basic structured artifacts"],
      buttonText: isDashboard ? "Current plan" : "Start Free",
      buttonVariant: "outline" as const,
      popular: false,
      onClick: () => handleSubscribe("Free"),
    },
    {
      name: "Pro",
      price: "₹1,499",
      period: "/mo",
      description: "Full access to the entire council.",
      features: ["All 5 executive roles", "Unlimited messages", "Priority reasoning & context", "Cross-role strategy synthesis"],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true,
      onClick: () => handleSubscribe("Pro"),
    },
    {
      name: "Team",
      price: "₹3,999",
      period: "/mo",
      description: "For small teams and co-founders.",
      features: ["Everything in Pro", "Up to 3 human collaborators", "Shared workspace artifacts", "Export directly to Notion/Linear"],
      buttonText: "Upgrade to Team",
      buttonVariant: "outline" as const,
      popular: false,
      onClick: () => handleSubscribe("Team"),
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <div 
          key={plan.name}
          className={`flex flex-col p-8 rounded-3xl border ${
            plan.popular 
              ? "border-indigo-600 dark:border-indigo-500 shadow-xl relative bg-white dark:bg-zinc-950" 
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
          }`}
        >
          {plan.popular && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
              <Zap className="h-3 w-3 fill-current" /> Most Popular
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">{plan.price}</span>
              {plan.period && <span className="text-zinc-500 font-medium">{plan.period}</span>}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
          </div>
          
          <div className="mb-8 flex-1">
            <ul className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex gap-3">
                  <Check className={`h-5 w-5 shrink-0 ${plan.popular ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Button 
            variant={plan.buttonVariant}
            size="lg"
            onClick={plan.onClick}
            disabled={isDashboard && plan.name === "Free"}
            className={`w-full rounded-xl h-12 ${
              plan.popular 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            {plan.buttonText}
          </Button>
        </div>
      ))}
    </div>
  );
}
