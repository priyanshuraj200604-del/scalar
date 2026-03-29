import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import './HomePage.css';

const HERO_SLIDES = [
  {
    bg: 'linear-gradient(135deg, #232f3e 0%, #37475a 100%)',
    title: 'Spring Sale is Live',
    subtitle: 'Up to 70% off on Electronics, Fashion & more',
    cta: 'Shop Now',
    accent: '#ff9900',
  },
  {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    title: 'New Arrivals',
    subtitle: 'Discover the latest in Tech & Gadgets',
    cta: 'Explore',
    accent: '#00d2ff',
  },
  {
    bg: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
    title: 'Books & Bestsellers',
    subtitle: 'Feed your mind with top-rated reads',
    cta: 'Browse Books',
    accent: '#f0c14b',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;

        const [productsData, categoriesData] = await Promise.all([
          getProducts(params),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, category]);

  // Auto-rotate hero
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeSlide = HERO_SLIDES[heroIndex];

  return (
    <div className="home-page" id="home-page">
      {/* Hero Banner */}
      {!search && !category && (
        <section className="hero-section" id="hero-section">
          <div className="hero-banner" style={{ background: activeSlide.bg }}>
            <div className="hero-content">
              <h1 className="hero-title" style={{ color: activeSlide.accent }}>
                {activeSlide.title}
              </h1>
              <p className="hero-subtitle">{activeSlide.subtitle}</p>
              <Link to="/?category=electronics" className="hero-cta" style={{ background: activeSlide.accent }}>
                {activeSlide.cta}
              </Link>
            </div>
            <div className="hero-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === heroIndex ? 'active' : ''}`}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Category Cards */}
          <div className="category-cards container">
            {categories.map(cat => (
              <Link
                to={`/?category=${cat.slug}`}
                key={cat.id}
                className="category-card"
                id={`category-${cat.slug}`}
              >
                <h3 className="category-card-title">{cat.name}</h3>
                <div className="category-card-image">
                  <img src={cat.image_url} alt={cat.name} loading="lazy" />
                </div>
                <span className="category-card-link">See more</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search Results Header */}
      {(search || category) && (
        <div className="search-results-header container">
          <div className="search-results-info">
            {search && (
              <p className="results-count">
                {loading ? 'Searching...' : `${products.length} results for "${search}"`}
              </p>
            )}
            {category && (
              <p className="results-count">
                Category: <strong>{categories.find(c => c.slug === category)?.name || category}</strong>
              </p>
            )}
          </div>
          <Link to="/" className="clear-filters">Clear filters ✕</Link>
        </div>
      )}

      {/* Products Grid */}
      <section className="products-section container" id="products-section">
        <div className="products-header">
          <h2 className="products-title">
            {search ? 'Search Results' : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'Popular Products'}
          </h2>
        </div>

        {loading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-card-skeleton">
                <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
                <div style={{ padding: '12px' }}>
                  <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '24px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or browse our categories.</p>
            <Link to="/" className="btn btn-amazon">Browse All Products</Link>
          </div>
        ) : (
          <div className="products-grid" id="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
