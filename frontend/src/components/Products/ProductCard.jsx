import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const imageUrl = product.primary_image?.image_path || 'https://via.placeholder.com/300x250?text=No+Image';
  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please login to add items to cart'); return; }
    const result = await dispatch(addToCart({ product_id: product.id, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) toast.success('Added to cart!');
    else toast.error(result.payload?.message || 'Failed to add to cart');
  };

  return (
    <Card as={Link} to={`/products/${product.id}`} className="h-100 text-decoration-none text-dark product-card shadow-sm" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ height: 200, overflow: 'hidden', background: '#f8f9fa' }}>
        <Card.Img variant="top" src={imageUrl} style={{ height: '100%', objectFit: 'contain', padding: 10 }} />
      </div>
      {hasDiscount && <Badge bg="danger" className="position-absolute top-0 end-0 m-2">{product.discount_percentage}% OFF</Badge>}
      <Card.Body className="d-flex flex-column">
        <small className="text-muted">{product.brand}</small>
        <Card.Title className="fs-6 mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </Card.Title>
        <div className="mt-auto">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fw-bold text-danger fs-5">₹{parseFloat(price).toLocaleString()}</span>
            {hasDiscount && <span className="text-muted text-decoration-line-through small">₹{parseFloat(product.price).toLocaleString()}</span>}
          </div>
          {product.rating > 0 && <div className="text-warning small mb-2">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))} ({product.review_count})</div>}
          <Button variant="outline-danger" size="sm" className="w-100" onClick={handleAddToCart}>Add to Cart</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
