"use client";

import { useState } from "react";
import { Check, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PricingCards({ isDashboard = false }: { isDashboard?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = async (planKey: string) => {
    if (planKey === 'Free') return;

    setLoading(planKey);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey.toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to create order');
        setLoading(null);
        return;
      }

      if (typeof window.Razorpay === 'undefined') {
        alert('Payment system loading... please try again in a moment.');
        setLoading(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'AI Roles Workspace',
        description: `${planKey} Plan Subscription`,
        order_id: data.orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planKey.toLowerCase(),
            }),
          });

          if (verifyRes.ok) {
            alert('Payment successful! Your plan is now active.');
            window.location.reload();
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        theme: { color: '#4f46e5' },
      });
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      priceMonthly: "₹0",
      priceYearly: "₹0",
      description: "For solopreneurs testing the waters.",
      features: ["Access to 2 roles (CEO, Product)", "5 messages per day", "Standard response times", "Basic structured artifacts"],
      buttonText: isDashboard ? "Current plan" : "Start Free",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Pro",
      priceMonthly: "₹1,499",
      priceYearly: "₹1,199",
      period: "/mo",
      description: "Full access to the entire council.",
      features: ["All 5 executive roles", "Unlimited messages", "The Meeting Room access", "Priority reasoning & context", "Cross-role strategy synthesis"],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Team",
      priceMonthly: "₹3,999",
      priceYearly: "₹3,199",
      period: "/mo",
      description: "For small teams and co-founders.",
      features: ["Everything in Pro", "Up to 3 human collaborators", "Shared workspace artifacts", "Advanced Team Meeting Rooms", "Export directly to Notion/Linear"],
      buttonText: "Upgrade to Team",
      buttonVariant: "outline" as const,
      popular: false,
    }
  ];

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-zinc-200/50 dark:bg-zinc-900/50 p-1 rounded-full inline-flex items-center border border-zinc-200 dark:border-zinc-800">
          <button 
            type="button"
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              !isYearly 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`} 
            onClick={() => setIsYearly(false)}
          >
            Monthly billing
          </button>
          <button 
            type="button"
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              isYearly 
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`} 
            onClick={() => setIsYearly(true)}
          >
            Yearly billing
            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${isYearly ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>Save 20%</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col p-8 rounded-[2rem] border relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
              plan.popular
                ? "border-indigo-600 dark:border-indigo-500 shadow-xl bg-white dark:bg-zinc-950 scale-100 lg:scale-[1.02] z-10"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900"
            }`}
          >
            {plan.popular && (
              <>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-b-xl text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
                  <Zap className="h-3.5 w-3.5 fill-current" /> Most Popular
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              </>
            )}

            <div className={`mb-6 ${plan.popular ? 'pt-4' : ''}`}>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {isYearly ? plan.priceYearly : plan.priceMonthly}
                </span>
                {plan.period && <span className="text-zinc-500 font-medium">{plan.period}</span>}
              </div>
              {isYearly && plan.name !== "Free" && (
                <div className="text-sm font-medium text-green-600 dark:text-green-500 mb-2">
                  Billed ₹{plan.name === "Pro" ? "14,388" : "38,388"} yearly
                </div>
              )}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">{plan.description}</p>
            </div>

            <div className="mb-8 flex-1">
              <ul className="space-y-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <Check className={`h-5 w-5 shrink-0 ${plan.popular ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`} />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant={plan.buttonVariant}
              size="lg"
              onClick={() => handleSubscribe(plan.name)}
              disabled={(isDashboard && plan.name === "Free") || loading === plan.name}
              className={`w-full rounded-2xl h-14 font-bold text-base transition-all ${
                plan.popular
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
                  : "border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {loading === plan.name ? "Processing..." : plan.buttonText}
              {!isDashboard && plan.popular && loading !== plan.name && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            {plan.name !== "Free" && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-400">
                <ShieldCheck className="h-4 w-4" /> Secure payment via Razorpay
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
