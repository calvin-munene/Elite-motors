import { useParams, Link } from "wouter";
import { useGetBlogPost, useListBlogPosts } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const { id } = useParams();
  
  // Try to find the post either by ID or slug if we had a generic getPost query, 
  // but for now we have getBlogPost(id) which takes a number, or we can fetch list and find by slug.
  // Assuming the router passes ID or slug, we'll try to find it from list if it's a slug, or use getBlogPost if it's a number.
  
  const isNumericId = !isNaN(Number(id));
  
  // For simplicity since the API only exposes getBlogPost(id: number), we'll fetch list and find if it's not numeric
  const { data: listData, isLoading: isListLoading } = useListBlogPosts({ published: true, limit: 100 });
  
  const post = listData?.posts.find(p => p.id.toString() === id || p.slug === id);
  const isLoading = isListLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-gray-400 mb-8">The article you are looking for does not exist or has been removed.</p>
            <Link href="/blog">
              <Button>Back to Journal</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = post.publishedAt 
    ? format(new Date(post.publishedAt), "MMMM d, yyyy")
    : format(new Date(post.createdAt), "MMMM d, yyyy");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center text-xs text-gray-500 uppercase tracking-wider hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Link>
          </div>

          <article>
            <div className="mb-10 text-center">
              <Badge className="bg-primary hover:bg-primary/90 text-white border-none rounded-sm uppercase tracking-widest text-xs font-bold px-4 py-2 mb-6">
                {post.category}
              </Badge>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="text-gray-400 uppercase tracking-widest text-sm">
                {formattedDate}
              </div>
            </div>

            {post.coverImage && (
              <div className="aspect-[21/9] w-full rounded-lg overflow-hidden mb-12 border border-white/10">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {post.excerpt && (
              <div className="text-xl text-gray-300 font-serif italic mb-10 pl-6 border-l-4 border-primary">
                {post.excerpt}
              </div>
            )}

            <div className="prose prose-invert prose-lg max-w-none text-gray-300 prose-headings:font-serif prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
          </article>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
