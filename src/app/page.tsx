"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Create Stunning AI Avatars
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your brand with lifelike digital avatars powered by
            cutting-edge AI technology.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Systimz?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Easy to Use</h3>
              <p className="text-muted-foreground">
                Create professional avatars in minutes with our intuitive interface.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Customizable</h3>
              <p className="text-muted-foreground">
                Personalize every aspect of your avatar to match your brand.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">High Quality</h3>
              <p className="text-muted-foreground">
                Get stunning, lifelike results powered by advanced AI technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Brand?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Systimz to create engaging digital
            experiences.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Start Creating Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
