import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Star, Trash2, EyeOff, Eye, ShieldAlert, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface Profile {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  download_count: number;
  avg_rating: number | null;
  featured: boolean;
  visible: boolean;
  profiles: { username: string; banned: boolean } | null;
}

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteProfile, setDeleteProfile] = useState<{ id: string; name: string } | null>(null);
  const [banUser, setBanUser] = useState<{ id: string; username: string } | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery]);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('color_profiles')
      .select('id, name, user_id, created_at, download_count, avg_rating, featured, visible, profiles!color_profiles_user_id_fkey(username, banned)')
      .order('created_at', { ascending: false });

    if (data) setProfiles(data as any);
  };

  const filterProfiles = () => {
    let filtered = profiles;

    if (searchQuery) {
      filtered = filtered.filter(profile => 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
    setCurrentPage(1);
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const { error } = await supabase
      .from('color_profiles')
      .update({ featured: !currentFeatured })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating featured status', variant: 'destructive' });
    } else {
      toast({ title: `Profile ${!currentFeatured ? 'featured' : 'unfeatured'}` });
      fetchProfiles();
    }
  };

  const handleDelete = async () => {
    if (!deleteProfile) return;

    // Delete associated images first
    const { error: imagesError } = await supabase
      .from('profile_images')
      .delete()
      .eq('profile_id', deleteProfile.id);

    if (imagesError) {
      toast({ title: 'Error deleting profile images', variant: 'destructive' });
      return;
    }

    // Delete the profile
    const { error } = await supabase
      .from('color_profiles')
      .delete()
      .eq('id', deleteProfile.id);

    if (error) {
      toast({ title: 'Error deleting profile', variant: 'destructive' });
    } else {
      toast({ title: 'Profile deleted successfully' });
      fetchProfiles();
    }

    setDeleteProfile(null);
  };

  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    const { error } = await supabase
      .from('color_profiles')
      .update({ visible: !currentVisible })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating visibility', variant: 'destructive' });
    } else {
      toast({ title: `Profile ${!currentVisible ? 'shown' : 'hidden'}` });
      fetchProfiles();
    }
  };

  const handleDismissReports = async (profileId: string) => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('profile_id', profileId);

    if (error) {
      toast({ title: 'Error dismissing reports', variant: 'destructive' });
    } else {
      // Make profile visible again
      await supabase
        .from('color_profiles')
        .update({ visible: true })
        .eq('id', profileId);
      
      toast({ title: 'Reports dismissed and profile restored' });
      fetchProfiles();
    }
  };

  const handleBanUser = async () => {
    if (!banUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({ banned: true })
      .eq('id', banUser.id);

    if (error) {
      toast({ title: 'Error banning user', variant: 'destructive' });
    } else {
      toast({ title: `User ${banUser.username} has been banned` });
      fetchProfiles();
    }

    setBanUser(null);
  };

  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by profile name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {profile.profiles?.username || 'Unknown'}
                        {profile.profiles?.banned && (
                          <Badge variant="destructive" className="text-xs">Banned</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{profile.download_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-foreground" />
                        {profile.avg_rating ? profile.avg_rating.toFixed(1) : 'New'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.visible ? (
                        <Badge variant="outline" className="text-xs">Visible</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Hidden</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={profile.featured}
                        onCheckedChange={() => handleToggleFeatured(profile.id, profile.featured)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVisibility(profile.id, profile.visible)}
                          title={profile.visible ? 'Hide profile' : 'Show profile'}
                        >
                          {profile.visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {!profile.visible && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissReports(profile.id)}
                            title="Dismiss reports and restore"
                          >
                            <ShieldAlert className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {!profile.profiles?.banned && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBanUser({ id: profile.user_id, username: profile.profiles?.username || 'Unknown' })}
                            title="Ban user"
                          >
                            <UserX className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteProfile({ id: profile.id, name: profile.name })}
                          title="Delete profile"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No profiles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProfiles.length)} of {filteredProfiles.length} profiles
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteProfile} onOpenChange={() => setDeleteProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProfile?.name}"? This action cannot be undone and will remove all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!banUser} onOpenChange={() => setBanUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban user "{banUser?.username}"? They will no longer be able to upload profiles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminProfiles;
