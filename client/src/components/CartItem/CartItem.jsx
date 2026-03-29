import { useCart } from '../../context/CartContext';
import './CartItem.css';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (e) => {
    const newQty = parseInt(e.target.value);
    if (newQty >= 1 && newQty <= item.stock) {
      updateQuantity(item.id, newQty);
    }
  };

  return (
    <div className="cart-item" id={`cart-item-${item.id}`}>
      <div className="cart-item-image">
        <img
          src={item.image_url || 'https://via.placeholder.com/180x180?text=No+Image'}
          alt={item.name}
        />
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-title">{item.name}</h3>

        <div className="cart-item-stock">
          {item.stock > 0 ? (
            <span className="in-stock">In Stock</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        <div className="cart-item-price-row">
          <span className="cart-item-price">₹{parseFloat(item.price).toLocaleString()}</span>
          {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
            <span className="cart-item-mrp">
              M.R.P.: <s>₹{parseFloat(item.original_price).toLocaleString()}</s>
            </span>
          )}
        </div>

        <div className="cart-item-actions">
          <div className="quantity-selector">
            <label htmlFor={`qty-${item.id}`}>Qty:</label>
            <select
              id={`qty-${item.id}`}
              value={item.quantity}
              onChange={handleQuantityChange}
              className="quantity-select"
            >
              {[...Array(Math.min(item.stock, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <span className="cart-item-divider">|</span>

          <button
            className="cart-item-delete"
            onClick={() => removeItem(item.id)}
            id={`remove-item-${item.id}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
