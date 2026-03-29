import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import ImageCarousel from '../components/ImageCarousel/ImageCarousel';
import StarRating from '../components/StarRating/StarRating';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="product-detail-page container">
        <div className="pdp-layout">
          <div className="pdp-left">
            <div className="skeleton" style={{ aspectRatio: '1', width: '100%', maxWidth: '500px' }} />
          </div>
          <div className="pdp-center">
            <div className="skeleton" style={{ height: '28px', width: '80%', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '18px', width: '40%', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '36px', width: '30%', marginBottom: '20px' }} />
            <div className="skeleton" style={{ height: '14px', width: '100%', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '14px', width: '95%' }} />
          </div>
          <div className="pdp-right">
            <div className="skeleton" style={{ height: '200px', width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page container">
        <div className="no-results">
          <h3>Product not found</h3>
          <p>The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <div className="product-detail-page container" id="product-detail-page">
      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb">
        <a href="/">Home</a>
        <span className="breadcrumb-sep">›</span>
        {product.category_name && (
          <>
            <a href={`/?category=${product.category_slug}`}>{product.category_name}</a>
            <span className="breadcrumb-sep">›</span>
          </>
        )}
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      <div className="pdp-layout">
        {/* Left: Image Carousel */}
        <div className="pdp-left">
          <ImageCarousel images={product.images || []} />
        </div>

        {/* Center: Product Info */}
        <div className="pdp-center">
          <h1 className="pdp-title" id="product-title">{product.name}</h1>

          <div className="pdp-rating">
            <StarRating rating={parseFloat(product.rating)} reviewCount={product.review_count} size="md" />
          </div>

          <div className="pdp-divider" />

          <div className="pdp-price-section">
            {discount > 0 && (
              <div className="pdp-deal-badge">
                <span className="deal-label">Deal</span>
              </div>
            )}
            <div className="pdp-price-row">
              {discount > 0 && (
                <span className="pdp-discount">-{discount}%</span>
              )}
              <span className="pdp-price">
                <span className="pdp-price-symbol">₹</span>
                <span className="pdp-price-whole">{Math.floor(product.price).toLocaleString()}</span>
                <span className="pdp-price-decimal">{(product.price % 1).toFixed(2).slice(1)}</span>
              </span>
            </div>
            {product.original_price && product.original_price > product.price && (
              <div className="pdp-mrp">
                M.R.P.: <s>₹{parseFloat(product.original_price).toLocaleString()}</s>
              </div>
            )}
            <div className="pdp-tax-info">Inclusive of all taxes</div>
          </div>

          <div className="pdp-divider" />

          {/* Description */}
          <div className="pdp-section">
            <h3 className="pdp-section-title">About this item</h3>
            <p className="pdp-description">{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="pdp-section">
              <h3 className="pdp-section-title">Technical Details</h3>
              <div className="pdp-specs">
                {product.specifications.split(' | ').map((spec, i) => {
                  const [key, ...valueParts] = spec.split(': ');
                  const value = valueParts.join(': ');
                  return (
                    <div className="pdp-spec-row" key={i}>
                      <span className="spec-key">{key}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Buy Box */}
        <div className="pdp-right">
          <div className="pdp-buy-box" id="buy-box">
            <div className="buy-box-price">
              <span className="pdp-price-symbol">₹</span>
              <span className="pdp-price-whole">{Math.floor(product.price).toLocaleString()}</span>
              <span className="pdp-price-decimal">{(product.price % 1).toFixed(2).slice(1)}</span>
            </div>

            <div className="buy-box-delivery">
              <span className="delivery-free">FREE Delivery</span>
              <span className="delivery-date"> by Amazon</span>
            </div>

            <div className="buy-box-stock">
              {product.stock > 0 ? (
                <span className="stock-in">In Stock</span>
              ) : (
                <span className="stock-out">Currently unavailable</span>
              )}
            </div>

            {product.stock > 0 && (
              <>
                <div className="buy-box-quantity">
                  <label htmlFor="pdp-quantity">Quantity:</label>
                  <select
                    id="pdp-quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="quantity-select"
                  >
                    {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-add-to-cart"
                  onClick={handleAddToCart}
                  id="add-to-cart-btn"
                >
                  Add to Cart
                </button>

                <button
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  id="buy-now-btn"
                >
                  Buy Now
                </button>
              </>
            )}

            <div className="buy-box-meta">
              <div className="buy-box-meta-row">
                <span className="meta-label">Ships from</span>
                <span className="meta-value">Amazon</span>
              </div>
              <div className="buy-box-meta-row">
                <span className="meta-label">Sold by</span>
                <span className="meta-value" style={{ color: 'var(--amazon-link)' }}>Amazon.clone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
