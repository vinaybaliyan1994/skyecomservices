import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getWishlist().then(res => { setWishlist(res.data.data); setLoading(false); });
  }, []);

  const handleRemove = async (productId) => {
    await userAPI.toggleWishlist(productId);
    setWishlist(prev => prev.filter(w => w.product_id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = async (productId) => {
    const result = await dispatch(addToCart({ product_id: productId, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) toast.success('Added to cart!');
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">My Wishlist ({wishlist.length})</h2>
      {wishlist.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-3">❤️</div>
          <h4 className="text-muted">Your wishlist is empty</h4>
          <Button variant="danger" className="mt-3" onClick={() => navigate('/products')}>Explore Products</Button>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {wishlist.map(item => (
            <Col key={item.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={item.product?.primary_image?.image_path || 'https://via.placeholder.com/200x150'} style={{ height: 150, objectFit: 'contain', padding: 10 }} onClick={() => navigate(`/products/${item.product_id}`)} />
                <Card.Body>
                  <Card.Title className="fs-6" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.product?.name}
                  </Card.Title>
                  <p className="text-danger fw-bold mb-2">₹{parseFloat(item.product?.sale_price || item.product?.price || 0).toLocaleString()}</p>
                  <div className="d-flex gap-1">
                    <Button variant="danger" size="sm" className="flex-grow-1" onClick={() => handleAddToCart(item.product_id)}>Add to Cart</Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleRemove(item.product_id)}>✕</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default WishlistPage;
