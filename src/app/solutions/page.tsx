import Link from "next/link";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    title: "Content Creation",
    description:
      "Create engaging video content with AI avatars for social media, marketing, and educational purposes.",
    features: [
      "Multiple avatar styles",
      "Custom voice synthesis",
      "Script generation",
      "Multi-language support",
    ],
    cta: "Start Creating",
    href: "/auth/signup?solution=content",
  },
  {
    title: "Customer Service",
    description:
      "Deploy AI avatars as virtual customer service representatives for 24/7 support and engagement.",
    features: [
      "Real-time responses",
      "Multilingual support",
      "Custom branding",
      "Analytics dashboard",
    ],
    cta: "Explore Support",
    href: "/auth/signup?solution=support",
  },
  {
    title: "Education & Training",
    description:
      "Transform learning experiences with interactive AI avatars for education and corporate training.",
    features: [
      "Course creation tools",
      "Interactive lessons",
      "Progress tracking",
      "Assessment tools",
    ],
    cta: "Start Teaching",
    href: "/auth/signup?solution=education",
  },
];

const industries = [
  "E-commerce",
  "Education",
  "Healthcare",
  "Finance",
  "Technology",
  "Entertainment",
  "Real Estate",
  "Retail",
];

export default function SolutionsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Solutions</h1>
          <p className="text-xl text-muted-foreground">
            Discover how Systimz can transform your digital presence
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid gap-8 mb-16">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="border rounded-lg p-8 hover:border-primary transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-4">{solution.title}</h2>
              <p className="text-muted-foreground mb-6">
                {solution.description}
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Key Features</h3>
                  <ul className="space-y-2">
                    {solution.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-muted-foreground"
                      >
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
                </div>

                <div className="flex flex-col justify-center">
                  <Link href={solution.href}>
                    <Button className="w-full">{solution.cta}</Button>
                  </Link>
                  <Link href="/contact" className="mt-4">
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Industries Section */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Industries We Serve</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((industry) => (
              <div
                key={industry}
                className="border rounded-lg p-4 text-muted-foreground"
              >
                {industry}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of businesses using Systimz to create engaging digital
            experiences.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
