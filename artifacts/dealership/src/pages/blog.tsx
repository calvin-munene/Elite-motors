import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useListBlogPosts } from "@workspace/api-client-react";
import { BlogCard } from "@/components/BlogCard";
import { CTABanner } from "@/components/CTABanner";

export default function Blog() {
  const { data: blogData } = useListBlogPosts({ published: true, limit: 100 });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">Journal</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Automotive news, expert reviews, and insights from the world of luxury vehicles.
            </p>
          </div>

          {blogData?.posts && blogData.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogData.posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12 bg-card border border-white/5 rounded-lg">
              No articles published yet. Check back soon.
            </div>
          )}
        </div>
      </main>

      <CTABanner 
        title="Stay Informed"
        subtitle="Subscribe to our newsletter for the latest inventory updates and automotive news."
        buttonText="View Inventory"
        buttonHref="/inventory"
      />
      
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
