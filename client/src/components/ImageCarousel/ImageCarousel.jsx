import { useState } from 'react';
import './ImageCarousel.css';

export default function ImageCarousel({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  if (images.length === 0) {
    return (
      <div className="carousel-main-image">
        <img src="https://via.placeholder.com/500x500?text=No+Image" alt="No image available" />
      </div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="image-carousel" id="image-carousel">
      {/* Thumbnail Strip */}
      <div className="carousel-thumbnails">
        {images.map((img, index) => (
          <button
            key={img.id || index}
            className={`carousel-thumbnail ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => setSelectedIndex(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            id={`thumbnail-${index}`}
          >
            <img src={img.image_url} alt={`View ${index + 1}`} />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="carousel-main-wrapper">
        <div
          className={`carousel-main-image ${isZoomed ? 'zoomed' : ''}`}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          style={isZoomed ? {
            '--zoom-x': `${zoomPosition.x}%`,
            '--zoom-y': `${zoomPosition.y}%`,
          } : {}}
        >
          <img
            src={images[selectedIndex]?.image_url}
            alt={`Product view ${selectedIndex + 1}`}
            id="main-product-image"
          />
        </div>

        {images.length > 1 && (
          <>
            <button className="carousel-nav carousel-prev" onClick={handlePrev} aria-label="Previous image">
              ‹
            </button>
            <button className="carousel-nav carousel-next" onClick={handleNext} aria-label="Next image">
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
