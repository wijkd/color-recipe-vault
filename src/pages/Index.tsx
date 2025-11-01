import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ColorProfileCard from '@/components/ColorProfileCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ColorProfile {
  id: string;
  name: string;
  average_rating: number | null;
  total_ratings: number;
  profile_images: { image_url: string }[];
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
        average_rating,
        total_ratings,
        profile_images (image_url)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Discover Color Profiles</h1>
          <p className="text-muted-foreground mb-6">
            Browse and download color profiles for your OM System camera
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center text-muted-foreground">
            {searchQuery ? 'No profiles found matching your search' : 'No profiles available yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => (
              <ColorProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                imageUrl={profile.profile_images[0]?.image_url || '/placeholder.svg'}
                averageRating={profile.average_rating}
                totalRatings={profile.total_ratings}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
