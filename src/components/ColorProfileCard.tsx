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
    <Link to={`/profile/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 truncate">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span>{averageRating ? averageRating.toFixed(1) : 'No ratings'}</span>
            {totalRatings > 0 && <span>({totalRatings})</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ColorProfileCard;
