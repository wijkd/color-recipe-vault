import { useState, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';

const UploadForm = ({ user }: { user: User }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cameraModel, setCameraModel] = useState('');
    const [lensModel, setLensModel] = useState('');
    const [category, setCategory] = useState('');
    const [lightingConditions, setLightingConditions] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = useCallback((files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      setImageFiles(prev => [...prev, ...fileArray]);

      // Generate previews
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    }, [handleFiles]);

    const removeImage = (index: number) => {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        if (!tags.includes(tagInput.trim())) {
          setTags([...tags, tagInput.trim()]);
        }
        setTagInput('');
      }
    };

    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
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
          camera_model: cameraModel || null,
          lens_model: lensModel || null,
          category: category || null,
          lighting_conditions: lightingConditions || null,
          tags: tags.length > 0 ? tags : null,
        })
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
        profile_id: profile.id,
        image_url: url,
      }));

      const { error: imagesError } = await supabase
        .from('profile_images')
        .insert(imageInserts);

      if (imagesError) {
        toast({ title: 'Error saving image records', description: imagesError.message, variant: 'destructive' });
      } else {
        toast({ title: 'Profile created successfully!' });
        navigate('/');
      }

      setLoading(false);
    };

    return (
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload Color Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Profile Name *</Label>
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
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Portrait">Portrait</SelectItem>
                        <SelectItem value="Landscape">Landscape</SelectItem>
                        <SelectItem value="Street">Street</SelectItem>
                        <SelectItem value="Nature">Nature</SelectItem>
                        <SelectItem value="Film Emulation">Film Emulation</SelectItem>
                        <SelectItem value="Black & White">Black & White</SelectItem>
                        <SelectItem value="Vintage">Vintage</SelectItem>
                        <SelectItem value="Modern">Modern</SelectItem>
                        <SelectItem value="Cinematic">Cinematic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Technical Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Technical Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="camera">Camera Model</Label>
                      <Select value={cameraModel} onValueChange={setCameraModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OM-1">OM-1</SelectItem>
                          <SelectItem value="OM-5">OM-5</SelectItem>
                          <SelectItem value="E-M1 Mark III">E-M1 Mark III</SelectItem>
                          <SelectItem value="E-M5 Mark III">E-M5 Mark III</SelectItem>
                          <SelectItem value="E-M10 Mark IV">E-M10 Mark IV</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lens">Lens Model</Label>
                      <Input
                        id="lens"
                        value={lensModel}
                        onChange={(e) => setLensModel(e.target.value)}
                        placeholder="e.g., M.Zuiko 25mm f/1.8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lighting">Lighting Conditions</Label>
                    <Select value={lightingConditions} onValueChange={setLightingConditions}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lighting conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daylight">Daylight</SelectItem>
                        <SelectItem value="Golden Hour">Golden Hour</SelectItem>
                        <SelectItem value="Blue Hour">Blue Hour</SelectItem>
                        <SelectItem value="Overcast">Overcast</SelectItem>
                        <SelectItem value="Indoor">Indoor</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                        <SelectItem value="Low Light">Low Light</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type a tag and press Enter"
                    />
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Images *</h3>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        Drag and drop images here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse
                      </p>
                      <Button type="button" variant="secondary" size="sm">
                        Select Images
                      </Button>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={loading || !category} className="w-full" size="lg">
                  {loading ? 'Creating Profile...' : 'Create Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
    );
  };

const Upload = () => {
    const { user, loading: authLoading } = useAuth();
    const { isContributor, loading: roleLoading } = useUserRole();

    const isLoading = authLoading || roleLoading;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        {isLoading ? (
          <div className="container mx-auto px-4 py-8 text-center">
            <p>Loading...</p>
          </div>
        ) : !user || !isContributor ? (
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-muted-foreground">You need contributor access to upload profiles.</p>
          </div>
        ) : (
          <UploadForm user={user} />
        )}
      </div>
    );
  };

  export default Upload;
