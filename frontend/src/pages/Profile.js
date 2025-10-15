import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import API from '../api';

const colors = {
  primary: '#d2691e',
  border: '#e0e0e0',
  error: '#d9534f',
  success: '#28a745'
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
  padding: '12px 20px',
  cursor: 'pointer',
  borderRadius: '6px',
  fontWeight: '700',
  marginRight: '10px'
};

const Profile = () => {
  const { auth, login } = useContext(AuthContext);
  const [user, setUser] = useState(auth?.user || {});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    addresses: []
  });
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        addresses: user.addresses || []
      });
    }
  }, [user]);

  const handleInputChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (index, e) => {
    const updatedAddresses = form.addresses.map((addr, idx) => {
      if (idx === index) return { ...addr, [e.target.name]: e.target.value };
      return addr;
    });
    setForm({ ...form, addresses: updatedAddresses });
  };

  const handleAddAddress = () => {
    setForm({ ...form, addresses: [...form.addresses, newAddress] });
    setNewAddress({ street: '', city: '', state: '', zip: '', country: '' });
  };

  const handleRemoveAddress = index => {
    const updatedAddresses = form.addresses.filter((_, idx) => idx !== index);
    setForm({ ...form, addresses: updatedAddresses });
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    try {
      const token = auth.token;
      const config = { headers: { Authorization: token } };
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        addresses: form.addresses
      };
      const res = await API.put('/auth/update-profile', payload, config);
      setUser(res.data.user);
      login(res.data.user, token);
      setMessage('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '40px auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ color: colors.primary, marginBottom: '15px' }}>Profile</h2>

      {message && <p style={{ color: colors.success }}>{message}</p>}
      {error && <p style={{ color: colors.error }}>{error}</p>}

      {!editMode ? (
        <>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Phone:</b> {user.phone}</p>
          <p><b>Addresses:</b></p>
          <ul>
            {user.addresses && user.addresses.length > 0 ? (
              user.addresses.map((address, idx) => (
                <li key={idx}>
                  {address.street}, {address.city}, {address.state}, {address.zip}, {address.country}
                </li>
              ))
            ) : (
              <li>No addresses added</li>
            )}
          </ul>
          <button style={buttonStyle} onClick={() => setEditMode(true)}>Edit Profile</button>
        </>
      ) : (
        <>
          <div>
            <label>Name:</label><br />
            <input type="text" name="name" value={form.name} onChange={handleInputChange} style={inputStyle} />
          </div>
          <div>
            <label>Email:</label><br />
            <input type="email" name="email" value={form.email} onChange={handleInputChange} style={inputStyle} />
          </div>
          <div>
            <label>Phone:</label><br />
            <input type="text" name="phone" value={form.phone} onChange={handleInputChange} style={inputStyle} />
          </div>

          <div>
            <h3>Addresses</h3>
            {form.addresses.map((address, idx) => (
              <div key={idx} style={{ marginBottom: '15px', border: `1px solid ${colors.border}`, padding: '10px', borderRadius: '6px' }}>
                <input name="street" value={address.street} onChange={e => handleAddressChange(idx, e)} placeholder="Street" style={inputStyle} />
                <input name="city" value={address.city} onChange={e => handleAddressChange(idx, e)} placeholder="City" style={inputStyle} />
                <input name="state" value={address.state} onChange={e => handleAddressChange(idx, e)} placeholder="State" style={inputStyle} />
                <input name="zip" value={address.zip} onChange={e => handleAddressChange(idx, e)} placeholder="Zip" style={inputStyle} />
                <input name="country" value={address.country} onChange={e => handleAddressChange(idx, e)} placeholder="Country" style={inputStyle} />
                <button style={{ ...buttonStyle, backgroundColor: colors.error, marginTop: '5px' }} onClick={() => handleRemoveAddress(idx)}>
                  Remove Address
                </button>
              </div>
            ))}
          </div>

          <div>
            <h4>Add New Address</h4>
            <input placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} style={inputStyle} />
            <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} style={inputStyle} />
            <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} style={inputStyle} />
            <input placeholder="Zip" value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} style={inputStyle} />
            <input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} style={inputStyle} />
            <button style={{ ...buttonStyle, marginTop: '10px' }} onClick={handleAddAddress}>Add Address</button>
          </div>

          <button style={{ ...buttonStyle, marginTop: '20px' }} onClick={handleSubmit}>Save</button>
          <button style={{ ...buttonStyle, backgroundColor: '#888', marginTop: '10px' }} onClick={() => setEditMode(false)}>Cancel</button>
        </>
      )}
    </div>
  );
};

export default Profile;
