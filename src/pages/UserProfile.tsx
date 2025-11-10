import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import Header from '@/components/Header';
import ColorProfileCard from '@/components/ColorProfileCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Instagram, Globe, Calendar, Image, Download, Star } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  created_at: string;
}

interface ColorProfile {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  camera_model: string | null;
  avg_rating: number | null;
  total_ratings: number;
  view_count: number;
  download_count: number;
  featured: boolean;
  user_id: string;
  profile_images: { image_url: string }[];
  profiles?: { username: string } | null;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { bookmarkedIds } = useBookmarks();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userProfiles, setUserProfiles] = useState<ColorProfile[]>([]);
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<ColorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalDownloads: 0,
    avgRating: 0
  });

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserColorProfiles();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && bookmarkedIds.size > 0) {
      fetchBookmarkedProfiles();
    }
  }, [userId, bookmarkedIds]);

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchUserColorProfiles = async () => {
    const { data, error } = await supabase
      .from('color_profiles')
      .select(`
        *,
        profile_images(image_url),
        profiles!color_profiles_user_id_fkey(username)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setUserProfiles(data);
      
      // Calculate stats
      const totalDownloads = data.reduce((sum, p) => sum + p.download_count, 0);
      const avgRating = data.length > 0 
        ? data.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / data.length 
        : 0;
      
      setStats({
        totalProfiles: data.length,
        totalDownloads,
        avgRating
      });
    }
  };

  const fetchBookmarkedProfiles = async () => {
    if (bookmarkedIds.size === 0) return;

    const { data, error } = await supabase
      .from('color_profiles')
      .select(`
        *,
        profiles(username),
        profile_images(image_url)
      `)
      .in('id', Array.from(bookmarkedIds))
      .order('created_at', { ascending: false });

    if (data && !error) {
      setBookmarkedProfiles(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">User not found</div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;
  const showBookmarks = isOwnProfile;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar */}
              <Avatar className="h-24 w-24 text-3xl">
                <AvatarFallback>
                  {profile.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-display font-bold mb-2">
                  {profile.username || 'Anonymous User'}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  
                  {profile.instagram_url && (
                    <a 
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </a>
                  )}
                  
                  {profile.website_url && (
                    <a 
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                  <div>
                    <div className="flex items-center gap-2 text-2xl font-bold">
                      <Image className="h-5 w-5 text-primary" />
                      {stats.totalProfiles}
                    </div>
                    <div className="text-xs text-muted-foreground">Profiles</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-2xl font-bold">
                      <Download className="h-5 w-5 text-primary" />
                      {stats.totalDownloads.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-2xl font-bold">
                      <Star className="h-5 w-5 text-primary" />
                      {stats.avgRating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profiles" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            {showBookmarks && <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>}
          </TabsList>

          <TabsContent value="profiles">
            {userProfiles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No profiles yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile ? "You haven't uploaded any color profiles yet" : "This user hasn't uploaded any profiles yet"}
                  </p>
                  {isOwnProfile && (
                    <Button asChild>
                      <Link to="/upload">Upload Your First Profile</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProfiles.map((profile) => (
                  <ColorProfileCard
                    key={profile.id}
                    id={profile.id}
                    name={profile.name}
                    imageUrl={profile.profile_images[0]?.image_url || ''}
                    averageRating={profile.avg_rating}
                    totalRatings={profile.total_ratings}
                    username={profile.profiles?.username || 'Anonymous'}
                    userId={profile.user_id}
                    description={profile.description}
                    category={profile.category}
                    cameraModel={profile.camera_model}
                    viewCount={profile.view_count}
                    downloadCount={profile.download_count}
                    featured={profile.featured}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {showBookmarks && (
            <TabsContent value="bookmarks">
              {bookmarkedProfiles.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start bookmarking profiles to see them here
                    </p>
                    <Button asChild>
                      <Link to="/">Browse Profiles</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedProfiles.map((profile) => (
                    <ColorProfileCard
                      key={profile.id}
                      id={profile.id}
                      name={profile.name}
                      imageUrl={profile.profile_images[0]?.image_url || ''}
                      averageRating={profile.avg_rating}
                      totalRatings={profile.total_ratings}
                      username={profile.profiles?.username || 'Anonymous'}
                      userId={profile.user_id}
                      description={profile.description}
                      category={profile.category}
                      cameraModel={profile.camera_model}
                      viewCount={profile.view_count}
                      downloadCount={profile.download_count}
                      featured={profile.featured}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
