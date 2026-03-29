import './StarRating.css';

export default function StarRating({ rating = 0, reviewCount = 0, size = 'md' }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3 && rating - fullStars <= 0.7;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={`star-rating star-rating-${size}`}>
      <div className="stars" title={`${rating} out of 5 stars`}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star star-full">★</span>
        ))}
        {hasHalf && <span className="star star-half">★</span>}
        {[...Array(Math.max(0, emptyStars))].map((_, i) => (
          <span key={`empty-${i}`} className="star star-empty">★</span>
        ))}
      </div>
      {reviewCount > 0 && (
        <span className="review-count">{reviewCount.toLocaleString()}</span>
      )}
    </div>
  );
}
