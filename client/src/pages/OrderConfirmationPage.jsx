import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getOrder } from '../services/api';
import './OrderConfirmationPage.css';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [items, setItems] = useState(location.state?.items || []);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!location.state) {
      const fetchOrder = async () => {
        try {
          const data = await getOrder(id);
          setOrder(data);
          setItems(data.items || []);
        } catch (err) {
          console.error('Failed to fetch order:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
    window.scrollTo(0, 0);
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="order-confirm-page container">
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirm-page container">
        <div className="no-results">
          <h3>Order not found</h3>
          <Link to="/" className="btn btn-amazon">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirm-page container" id="order-confirmation-page">
      {/* Success Banner */}
      <div className="order-success-banner">
        <div className="success-icon">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="25" fill="#067d62" />
            <path d="M15 25L22 32L35 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="success-text">
          <h1>Order placed, thank you!</h1>
          <p>Confirmation will be sent to your email.</p>
        </div>
      </div>

      <div className="order-confirm-content">
        {/* Order Details */}
        <div className="order-confirm-card">
          <div className="order-number-row">
            <span className="order-label">Order Number</span>
            <span className="order-number-value" id="order-number">{order.order_number}</span>
          </div>

          <div className="order-detail-grid">
            <div className="order-detail-item">
              <span className="detail-label">Order Date</span>
              <span className="detail-value">{new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="order-detail-item">
              <span className="detail-label">Order Total</span>
              <span className="detail-value detail-price">₹{parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
            <div className="order-detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value order-status-badge">{order.status}</span>
            </div>
            <div className="order-detail-item">
              <span className="detail-label">Shipping To</span>
              <span className="detail-value">{order.shipping_name}, {order.shipping_city}, {order.shipping_state} - {order.shipping_zip}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {items.length > 0 && (
          <div className="order-confirm-card">
            <h2 className="order-card-title">Items Ordered</h2>
            <div className="order-items-list">
              {items.map((item, i) => (
                <div className="order-item-row" key={i}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} className="order-item-img" />
                  )}
                  <div className="order-item-info">
                    <p className="order-item-name">{item.product_name}</p>
                    <p className="order-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="order-item-price">₹{parseFloat(item.price_at_purchase || item.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="order-actions">
          <Link to="/orders" className="btn btn-amazon">View Your Orders</Link>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
