import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ColorProfileCard from '@/components/ColorProfileCard';
import { FilterPanel, type Filters } from '@/components/FilterPanel';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColorProfile {
  id: string;
  name: string;
  description: string | null;
  avg_rating: number | null;
  total_ratings: number;
  category: string | null;
  camera_model: string | null;
  view_count: number;
  download_count: number;
  featured: boolean;
  tags: string[] | null;
  lighting_conditions: string | null;
  user_id: string;
  profile_images: { image_url: string }[];
  profiles: { username: string } | null;
}

const Index = () => {
  const [profiles, setProfiles] = useState<ColorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    cameraModel: 'All',
    category: 'All',
    minRating: 0,
    lightingConditions: 'All',
    tags: []
  });

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
        category,
        camera_model,
        view_count,
        download_count,
        featured,
        tags,
        lighting_conditions,
        user_id,
        profile_images (image_url),
        profiles!color_profiles_user_id_fkey (username)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Search query
      const matchesSearch = !searchQuery || 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Camera model filter
      const matchesCamera = filters.cameraModel === 'All' || 
        profile.camera_model === filters.cameraModel;

      // Category filter
      const matchesCategory = filters.category === 'All' || 
        profile.category === filters.category;

      // Rating filter
      const matchesRating = !profile.avg_rating || 
        profile.avg_rating >= filters.minRating;

      // Lighting conditions filter
      const matchesLighting = filters.lightingConditions === 'All' || 
        profile.lighting_conditions === filters.lightingConditions;

      // Tags filter
      const matchesTags = filters.tags.length === 0 || 
        (profile.tags && filters.tags.some(tag => 
          profile.tags?.includes(tag)
        ));

      return matchesSearch && matchesCamera && matchesCategory && 
             matchesRating && matchesLighting && matchesTags;
    });
  }, [profiles, searchQuery, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cameraModel !== 'All') count++;
    if (filters.category !== 'All') count++;
    if (filters.minRating > 0) count++;
    if (filters.lightingConditions !== 'All') count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      cameraModel: 'All',
      category: 'All',
      minRating: 0,
      lightingConditions: 'All',
      tags: []
    });
  };

  const removeFilter = (filterType: keyof Filters, value?: string) => {
    if (filterType === 'tags' && value) {
      setFilters({
        ...filters,
        tags: filters.tags.filter(tag => tag !== value)
      });
    } else if (filterType === 'minRating') {
      setFilters({ ...filters, minRating: 0 });
    } else {
      setFilters({ ...filters, [filterType]: 'All' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="mb-12 text-center max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-display font-medium mb-6 tracking-tight">
            Color Profiles
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Curated collection of professional color profiles for OM System cameras
          </p>
          
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border text-base"
              />
            </div>
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Result Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredProfiles.length}</span> {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
          </p>
        </div>

        {/* Active Filters Display */}
        {(activeFilterCount > 0 || searchQuery) && (
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.cameraModel !== 'All' && (
                <Badge variant="secondary" className="gap-1">
                  Camera: {filters.cameraModel}
                  <button onClick={() => removeFilter('cameraModel')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.category !== 'All' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filters.category}
                  <button onClick={() => removeFilter('category')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Rating: {filters.minRating}+ stars
                  <button onClick={() => removeFilter('minRating')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.lightingConditions !== 'All' && (
                <Badge variant="secondary" className="gap-1">
                  Lighting: {filters.lightingConditions}
                  <button onClick={() => removeFilter('lightingConditions')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  Tag: {tag}
                  <button onClick={() => removeFilter('tags', tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="ml-2"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading profiles...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            {searchQuery || activeFilterCount > 0 ? 'No profiles found matching your filters' : 'No profiles available yet'}
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

export default Index;
