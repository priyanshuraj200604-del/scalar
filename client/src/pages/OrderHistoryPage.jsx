import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';
import './OrderHistoryPage.css';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-page container">
        <h1 className="orders-title">Your Orders</h1>
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="orders-page container" id="orders-page">
      <h1 className="orders-title">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Looks like you haven't placed any orders. Start shopping to see your orders here!</p>
          <Link to="/" className="btn btn-amazon">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card" key={order.id} id={`order-${order.id}`}>
              <div className="order-card-header">
                <div className="order-card-header-item">
                  <span className="order-header-label">ORDER PLACED</span>
                  <span className="order-header-value">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="order-card-header-item">
                  <span className="order-header-label">TOTAL</span>
                  <span className="order-header-value">₹{parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
                <div className="order-card-header-item">
                  <span className="order-header-label">SHIP TO</span>
                  <span className="order-header-value">{order.shipping_name}</span>
                </div>
                <div className="order-card-header-right">
                  <span className="order-header-label">ORDER # {order.order_number}</span>
                  <Link to={`/order-confirmation/${order.id}`} className="order-view-link">View order details</Link>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-card-status">
                  <span className="order-status-text">{order.status}</span>
                </div>

                <div className="order-card-items">
                  {order.items?.map((item, i) => (
                    <div className="order-history-item" key={i}>
                      {item.image_url && (
                        <Link to={`/product/${item.product_id}`}>
                          <img src={item.image_url} alt={item.product_name} className="order-history-item-img" />
                        </Link>
                      )}
                      <div className="order-history-item-info">
                        <Link to={`/product/${item.product_id}`} className="order-history-item-name">
                          {item.product_name}
                        </Link>
                        <p className="order-history-item-qty">Qty: {item.quantity}</p>
                        <p className="order-history-item-price">₹{parseFloat(item.price_at_purchase).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
