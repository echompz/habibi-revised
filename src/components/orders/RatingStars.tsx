'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons'

interface RatingStarsProps {
  rating: number
  editable?: boolean
  onChange?: (rating: number) => void
}

export default function RatingStars({ rating, editable = false, onChange }: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleMouseEnter = (star: number) => {
    if (editable) {
      setHoverRating(star)
    }
  }

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0)
    }
  }

  const handleClick = (star: number) => {
    if (editable && onChange) {
      onChange(star)
    }
  }
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star}
          className={`cursor-${editable ? 'pointer' : 'default'} text-2xl`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
        >
          <FontAwesomeIcon 
            icon={star <= (hoverRating || rating) ? solidStar : regularStar} 
            className="text-yellow-500"
          />
        </span>
      ))}
    </div>
  )
}