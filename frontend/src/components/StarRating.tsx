import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  interactive = false,
  onRatingChange,
  size = 'md'
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6'
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const isFilled = value <= rating;
        const isPartial = value - 0.5 === rating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(value)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled ? 'fill-yellow-500 text-yellow-500' : 
                isPartial ? 'fill-yellow-500/50 text-yellow-500' :
                'fill-none text-gray-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}