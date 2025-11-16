import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: ''
  });
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResources(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingResource) {
      const { error } = await supabase
        .from('resources')
        .update({
          title: formData.title,
          url: formData.url,
          description: formData.description
        })
        .eq('id', editingResource.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update resource",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Resource updated successfully"
        });
        setDialogOpen(false);
        setEditingResource(null);
        resetForm();
        fetchResources();
      }
    } else {
      const { error } = await supabase
        .from('resources')
        .insert({
          title: formData.title,
          url: formData.url,
          description: formData.description
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add resource",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Resource added successfully"
        });
        setDialogOpen(false);
        resetForm();
        fetchResources();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
      fetchResources();
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      url: resource.url,
      description: resource.description || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: ''
    });
    setEditingResource(null);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <>
      <SEO 
        title="Resources - OM Color Profiles"
        description="External resources and links for DJI OM color profiles and cinematography"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">Resources</h1>
              <p className="text-muted-foreground">Helpful links and external resources for OM profiles</p>
            </div>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingResource ? 'Update' : 'Add'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading resources...</div>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No resources available yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors flex items-center gap-2"
                          >
                            {resource.title}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </CardTitle>
                        {resource.description && (
                          <CardDescription className="mt-2">{resource.description}</CardDescription>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(resource)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Resources;
