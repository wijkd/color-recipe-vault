import { Link } from 'react-router-dom';
import { Camera, Upload, LogOut, LogIn, Bookmark, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isContributor } = useUserRole();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    instagram_url: '',
    website_url: ''
  });

  useEffect(() => {
    if (user && dialogOpen) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('username, instagram_url, website_url')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setEditForm({
            username: data.username || '',
            instagram_url: data.instagram_url || '',
            website_url: data.website_url || ''
          });
        }
      };
      fetchProfile();
    }
  }, [user, dialogOpen]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        username: editForm.username,
        instagram_url: editForm.instagram_url,
        website_url: editForm.website_url
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setDialogOpen(false);
    }
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-3 group">
          <Camera className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
          <span className="font-display text-xl tracking-tight">OM Color Profiles</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/bookmarks">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  <span className="hidden sm:inline">Bookmarks</span>
                </Button>
              </Link>
              {isContributor && (
                <Link to="/upload">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </Link>
              )}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram URL</Label>
                      <Input
                        id="instagram"
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={editForm.instagram_url}
                        onChange={(e) => setEditForm({ ...editForm, instagram_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website URL</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={editForm.website_url}
                        onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleUpdateProfile} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
