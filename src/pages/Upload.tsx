import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const { user } = useAuth();
  const { isContributor } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState(['']);
  const [loading, setLoading] = useState(false);

  if (!user || !isContributor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">You need contributor access to upload profiles.</p>
        </div>
      </div>
    );
  }

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validUrls = imageUrls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      toast({ title: 'Please add at least one image URL', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('color_profiles')
      .insert({
        name,
        description,
        contributor_id: user.id,
      } as any)
      .select()
      .single();

    if (profileError || !profile) {
      toast({ title: 'Error creating profile', description: profileError?.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const imageInserts = validUrls.map(url => ({
      color_profile_id: (profile as any).id,
      image_url: url,
    }));

    const { error: imagesError } = await supabase
      .from('profile_images')
      .insert(imageInserts as any);

    if (imagesError) {
      toast({ title: 'Error uploading images', description: imagesError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile created successfully!' });
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Color Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fuji Classic Chrome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your color profile..."
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <Label>Image URLs</Label>
                {imageUrls.map((url, index) => (
                  <Input
                    key={index}
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                ))}
                <Button type="button" variant="outline" onClick={addImageUrlField} className="w-full">
                  Add Another Image
                </Button>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Upload;
