import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Header.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <header className="header" id="main-header">
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo" id="logo-link">
            <span className="logo-text">amazon</span>
            <span className="logo-suffix">.clone</span>
          </Link>

          {/* Delivery Address */}
          <div className="header-deliver">
            <span className="deliver-label">Deliver to</span>
            <div className="deliver-location">
              <svg width="15" height="18" viewBox="0 0 15 18" fill="none">
                <path d="M7.5 0C3.36 0 0 3.36 0 7.5C0 12.75 7.5 18 7.5 18S15 12.75 15 7.5C15 3.36 11.64 0 7.5 0ZM7.5 10.5C5.84 10.5 4.5 9.16 4.5 7.5C4.5 5.84 5.84 4.5 7.5 4.5C9.16 4.5 10.5 5.84 10.5 7.5C10.5 9.16 9.16 10.5 7.5 10.5Z" fill="white"/>
              </svg>
              <span>India</span>
            </div>
          </div>

          {/* Search Bar */}
          <form className="header-search" id="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              id="search-input"
              placeholder="Search Amazon.clone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="search-btn" id="search-button" aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#131921"/>
              </svg>
            </button>
          </form>

          {/* Right Navigation */}
          <div className="header-nav">
            <Link to="/orders" className="header-nav-item" id="nav-orders">
              <span className="nav-line-1">Returns</span>
              <span className="nav-line-2">& Orders</span>
            </Link>

            <Link to="/cart" className="header-cart" id="nav-cart">
              <div className="cart-icon-wrapper">
                <span className="cart-count" id="cart-count">{cart.itemCount}</span>
                <svg width="35" height="32" viewBox="0 0 40 35" fill="none">
                  <path d="M13.5 30C12.12 30 11.01 31.12 11.01 32.5C11.01 33.88 12.12 35 13.5 35C14.88 35 16 33.88 16 32.5C16 31.12 14.88 30 13.5 30ZM1 2.5V5H3.5L8 14.97L6.25 18.22C6.09 18.54 6 18.9 6 19.3C6 20.68 7.12 21.8 8.5 21.8H31V19.3H9.07C8.9 19.3 8.77 19.17 8.77 19L8.8 18.88L9.87 17H25.12C26.1 17 26.97 16.44 27.42 15.62L31.87 7.62C31.95 7.44 32 7.22 32 7C32 6.31 31.44 5.75 30.75 5.75H6.21L5.09 3.25H1V2.5ZM28.5 30C27.12 30 26.01 31.12 26.01 32.5C26.01 33.88 27.12 35 28.5 35C29.88 35 31 33.88 31 32.5C31 31.12 29.88 30 28.5 30Z" fill="white"/>
                </svg>
              </div>
              <span className="cart-text">Cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="header-bottom" id="nav-bar">
        <div className="header-bottom-inner">
          <Link to="/" className="nav-bottom-link">All</Link>
          <Link to="/?category=electronics" className="nav-bottom-link">Electronics</Link>
          <Link to="/?category=books" className="nav-bottom-link">Books</Link>
          <Link to="/?category=clothing" className="nav-bottom-link">Clothing</Link>
          <Link to="/?category=home-kitchen" className="nav-bottom-link">Home & Kitchen</Link>
          <Link to="/?category=sports-outdoors" className="nav-bottom-link">Sports</Link>
          <Link to="/?category=beauty" className="nav-bottom-link">Beauty</Link>
          <Link to="/orders" className="nav-bottom-link">Your Orders</Link>
        </div>
      </nav>
    </>
  );
}
