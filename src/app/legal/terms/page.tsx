export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-slate">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using Systimz, you agree to be bound by these Terms of
            Service and all applicable laws and regulations. If you do not agree
            with any of these terms, you are prohibited from using or accessing
            this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <div className="text-muted-foreground">
            <p className="mb-4">
              Permission is granted to temporarily use Systimz for personal or
              commercial purposes, subject to the following restrictions:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>You must not modify or copy the materials</li>
              <li>You must not use the materials for any commercial purpose without a proper license</li>
              <li>You must not attempt to reverse engineer any software contained in Systimz</li>
              <li>You must not remove any copyright or proprietary notations</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <div className="text-muted-foreground">
            <p className="mb-4">When creating an account, you agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account credentials</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Service Terms</h2>
          <div className="text-muted-foreground">
            <h3 className="text-xl font-medium mb-2">4.1 Avatar Creation</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You retain rights to avatars you create</li>
              <li>We may use avatars for service improvement</li>
              <li>Inappropriate content is prohibited</li>
              <li>We may terminate service for violations</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">4.2 Payment Terms</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Subscription fees are billed in advance</li>
              <li>Refunds are subject to our refund policy</li>
              <li>Prices may change with notice</li>
              <li>Failed payments may result in service suspension</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Disclaimer</h2>
          <p className="text-muted-foreground">
            Systimz is provided &quot;as is&quot; without any warranties, expressed
            or implied. We do not warrant that the service will be uninterrupted
            or error-free.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitations</h2>
          <p className="text-muted-foreground">
            In no event shall Systimz or its suppliers be liable for any damages
            arising out of the use or inability to use our services, even if we
            have been notified of the possibility of such damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. We will notify
            users of any material changes via email or through the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p className="text-muted-foreground">
            Questions about the Terms of Service should be sent to:{" "}
            <a href="mailto:legal@systimz.com" className="text-primary hover:underline">
              legal@systimz.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
