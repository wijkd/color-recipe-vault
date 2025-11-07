import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Star } from 'lucide-react';

interface ColorProfileCardProps {
  id: string;
  name: string;
  imageUrl: string;
  averageRating: number | null;
  totalRatings: number;
  username: string;
  description: string | null;
}

const ColorProfileCard = ({ id, name, imageUrl, averageRating, totalRatings, username, description }: ColorProfileCardProps) => {
  return (
    <Link to={`/profile/${id}`} className="group">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-card">
        <div className="flex gap-4 p-4">
          <div className="w-32 h-32 flex-shrink-0 overflow-hidden bg-muted rounded-md">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl mb-1 truncate">{name}</h3>
            <p className="text-sm text-muted-foreground mb-2">by {username}</p>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-foreground text-foreground" />
              <span className="font-medium">{averageRating ? averageRating.toFixed(1) : 'New'}</span>
              {totalRatings > 0 && <span className="opacity-60">· {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</span>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ColorProfileCard;
