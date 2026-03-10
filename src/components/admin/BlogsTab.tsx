import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";
import RichTextEditor from "./RichTextEditor";
import { sanitizeRichContent, sanitizeInput, stripHtml } from "@/lib/sanitize";
import { trackEvent } from "@/lib/analytics";
import { captureError, addBreadcrumb } from "@/lib/sentry";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
}

interface BlogsTabProps {
  blogs: Blog[];
  loading: boolean;
  onRefresh: () => void;
}

const BlogsTab = ({ blogs, loading, onRefresh }: BlogsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    author: "",
    category: "",
    tags: "",
    is_published: false
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      author: "",
      category: "",
      tags: "",
      is_published: false
    });
    setEditingBlog(null);
  };

  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      featured_image: blog.featured_image || "",
      author: blog.author || "",
      category: blog.category || "",
      tags: blog.tags?.join(", ") || "",
      is_published: blog.is_published ?? false
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize content before saving
    const sanitizedContent = formData.content ? sanitizeRichContent(formData.content) : null;
    const sanitizedExcerpt = formData.excerpt ? sanitizeInput(formData.excerpt) : null;
    
    const blogData = {
      title: sanitizeInput(formData.title),
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
      excerpt: sanitizedExcerpt,
      content: sanitizedContent,
      featured_image: formData.featured_image || null,
      author: formData.author ? sanitizeInput(formData.author) : null,
      category: formData.category ? sanitizeInput(formData.category) : null,
      tags: formData.tags ? formData.tags.split(",").map(t => sanitizeInput(t.trim())) : null,
      is_published: formData.is_published,
      published_at: formData.is_published ? new Date().toISOString() : null
    };

    addBreadcrumb(`Blog ${editingBlog ? "update" : "create"} started`, "admin", { title: blogData.title });

    if (editingBlog) {
      const { error } = await supabase
        .from("blogs")
        .update(blogData)
        .eq("id", editingBlog.id);

      if (error) {
        captureError(new Error(`Failed to update blog: ${error.message}`), { blogId: editingBlog.id });
        toast({ title: "Error updating blog", variant: "destructive" });
      } else {
        trackEvent("admin_blog_updated", { blog_title: blogData.title });
        toast({ title: "Blog updated successfully" });
        setIsDialogOpen(false);
        resetForm();
        onRefresh();
      }
    } else {
      const { error } = await supabase
        .from("blogs")
        .insert([blogData]);

      if (error) {
        captureError(new Error(`Failed to create blog: ${error.message}`));
        toast({ title: "Error creating blog", variant: "destructive" });
      } else {
        trackEvent("admin_blog_created", { blog_title: blogData.title });
        toast({ title: "Blog created successfully" });
        setIsDialogOpen(false);
        resetForm();
        onRefresh();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    addBreadcrumb("Blog delete initiated", "admin", { blogId: id });
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) {
      captureError(new Error(`Failed to delete blog: ${error.message}`), { blogId: id });
      toast({ title: "Error deleting blog", variant: "destructive" });
    } else {
      trackEvent("admin_blog_deleted", { blog_id: id });
      toast({ title: "Blog deleted" });
      onRefresh();
    }
  };

  const togglePublished = async (blog: Blog) => {
    const { error } = await supabase
      .from("blogs")
      .update({ 
        is_published: !blog.is_published,
        published_at: !blog.is_published ? new Date().toISOString() : null
      })
      .eq("id", blog.id);

    if (!error) {
      toast({ title: blog.is_published ? "Blog unpublished" : "Blog published" });
      onRefresh();
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{blogs.length} blog posts total</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Blog Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? "Edit Blog Post" : "Add New Blog Post"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="auto-generated if empty" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input id="author" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g., Travel Tips" />
                </div>
              </div>

              <ImageUpload 
                value={formData.featured_image} 
                onChange={(url) => setFormData({...formData, featured_image: url})} 
                label="Featured Image"
                folder="blogs"
              />

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} rows={2} placeholder="Brief description for previews" />
              </div>

              <RichTextEditor 
                value={formData.content} 
                onChange={(content) => setFormData({...formData, content})} 
                label="Content"
              />

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="e.g., safari, kenya, wildlife" />
              </div>

              <div className="flex items-center gap-2">
                <Switch id="is_published" checked={formData.is_published} onCheckedChange={(checked) => setFormData({...formData, is_published: checked})} />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button type="submit">{editingBlog ? "Update Post" : "Create Post"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {blogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {blog.featured_image && (
                      <img src={blog.featured_image} alt={blog.title} className="w-24 h-16 object-cover rounded" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{blog.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {blog.author && `By ${blog.author}`}
                        {blog.author && blog.category && " • "}
                        {blog.category}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={blog.is_published ? "default" : "secondary"}>
                          {blog.is_published ? "Published" : "Draft"}
                        </Badge>
                        {blog.tags?.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => togglePublished(blog)} title={blog.is_published ? "Unpublish" : "Publish"}>
                      {blog.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(blog)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(blog.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {blog.excerpt && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsTab;
