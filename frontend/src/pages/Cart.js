import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const colors = {
  border: '#e0e0e0',
  error: '#d9534f',
  primary: '#d2691e'
};

const Cart = () => {
  const { cart, updateQty, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const btnStyle = {
    padding: '5px 9px',
    margin: '0 5px',
    cursor: 'pointer',
    borderRadius: '4px',
    border: `1px solid ${colors.border}`,
    backgroundColor: '#fff'
  };

  const removeBtnStyle = {
    backgroundColor: colors.error,
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '4px'
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2>Your Cart</h2>
      {cart.length === 0 ? <p>Your cart is empty</p> : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: `1px solid ${colors.border}`, textAlign: 'left', padding: '10px' }}>Product</th>
                <th style={{ borderBottom: `1px solid ${colors.border}`, padding: '10px' }}>Price</th>
                <th style={{ borderBottom: `1px solid ${colors.border}`, padding: '10px' }}>Quantity</th>
                <th style={{ borderBottom: `1px solid ${colors.border}`, padding: '10px' }}>Total</th>
                <th style={{ borderBottom: `1px solid ${colors.border}`, padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item._id}>
                  <td style={{ padding: '10px' }}>{item.name}</td>
                  <td style={{ padding: '10px' }}>₹{item.price}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button style={btnStyle} onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}>-</button>
                    {item.qty}
                    <button style={btnStyle} onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                  </td>
                  <td style={{ padding: '10px' }}>₹{item.price * item.qty}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button style={removeBtnStyle} onClick={() => removeFromCart(item._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: ₹{totalPrice}</h3>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
