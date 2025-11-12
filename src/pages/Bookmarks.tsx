import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import Header from '@/components/Header';
import ColorProfileCard from '@/components/ColorProfileCard';
import ProfileCardSkeleton from '@/components/ProfileCardSkeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';

interface ColorProfile {
  id: string;
  name: string;
  description: string | null;
  avg_rating: number;
  total_ratings: number;
  category: string | null;
  camera_model: string | null;
  view_count: number;
  download_count: number;
  featured: boolean;
  user_id: string;
  profile_images: { image_url: string }[];
  profiles: { username: string };
}

const Bookmarks = () => {
  const { user } = useAuth();
  const { bookmarkedIds, loading: bookmarksLoading } = useBookmarks();
  const [profiles, setProfiles] = useState<ColorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookmarksLoading && user) {
      fetchBookmarkedProfiles();
    } else if (!user) {
      setLoading(false);
    }
  }, [bookmarkedIds, user, bookmarksLoading]);

  const fetchBookmarkedProfiles = async () => {
    if (bookmarkedIds.size === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('color_profiles')
      .select(`
        id,
        name,
        description,
        avg_rating,
        total_ratings,
        category,
        camera_model,
        view_count,
        download_count,
        featured,
        user_id,
        profile_images(image_url),
        profiles!color_profiles_user_id_fkey(username)
      `)
      .in('id', Array.from(bookmarkedIds))
      .order('created_at', { ascending: false });

    if (data) {
      setProfiles(data as any);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-16 text-center">
          <Bookmark className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-4xl font-display font-medium mb-4">My Bookmarks</h1>
          <p className="text-muted-foreground mb-8">Sign in to view your bookmarked profiles</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-16 max-w-7xl">
          <h1 className="text-6xl font-display font-medium mb-12 text-center">My Bookmarks</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProfileCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-medium mb-4 tracking-tight">My Bookmarks</h1>
          <p className="text-muted-foreground text-lg">
            {profiles.length === 0 
              ? 'You haven\'t bookmarked any profiles yet' 
              : `${profiles.length} saved ${profiles.length === 1 ? 'profile' : 'profiles'}`
            }
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <p className="text-muted-foreground mb-8">Start exploring and bookmark your favorite color profiles</p>
            <Link to="/">
              <Button>Browse Profiles</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {profiles.map((profile) => (
              <ColorProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                imageUrl={profile.profile_images[0]?.image_url || ''}
                averageRating={profile.avg_rating}
                totalRatings={profile.total_ratings}
                username={profile.profiles?.username || 'Unknown'}
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
      </main>
    </div>
  );
};

export default Bookmarks;
