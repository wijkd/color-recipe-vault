import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Filter, X } from 'lucide-react';
import { Badge } from './ui/badge';

export interface Filters {
  cameraModel: string;
  category: string;
  minRating: number;
  lightingConditions: string;
  tags: string[];
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const CAMERA_MODELS = [
  'All',
  'OM-1',
  'OM-5',
  'E-M1 Mark III',
  'E-M1 Mark II',
  'E-M5 Mark III',
  'E-M10 Mark IV',
  'Other'
];

const CATEGORIES = [
  'All',
  'Portrait',
  'Landscape',
  'Street',
  'Nature',
  'Sports',
  'Wildlife',
  'Architecture',
  'Macro',
  'Event'
];

const LIGHTING_CONDITIONS = [
  'All',
  'Natural Light',
  'Studio',
  'Low Light',
  'Golden Hour',
  'Blue Hour',
  'Overcast',
  'Mixed'
];

const FilterContent = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  activeFilterCount 
}: FilterPanelProps) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      onFiltersChange({
        ...filters,
        tags: [...filters.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Camera Model */}
      <div className="space-y-2">
        <Label>Camera Model</Label>
        <Select 
          value={filters.cameraModel} 
          onValueChange={(value) => onFiltersChange({ ...filters, cameraModel: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CAMERA_MODELS.map(model => (
              <SelectItem key={model} value={model}>{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select 
          value={filters.category} 
          onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Minimum Rating</Label>
          <span className="text-sm text-muted-foreground">{filters.minRating} stars</span>
        </div>
        <Slider
          value={[filters.minRating]}
          onValueChange={([value]) => onFiltersChange({ ...filters, minRating: value })}
          min={0}
          max={5}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Lighting Conditions */}
      <div className="space-y-2">
        <Label>Lighting Conditions</Label>
        <Select 
          value={filters.lightingConditions} 
          onValueChange={(value) => onFiltersChange({ ...filters, lightingConditions: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIGHTING_CONDITIONS.map(condition => (
              <SelectItem key={condition} value={condition}>{condition}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button onClick={handleAddTag} size="sm">Add</Button>
        </div>
        {filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const FilterPanel = (props: FilterPanelProps) => {
  return (
    <>
      {/* Desktop: Inline Filters */}
      <div className="hidden lg:block">
        <FilterContent {...props} />
      </div>

      {/* Mobile: Sheet Drawer */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <Filter className="h-4 w-4" />
              Filters
              {props.activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {props.activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Profiles</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
