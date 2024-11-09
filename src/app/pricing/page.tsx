import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$9",
    description: "Perfect for individuals and content creators",
    features: [
      "1 AI Avatar",
      "Basic customization",
      "720p video export",
      "5 minutes of voice synthesis per month",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/auth/signup?plan=starter",
  },
  {
    name: "Professional",
    price: "$29",
    description: "Ideal for professionals and small businesses",
    features: [
      "3 AI Avatars",
      "Advanced customization",
      "1080p video export",
      "30 minutes of voice synthesis per month",
      "Priority support",
      "Custom backgrounds",
      "Remove watermark",
    ],
    cta: "Get Started",
    href: "/auth/signup?plan=professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with specific needs",
    features: [
      "Unlimited AI Avatars",
      "Full customization suite",
      "4K video export",
      "Unlimited voice synthesis",
      "24/7 dedicated support",
      "Custom API access",
      "White-label solution",
      "Custom integration",
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-lg border p-8 ${
              plan.popular
                ? "border-primary shadow-lg scale-105"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={plan.href}>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <p className="text-sm text-muted-foreground">
          Need a custom solution?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact our sales team
          </Link>
        </p>
      </div>
    </div>
  );
}
