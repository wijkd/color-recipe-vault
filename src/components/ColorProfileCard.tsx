import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Star } from 'lucide-react';

interface ColorProfileCardProps {
  id: string;
  name: string;
  imageUrl: string;
  averageRating: number | null;
  totalRatings: number;
}

const ColorProfileCard = ({ id, name, imageUrl, averageRating, totalRatings }: ColorProfileCardProps) => {
  return (
    <Link to={`/profile/${id}`} className="group">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-card">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="font-display text-xl mb-3 truncate">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-foreground text-foreground" />
            <span className="font-medium">{averageRating ? averageRating.toFixed(1) : 'New'}</span>
            {totalRatings > 0 && <span className="opacity-60">· {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ColorProfileCard;
