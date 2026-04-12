import { BlogPost } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = post.publishedAt 
    ? format(new Date(post.publishedAt), "MMMM d, yyyy")
    : format(new Date(post.createdAt), "MMMM d, yyyy");

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary/50">
      <Link href={`/blog/${post.slug || post.id}`}>
        <div className="cursor-pointer">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={post.coverImage || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary hover:bg-primary/90 text-white border-none rounded-sm uppercase tracking-widest text-[10px] font-bold px-3 py-1">
                {post.category}
              </Badge>
            </div>
          </div>
          <div className="p-6">
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">{formattedDate}</div>
            <h3 className="font-serif text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-3 mb-4">
              {post.excerpt || post.content.substring(0, 150) + "..."}
            </p>
            <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center">
              Read Article
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
