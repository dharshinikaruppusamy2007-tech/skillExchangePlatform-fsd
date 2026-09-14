import { useState } from 'react'
import { Star } from 'lucide-react'

// Star rating display (readOnly) or interactive 1-5 selector.
const StarRating = ({ value = 0, onChange, size = 'md', readOnly = false }) => {
  const [hover, setHover] = useState(null)

  const display = hover ?? value
  const iconClass =
    size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  if (readOnly) {
    return (
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconClass} ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(star)}
            className={`rounded p-0.5 transition ${
              filled ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'
            }`}
          >
            <Star className={`${iconClass} ${filled ? 'fill-amber-400' : 'fill-none'}`} />
          </button>
        )
      })}
    </div>
  )
}

export default StarRating