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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (imageFiles.length === 0) {
      toast({ title: 'Please select at least one image', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Create the profile first
    const { data: profile, error: profileError } = await supabase
      .from('color_profiles')
      .insert({
        name,
        description,
        user_id: user.id,
      } as any)
      .select()
      .single();

    if (profileError || !profile) {
      toast({ title: 'Error creating profile', description: profileError?.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Upload images to storage and collect URLs
    const uploadedUrls: string[] = [];
    
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${profile.id}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) {
        toast({ title: 'Error uploading image', description: uploadError.message, variant: 'destructive' });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }

    if (uploadedUrls.length === 0) {
      toast({ title: 'No images were uploaded successfully', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Insert image records
    const imageInserts = uploadedUrls.map(url => ({
      profile_id: (profile as any).id,
      image_url: url,
    }));

    const { error: imagesError } = await supabase
      .from('profile_images')
      .insert(imageInserts as any);

    if (imagesError) {
      toast({ title: 'Error saving image records', description: imagesError.message, variant: 'destructive' });
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

              <div className="space-y-2">
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  required
                />
                {imageFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {imageFiles.length} file(s) selected
                  </p>
                )}
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
