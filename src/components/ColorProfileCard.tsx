import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Star, Camera, Eye, Download, Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ColorProfileCardProps {
  id: string;
  name: string;
  imageUrl: string;
  averageRating: number | null;
  totalRatings: number;
  username: string;
  description: string | null;
  category: string | null;
  cameraModel: string | null;
  viewCount: number;
  downloadCount: number;
  featured: boolean;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

const ColorProfileCard = ({ 
  id, 
  name, 
  imageUrl, 
  averageRating, 
  totalRatings, 
  username, 
  description,
  category,
  cameraModel,
  viewCount,
  downloadCount,
  featured
}: ColorProfileCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({ title: 'Please sign in to bookmark profiles', variant: 'destructive' });
      return;
    }

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('profile_id', id);
      
      if (!error) {
        setIsBookmarked(false);
        toast({ title: 'Removed from bookmarks' });
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, profile_id: id });
      
      if (!error) {
        setIsBookmarked(true);
        toast({ title: 'Added to bookmarks' });
      }
    }
  };

  return (
    <Link to={`/profile/${id}`} className="group block h-full">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-card relative h-full">
        <div className="flex gap-4 p-4 h-full">
          {/* Image with overlay */}
          <div className="w-40 h-40 flex-shrink-0 overflow-hidden bg-muted rounded-md relative">
            {!imageLoaded && (
              <Skeleton className="w-full h-full absolute inset-0" />
            )}
            <img 
              src={imageUrl} 
              alt={name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3">
              <h4 className="text-white font-semibold text-center text-sm mb-2 line-clamp-2">{name}</h4>
              <button
                onClick={handleBookmark}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              >
                <Bookmark 
                  className={`h-4 w-4 ${isBookmarked ? 'fill-white' : ''}`}
                />
              </button>
            </div>

            {/* Category badge */}
            {category && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 text-xs bg-background/90 backdrop-blur-sm"
              >
                {category}
              </Badge>
            )}

            {/* Featured badge */}
            {featured && (
              <Badge 
                className="absolute top-2 left-2 text-xs bg-yellow-500/90 text-yellow-950 hover:bg-yellow-500/90 backdrop-blur-sm"
              >
                Featured
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-display text-xl mb-1 truncate">{name}</h3>
            <p className="text-sm text-muted-foreground mb-2">by {username}</p>
            
            {/* Camera model */}
            {cameraModel && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Camera className="h-3.5 w-3.5" />
                <span>{cameraModel}</span>
              </div>
            )}

            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
            )}

            {/* Bottom section with rating and stats */}
            <div className="mt-auto space-y-2">
              {/* Rating */}
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                <span className="font-medium">{averageRating ? averageRating.toFixed(1) : 'New'}</span>
                {totalRatings > 0 && (
                  <span className="text-muted-foreground text-xs">({totalRatings})</span>
                )}
              </div>

              {/* View and download counts */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{formatCount(viewCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>{formatCount(downloadCount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ColorProfileCard;
