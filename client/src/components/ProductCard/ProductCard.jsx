import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import StarRating from '../StarRating/StarRating';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-card-image">
          <img
            src={product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
            alt={product.name}
            loading="lazy"
          />
          {discount > 0 && (
            <span className="product-badge">-{discount}%</span>
          )}
        </div>

        <div className="product-card-info">
          <h3 className="product-card-title">{product.name}</h3>

          <StarRating rating={parseFloat(product.rating)} reviewCount={product.review_count} size="sm" />

          <div className="product-card-price">
            {discount > 0 && (
              <span className="price-discount-tag">-{discount}%</span>
            )}
            <span className="price-symbol">₹</span>
            <span className="price-whole">{Math.floor(product.price).toLocaleString()}</span>
            <span className="price-decimal">{(product.price % 1).toFixed(2).slice(1)}</span>
          </div>

          {product.original_price && product.original_price > product.price && (
            <div className="product-card-mrp">
              M.R.P.: <span className="price-strikethrough">₹{parseFloat(product.original_price).toLocaleString()}</span>
            </div>
          )}

          <div className="product-card-delivery">
            <span className="delivery-free">FREE Delivery</span> by Amazon
          </div>
        </div>
      </Link>

      <button
        className="btn-add-to-cart product-card-add-btn"
        onClick={handleAddToCart}
        disabled={loading || product.stock === 0}
        id={`add-to-cart-${product.id}`}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
}
