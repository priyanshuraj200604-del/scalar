import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCartLocal, showToast } = useCart();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    shipping_name: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_phone: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    for (const [key, value] of Object.entries(form)) {
      if (!value.trim()) {
        showToast(`Please fill in ${key.replace('shipping_', '').replace('_', ' ')}`, 'error');
        return;
      }
    }

    try {
      setPlacing(true);
      const result = await placeOrder(form);
      clearCartLocal();
      navigate(`/order-confirmation/${result.order.id}`, {
        state: { order: result.order, items: result.items },
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="checkout-page container" id="checkout-page">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add some items to proceed with checkout.</p>
          <a href="/" className="btn btn-amazon">Continue Shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container" id="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Shipping Form */}
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h2 className="checkout-section-title">
              <span className="section-number">1</span>
              Shipping Address
            </h2>

            <form onSubmit={handleSubmit} id="checkout-form">
              <div className="form-group">
                <label htmlFor="shipping_name">Full Name</label>
                <input
                  type="text"
                  id="shipping_name"
                  name="shipping_name"
                  value={form.shipping_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shipping_phone">Phone Number</label>
                <input
                  type="tel"
                  id="shipping_phone"
                  name="shipping_phone"
                  value={form.shipping_phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shipping_address">Address</label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={form.shipping_address}
                  onChange={handleChange}
                  placeholder="House/Flat No., Building, Street, Area"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shipping_city">City</label>
                  <input
                    type="text"
                    id="shipping_city"
                    name="shipping_city"
                    value={form.shipping_city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shipping_state">State</label>
                  <input
                    type="text"
                    id="shipping_state"
                    name="shipping_state"
                    value={form.shipping_state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shipping_zip">PIN Code</label>
                  <input
                    type="text"
                    id="shipping_zip"
                    name="shipping_zip"
                    value={form.shipping_zip}
                    onChange={handleChange}
                    placeholder="400001"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order Review */}
          <div className="checkout-card">
            <h2 className="checkout-section-title">
              <span className="section-number">2</span>
              Review Items
            </h2>
            <div className="checkout-items">
              {cart.items.map(item => (
                <div className="checkout-item" key={item.id}>
                  <img
                    src={item.image_url || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="checkout-item-img"
                  />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.name}</p>
                    <p className="checkout-item-price">₹{parseFloat(item.price).toLocaleString()} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-sidebar">
          <div className="checkout-summary-box" id="order-summary">
            <button
              type="submit"
              form="checkout-form"
              className="btn-add-to-cart"
              disabled={placing}
              id="place-order-btn"
            >
              {placing ? 'Placing Order...' : 'Place your order'}
            </button>

            <p className="checkout-terms">
              By placing your order, you agree to Amazon.clone's privacy notice and conditions of use.
            </p>

            <div className="checkout-divider" />

            <h3 className="checkout-summary-title">Order Summary</h3>

            <div className="summary-row">
              <span>Items ({cart.itemCount}):</span>
              <span>₹{parseFloat(cart.subtotal).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span className="summary-free">FREE</span>
            </div>

            <div className="checkout-divider" />

            <div className="summary-row summary-total">
              <span>Order Total:</span>
              <span>₹{parseFloat(cart.subtotal).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
