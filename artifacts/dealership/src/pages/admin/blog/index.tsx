import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListBlogPosts, useDeleteBlogPost } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Edit, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminBlog() {
  const { data: blogData, refetch } = useListBlogPosts({ limit: 100 });
  const deleteBlogPost = useDeleteBlogPost();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteBlogPost.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Article deleted" });
          refetch();
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Journal & News</h1>
          <p className="text-gray-400">Manage your dealership blog articles and news.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Article</TableHead>
              <TableHead className="text-gray-400">Category</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!blogData?.posts?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No articles found.</TableCell>
              </TableRow>
            ) : (
              blogData.posts.map((post) => (
                <TableRow key={post.id} className="border-white/5 hover:bg-white/5">
                  <TableCell>
                    <p className="font-bold text-white">{post.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{post.excerpt}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] border-white/10 uppercase">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${post.isPublished ? 'border-green-500/30 text-green-400' : 'border-gray-500/30 text-gray-400'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {post.isPublished && (
                        <Link href={`/blog/${post.slug || post.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
