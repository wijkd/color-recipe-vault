import { useState, useCallback, useEffect } from 'react';
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
import { X, Upload as UploadIcon, Image as ImageIcon, Plus } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;
const ACCEPTED_FILE_TYPE = 'image/jpeg';

interface FileWithPreview {
  file: File;
  preview: string;
  size: string;
}

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
    const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // Camera/Lens model management
    const [cameraModels, setCameraModels] = useState<string[]>([]);
    const [lensModels, setLensModels] = useState<string[]>([]);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [lensOpen, setLensOpen] = useState(false);
    const [newCameraDialog, setNewCameraDialog] = useState(false);
    const [newLensDialog, setNewLensDialog] = useState(false);
    const [newCameraInput, setNewCameraInput] = useState('');
    const [newLensInput, setNewLensInput] = useState('');

    useEffect(() => {
      fetchCameraModels();
      fetchLensModels();
    }, []);

    const fetchCameraModels = async () => {
      const { data } = await supabase
        .from('camera_models')
        .select('name')
        .order('name');
      if (data) {
        setCameraModels(data.map(m => m.name));
      }
    };

    const fetchLensModels = async () => {
      const { data } = await supabase
        .from('lens_models')
        .select('name')
        .order('name');
      if (data) {
        setLensModels(data.map(m => m.name));
      }
    };

    const handleAddNewCamera = async () => {
      if (!newCameraInput.trim()) return;
      
      const { error } = await supabase
        .from('camera_models')
        .insert({ name: newCameraInput.trim(), created_by: user.id });
      
      if (error) {
        toast({ title: 'Error adding camera model', description: error.message, variant: 'destructive' });
      } else {
        setCameraModel(newCameraInput.trim());
        await fetchCameraModels();
        setNewCameraDialog(false);
        setNewCameraInput('');
        toast({ title: 'Camera model added successfully!' });
      }
    };

    const handleAddNewLens = async () => {
      if (!newLensInput.trim()) return;
      
      const { error } = await supabase
        .from('lens_models')
        .insert({ name: newLensInput.trim(), created_by: user.id });
      
      if (error) {
        toast({ title: 'Error adding lens model', description: error.message, variant: 'destructive' });
      } else {
        setLensModel(newLensInput.trim());
        await fetchLensModels();
        setNewLensDialog(false);
        setNewLensInput('');
        toast({ title: 'Lens model added successfully!' });
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
      // Check file type
      if (file.type !== ACCEPTED_FILE_TYPE) {
        return { valid: false, error: 'Invalid file type. Please upload a JPEG file.' };
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'File too large. Maximum size is 10MB.' };
      }

      // Validate it's an actual image
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = URL.createObjectURL(file);
        });
      } catch {
        return { valid: false, error: 'Invalid image file. Please upload a valid JPEG.' };
      }

      return { valid: true };
    };

    const handleFiles = useCallback(async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      
      // Check max files limit
      if (filesWithPreviews.length + fileArray.length > MAX_FILES) {
        toast({
          title: 'Too many files',
          description: `Maximum ${MAX_FILES} images per profile`,
          variant: 'destructive',
        });
        return;
      }

      // Validate and process each file
      for (const file of fileArray) {
        const validation = await validateFile(file);
        
        if (!validation.valid) {
          toast({
            title: 'Validation Error',
            description: validation.error,
            variant: 'destructive',
          });
          continue;
        }

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilesWithPreviews(prev => [...prev, {
            file,
            preview: reader.result as string,
            size: formatFileSize(file.size),
          }]);
        };
        reader.readAsDataURL(file);
      }
    }, [filesWithPreviews, toast]);

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
      setFilesWithPreviews(prev => prev.filter((_, i) => i !== index));
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
      setUploadProgress(0);

      if (filesWithPreviews.length === 0) {
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
      const totalFiles = filesWithPreviews.length;
      
      for (let i = 0; i < filesWithPreviews.length; i++) {
        const { file } = filesWithPreviews[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${profile.id}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
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
        
        // Update progress
        const progress = Math.round(((i + 1) / totalFiles) * 100);
        setUploadProgress(progress);
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
      setUploadProgress(0);
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
                      <Label>Camera Model</Label>
                      <div className="flex gap-2">
                        <Popover open={cameraOpen} onOpenChange={setCameraOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={cameraOpen}
                              className="w-full justify-between"
                            >
                              {cameraModel || "Select camera..."}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search camera..." />
                              <CommandEmpty>No camera found.</CommandEmpty>
                              <CommandGroup>
                                {cameraModels.map((model) => (
                                  <CommandItem
                                    key={model}
                                    value={model}
                                    onSelect={(value) => {
                                      setCameraModel(value);
                                      setCameraOpen(false);
                                    }}
                                  >
                                    {model}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Dialog open={newCameraDialog} onOpenChange={setNewCameraDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Camera Model</DialogTitle>
                            </DialogHeader>
                            <Input
                              placeholder="Enter camera model name"
                              value={newCameraInput}
                              onChange={(e) => setNewCameraInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddNewCamera()}
                            />
                            <DialogFooter>
                              <Button onClick={handleAddNewCamera}>Add Camera</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Lens Model</Label>
                      <div className="flex gap-2">
                        <Popover open={lensOpen} onOpenChange={setLensOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={lensOpen}
                              className="w-full justify-between"
                            >
                              {lensModel || "Select lens..."}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search lens..." />
                              <CommandEmpty>No lens found.</CommandEmpty>
                              <CommandGroup>
                                {lensModels.map((model) => (
                                  <CommandItem
                                    key={model}
                                    value={model}
                                    onSelect={(value) => {
                                      setLensModel(value);
                                      setLensOpen(false);
                                    }}
                                  >
                                    {model}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Dialog open={newLensDialog} onOpenChange={setNewLensDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Lens Model</DialogTitle>
                            </DialogHeader>
                            <Input
                              placeholder="Enter lens model name"
                              value={newLensInput}
                              onChange={(e) => setNewLensInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddNewLens()}
                            />
                            <DialogFooter>
                              <Button onClick={handleAddNewLens}>Add Lens</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Images *</h3>
                    <p className="text-sm text-muted-foreground">
                      {filesWithPreviews.length} / {MAX_FILES} files
                    </p>
                  </div>

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
                      accept={ACCEPTED_FILE_TYPE}
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        Drag and drop JPEG images here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse • Max 10MB per file • Max {MAX_FILES} files
                      </p>
                      <Button type="button" variant="secondary" size="sm">
                        Select Images
                      </Button>
                    </label>
                  </div>

                  {filesWithPreviews.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filesWithPreviews.map((item, index) => (
                        <div key={index} className="relative group border border-border rounded-lg overflow-hidden">
                          <div className="flex gap-3 p-3">
                            <img
                              src={item.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-24 h-24 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.file.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.size}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="self-start bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {loading && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
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
    const [banned, setBanned] = useState(false);
    const [banCheckLoading, setBanCheckLoading] = useState(true);

    useEffect(() => {
      const checkBanStatus = async () => {
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('banned')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setBanned(data.banned);
          }
        }
        setBanCheckLoading(false);
      };
      
      checkBanStatus();
    }, [user]);

    if (authLoading || roleLoading || banCheckLoading) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8 text-center">
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    if (banned) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Account Restricted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your account has been restricted. Contact support at support@omprofiles.com for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

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

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <UploadForm user={user} />
      </div>
    );
  };

  export default Upload;
