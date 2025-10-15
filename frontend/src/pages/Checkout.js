import React, { useState, useContext, useEffect } from 'react';
import API from '../api';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const colors = {
  primary: '#d2691e',
  border: '#e0e0e0',
  error: '#d9534f'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '4px',
  border: `1px solid ${colors.border}`,
  fontSize: '1rem'
};

const buttonStyle = {
  backgroundColor: colors.primary,
  color: '#fff',
  border: 'none',
  padding: '12px 24px',
  cursor: 'pointer',
  borderRadius: '6px',
  fontWeight: '700'
};

const Checkout = () => {
  const { cart } = useContext(CartContext);
  const { auth } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [newAddress, setNewAddress] = useState({street:'', city:'', state:'', zip:'', country:''});
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [handlingFee, setHandlingFee] = useState(0);
  const [error, setError] = useState('');
  const [showUpi, setShowUpi] = useState(false);
  const [txnRef, setTxnRef] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      API.get('/address').then(res => {
        setAddresses(res.data);
        if(res.data.length > 0) setSelectedAddressIndex(0);
      });
    }
    if (cart.length === 0) {
      setTimeout(() => {
        alert('Your cart is empty. Please add some items before checking out.');
        navigate('/');
      }, 250);
    }
  }, [auth, cart, navigate]);

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalPrice = totalCartPrice + handlingFee;

  const handleAddAddress = async () => {
    try {
      const res = await API.post('/address', newAddress);
      setAddresses(res.data);
      setNewAddress({street:'', city:'', state:'', zip:'', country:''});
      setSelectedAddressIndex(res.data.length - 1);
      setError('');
    } catch {
      setError('Failed to add address');
    }
  };

  // UPI pay config
  const upiId = 'lokesh.ven26-4@okaxis'; // Replace with your UPI ID
  const companyName = 'BGM SNACKS';
  const payAmount = totalCartPrice + handlingFee;
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(companyName)}&am=${payAmount}&cu=INR`;

  const placeOrder = async () => {
    if (addresses.length === 0) {
      setError('Please add an address');
      return;
    }
    try {
      setIsPlacing(true);
      const productsForOrder = cart.map(item => ({ product: item._id, quantity: item.qty }));
      const address = addresses[selectedAddressIndex];
      const paymentHandlingFee = paymentMethod === 'cod' ? 45 : 0;
      const totalAmountPayable = totalCartPrice + paymentHandlingFee;
      setHandlingFee(paymentHandlingFee);

      if (paymentMethod === 'upi') {
        setShowUpi(true);
        setIsPlacing(false);
        return;
      }

      // Place order for COD
      await API.post('/order', {
        products: productsForOrder,
        address,
        paymentMethod: 'cod',
        totalAmount: totalAmountPayable,
        transactionRef: undefined
      });

      alert('Order placed successfully. Thank you!');
      navigate('/');
    } catch (err) {
      setError('Failed to place order');
      setIsPlacing(false);
    }
  };

  const confirmUpiPayment = async (txnRefInput) => {
    if (!txnRefInput) {
      setError('Please enter UPI transaction/reference number.');
      return;
    }
    setError('');
    try {
      setIsPlacing(true);
      const address = addresses[selectedAddressIndex];
      const productsForOrder = cart.map(item => ({ product: item._id, quantity: item.qty }));
      const totalAmountPayable = totalCartPrice + handlingFee;

      await API.post('/order', {
        products: productsForOrder,
        address,
        paymentMethod: 'upi',
        totalAmount: totalAmountPayable,
        transactionRef: txnRefInput
      });

      alert('Order placed successfully after UPI payment. Thank you!');
      setIsPlacing(false);
      navigate('/');
    } catch (err) {
      setError('Order failed. Contact support if your money was deducted.');
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '60px auto',
        padding: '30px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        backgroundColor: '#fff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: 'center'
      }}>
        <h2 style={{ color: colors.primary }}>Checkout</h2>
        <p style={{ color: colors.error, fontWeight: 'bold' }}>
          Your cart is empty. Please add some snacks and murukku before checking out!
        </p>
        <button style={buttonStyle} onClick={() => navigate('/')}>Shop Now</button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '700px',
      margin: '40px auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h2 style={{color: colors.primary, marginBottom: '15px'}}>Checkout</h2>
      {error && <p style={{color: colors.error}}>{error}</p>}

      {/* Address Section */}
      <h3 style={{color: colors.primary}}>Delivery Address</h3>
      {addresses.length === 0 ? (
        <p>No addresses found. Please add one below.</p>
      ) : (
        <select
          value={selectedAddressIndex}
          onChange={e => setSelectedAddressIndex(Number(e.target.value))}
          style={inputStyle}
        >
          {addresses.map((addr, i) => (
            <option key={i} value={i}>
              {addr.street}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}
            </option>
          ))}
        </select>
      )}

      {/* Add new address */}
      <h4 style={{marginTop: '25px'}}>Add New Address</h4>
      <input placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} style={inputStyle} />
      <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} style={inputStyle} />
      <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} style={inputStyle} />
      <input placeholder="Zip" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} style={inputStyle} />
      <input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} style={inputStyle} />
      <button onClick={handleAddAddress} style={{...buttonStyle, width: 'auto', marginBottom: '25px'}}>Add Address</button>

      {/* Order Summary */}
      <h3 style={{color: colors.primary}}>Order Summary</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
        <thead>
          <tr>
            <th style={{textAlign: 'left', borderBottom: `1px solid ${colors.border}`, padding: '8px'}}>Product</th>
            <th style={{textAlign: 'center', borderBottom: `1px solid ${colors.border}`, padding: '8px'}}>Qty</th>
            <th style={{textAlign: 'right', borderBottom: `1px solid ${colors.border}`, padding: '8px'}}>Price</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item._id}>
              <td style={{ padding: '8px' }}>{item.name}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{item.qty}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Total Price: ₹{totalCartPrice}</p>
      {paymentMethod === 'cod' && <p>COD Handling Fee: ₹45</p>}
      <p><strong>Payable Amount: ₹{totalPrice}</strong></p>

      {/* Payment Method */}
      <h3 style={{color: colors.primary}}>Payment Method</h3>
      <label style={{ marginRight: '15px' }}>
        <input type="radio" name="payment" value="upi"
          checked={paymentMethod === 'upi'}
          onChange={() => {setPaymentMethod('upi'); setHandlingFee(0)}} />
        UPI
      </label>
      <label>
        <input type="radio" name="payment" value="cod"
          checked={paymentMethod === 'cod'}
          onChange={() => {setPaymentMethod('cod'); setHandlingFee(45)}} />
        Cash on Delivery
      </label>

      <br /><br />

      <button
        onClick={placeOrder}
        style={buttonStyle}
        disabled={isPlacing}
      >
        {paymentMethod === 'cod' ? 'Place Order' : 'Confirm Payment'}
      </button>

      {/* UPI Panel */}
      {showUpi && (
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          background: '#f9f9f9',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ color: colors.primary }}>Complete UPI Payment</h3>
          <a href={upiLink}
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              backgroundColor: '#3185fc',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              textDecoration: 'none'
            }}
          >
            Pay ₹{payAmount} Now
          </a>
          <p style={{ margin: '15px 0', color: '#333' }}>Scan QR with any UPI App</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=200x200`}
            alt="UPI QR Code"
            style={{ marginTop: '10px', borderRadius: '8px' }}
          />
          <div style={{ marginTop: '16px', color: '#007b00' }}>
            <label>
              Enter UPI Transaction/Ref ID:
              <input
                type="text"
                value={txnRef}
                onChange={e => setTxnRef(e.target.value)}
                style={inputStyle}
                placeholder="Required for order confirmation"
              />
            </label>
          </div>
          <button
            onClick={() => confirmUpiPayment(txnRef)}
            style={{...buttonStyle, marginTop: '10px'}}
            disabled={!txnRef || isPlacing}
          >
            I Have Paid
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
