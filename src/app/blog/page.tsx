import Link from "next/link";
import { Button } from "@/components/ui/button";

const posts = [
  {
    title: "Introducing Systimz: The Future of Digital Avatars",
    date: "2024-01-15",
    category: "Product",
    excerpt:
      "Today, we're excited to announce the launch of Systimz, a revolutionary platform for creating and customizing AI-powered digital avatars.",
    author: "Sarah Chen",
    role: "CEO & Co-founder",
  },
  {
    title: "How AI is Transforming Digital Communication",
    date: "2024-01-10",
    category: "Technology",
    excerpt:
      "Explore how artificial intelligence is revolutionizing the way we communicate online, from personalized avatars to real-time voice synthesis.",
    author: "Dr. James Wilson",
    role: "Chief Technology Officer",
  },
  {
    title: "Best Practices for Creating Engaging Digital Avatars",
    date: "2024-01-05",
    category: "Tutorial",
    excerpt:
      "Learn the key principles and best practices for creating compelling digital avatars that resonate with your audience.",
    author: "Emily Rodriguez",
    role: "Head of Design",
  },
  {
    title: "The Rise of Virtual Influencers",
    date: "2024-01-01",
    category: "Industry",
    excerpt:
      "Discover how virtual influencers are changing the landscape of social media and digital marketing.",
    author: "Michael Chang",
    role: "Marketing Director",
  },
];

function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">
            Insights, updates, and resources from the Systimz team
          </p>
        </div>

        <div className="grid gap-8">
          {posts.map((post) => (
            <article
              key={post.title}
              className="border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{post.date}</span>
                <span>•</span>
                <span className="text-primary">{post.category}</span>
              </div>

              <h2 className="text-2xl font-semibold mb-3">
                <Link
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              <p className="text-muted-foreground mb-4">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{post.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {post.role}
                  </div>
                </div>

                <Link href="#">
                  <Button variant="outline">Read More</Button>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6">
            Want to stay updated? Subscribe to our newsletter.
          </p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
