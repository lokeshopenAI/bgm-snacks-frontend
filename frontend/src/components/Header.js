import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

const colors = {
  primary: '#d2691e',
  white: '#fff'
};

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const hideCartCheckout = ['/login', '/signup'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = {
    color: colors.white,
    marginLeft: '20px',
    textDecoration: 'none',
    fontWeight: '600'
  };

  const logoutBtnStyle = {
    marginLeft: '20px',
    background: 'transparent',
    border: 'none',
    color: colors.white,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem'
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: colors.primary,
      color: colors.white,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Link to="/" style={{ color: colors.white, textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem' }}>
        BGM SNACKs
      </Link>
      <nav>
        {!hideCartCheckout && auth && (
          <>
            <Link to="/cart" style={navLinkStyle}>Cart ({cart.reduce((a, c) => a + c.qty || 1, 0)})</Link>
            <Link to="/checkout" style={navLinkStyle}>Checkout</Link>
          </>
        )}
        {auth ? (
          <>
            <Link to="/profile" style={navLinkStyle}>Profile</Link>
            <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={navLinkStyle}>Login</Link>
            <Link to="/signup" style={navLinkStyle}>Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
