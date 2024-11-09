import Link from "next/link";
import { Button } from "@/components/ui/button";

const positions = [
  {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "We're looking for a senior full-stack developer to help build and scale our AI avatar platform.",
  },
  {
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Join our AI team to improve and innovate our avatar generation technology.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description:
      "Help shape the future of digital avatars by creating intuitive and beautiful user experiences.",
  },
  {
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description:
      "Drive user acquisition and engagement through innovative marketing strategies.",
  },
];

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-muted-foreground">
            Help us shape the future of digital communication
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Why Systimz?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Benefits</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Competitive salary and equity</li>
                <li>• Remote-first culture</li>
                <li>• Flexible working hours</li>
                <li>• Health insurance</li>
                <li>• Learning and development budget</li>
                <li>• Home office setup allowance</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Culture</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Innovation-driven environment</li>
                <li>• Collaborative team spirit</li>
                <li>• Work-life balance</li>
                <li>• Regular team events</li>
                <li>• Mentorship opportunities</li>
                <li>• Diverse and inclusive workplace</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Open Positions</h2>
          <div className="space-y-6">
            {positions.map((position) => (
              <div
                key={position.title}
                className="border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium mb-2">{position.title}</h3>
                    <div className="space-x-4 text-sm text-muted-foreground">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span>{position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <Link href="/contact">
                    <Button>Apply Now</Button>
                  </Link>
                </div>
                <p className="text-muted-foreground">{position.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Don&apos;t See Your Role?</h2>
          <p className="text-muted-foreground mb-6">
            We&apos;re always looking for talented individuals to join our team.
            Send us your resume and we&apos;ll keep you in mind for future opportunities.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Get in Touch
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
