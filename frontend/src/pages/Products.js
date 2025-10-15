import React, { useState, useEffect, useContext } from 'react';
import API from '../api'; // Axios instance to communicate with backend
import { CartContext } from '../contexts/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  // Fetch products from backend API on component mount
  useEffect(() => {
    API.get('/products')
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#d2691e' }}>Our Delicious Snacks</h2>
      
      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '25px'
      }}>
        {products.map(p => (
          <div key={p._id} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
            padding: '15px',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <img
              src={p.imageUrl}
              alt={p.name}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
            />
            <h3 style={{ margin: '15px 0 10px' }}>{p.name}</h3>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>{p.description}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '10px 0' }}>₹{p.price}</p>
            <button
              onClick={() => addToCart(p)}
              style={{
                backgroundColor: '#d2691e',
                color: '#fff',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: '600',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#a0522d'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#d2691e'}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
