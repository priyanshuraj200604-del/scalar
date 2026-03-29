import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem/CartItem';
import './CartPage.css';

export default function CartPage() {
  const { cart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="cart-page container" id="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your Amazon Cart is empty</h2>
          <p>Your shopping cart lives to serve. Give it purpose — fill it with groceries, clothing, household supplies, electronics, and more.</p>
          <Link to="/" className="btn btn-amazon">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container" id="cart-page">
      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-main">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <span className="cart-price-label">Price</span>
          </div>

          <div className="cart-items-list">
            {cart.items.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="cart-subtotal-bottom">
            Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}): <strong>₹{parseFloat(cart.subtotal).toLocaleString()}</strong>
          </div>
        </div>

        {/* Cart Summary Sidebar */}
        <div className="cart-sidebar">
          <div className="cart-summary-box" id="cart-summary">
            <div className="cart-summary-free-delivery">
              ✓ Your order qualifies for <strong>FREE Delivery</strong>
            </div>
            <div className="cart-summary-total">
              Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}):
              <strong> ₹{parseFloat(cart.subtotal).toLocaleString()}</strong>
            </div>
            <Link to="/checkout" className="btn-add-to-cart cart-checkout-btn" id="proceed-to-checkout">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
