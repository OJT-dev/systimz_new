export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Documentation</h1>

        <div className="space-y-12">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-muted-foreground mb-4">
                Welcome to Systimz! This guide will help you get started with
                creating and customizing your AI avatars.
              </p>
              <ol className="space-y-4 list-decimal list-inside">
                <li>Create an account or sign in</li>
                <li>Choose your subscription plan</li>
                <li>Create your first avatar</li>
                <li>Customize appearance and voice</li>
                <li>Start creating content</li>
              </ol>
            </div>
          </section>

          {/* Quick Start Guide */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
            <div className="bg-muted/50 p-6 rounded-lg">
              <pre className="text-sm">
                {`# Create your first avatar
1. Click "Create Avatar" in dashboard
2. Choose a base model
3. Customize features
4. Add voice settings
5. Save and export`}
              </pre>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium mb-2">Avatar Creation</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Multiple base models</li>
                  <li>Customizable features</li>
                  <li>Real-time preview</li>
                  <li>Style presets</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Voice Synthesis</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Natural voice generation</li>
                  <li>Multiple languages</li>
                  <li>Emotion control</li>
                  <li>Custom voice training</li>
                </ul>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Our API allows you to integrate Systimz avatars directly into your
              applications.
            </p>
            <div className="bg-muted/50 p-6 rounded-lg">
              <pre className="text-sm">
                {`# Example API Request
POST /api/avatars/create
{
  "model": "base-v1",
  "customization": {
    "style": "professional",
    "voice": "en-US-1"
  }
}`}
              </pre>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Support</h2>
            <p className="text-lg text-muted-foreground">
              Need help? Contact our support team through the{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>{" "}
              or email support@systimz.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
