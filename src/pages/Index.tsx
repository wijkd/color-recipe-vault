import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ColorProfileCard from '@/components/ColorProfileCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ColorProfile {
  id: string;
  name: string;
  description: string | null;
  avg_rating: number | null;
  total_ratings: number;
  profile_images: { image_url: string }[];
  profiles: { username: string } | null;
}

const Index = () => {
  const [profiles, setProfiles] = useState<ColorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('color_profiles')
      .select(`
        id,
        name,
        description,
        avg_rating,
        total_ratings,
        profile_images (image_url),
        profiles!color_profiles_user_id_fkey (username)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="mb-16 text-center max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-display font-medium mb-6 tracking-tight">
            Color Profiles
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Curated collection of professional color profiles for OM System cameras
          </p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border text-base"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            {searchQuery ? 'No profiles found matching your search' : 'No profiles available yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {filteredProfiles.map((profile) => (
              <ColorProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                imageUrl={profile.profile_images[0]?.image_url || '/placeholder.svg'}
                averageRating={profile.avg_rating}
                totalRatings={profile.total_ratings}
                username={profile.profiles?.username || 'Unknown'}
                description={profile.description}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
