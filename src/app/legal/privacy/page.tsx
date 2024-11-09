export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-slate">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground">
            At Systimz, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information
            when you use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>Name and email address</li>
            <li>Billing information</li>
            <li>Profile information</li>
            <li>Usage data</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Technical Information</h3>
          <ul className="list-disc pl-6 mb-4 text-muted-foreground">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Cookies and usage data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational security measures
            to protect your personal information. However, no method of transmission
            over the Internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-none pl-6 text-muted-foreground">
            <li>Email: privacy@systimz.com</li>
            <li>Address: 123 Privacy Street, Tech City, TC 12345</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
