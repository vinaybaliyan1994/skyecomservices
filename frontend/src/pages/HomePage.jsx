import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/Products/ProductCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, categories } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, per_page: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      {/* Hero */}
      <div className="bg-dark text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={7}>
              <h1 className="display-4 fw-bold mb-3">Welcome to <span className="text-danger">SkyEcom</span></h1>
              <p className="lead text-muted mb-4">Discover amazing products at unbeatable prices. Shop with confidence with our secure payment and easy returns.</p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/products" variant="danger" size="lg">Shop Now</Button>
                <Button as={Link} to="/categories" variant="outline-light" size="lg">Browse Categories</Button>
              </div>
            </Col>
            <Col md={5} className="text-center d-none d-md-block">
              <div style={{ fontSize: 150 }}>🛍️</div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features */}
      <div className="bg-light py-3">
        <Container>
          <Row className="text-center g-2">
            {[['🚚', 'Free Shipping', 'On orders above ₹999'], ['🔒', 'Secure Payment', 'Razorpay secured'], ['↩️', 'Easy Returns', '7 day return policy'], ['📞', '24/7 Support', 'Always here for you']].map(([icon, title, sub]) => (
              <Col key={title} md={3} sm={6}>
                <div className="p-3">
                  <div className="fs-2 mb-1">{icon}</div>
                  <div className="fw-semibold small">{title}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{sub}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <Container className="py-4">
          <h3 className="fw-bold mb-3">Shop by Category</h3>
          <Row xs={2} sm={3} md={4} lg={6} className="g-3">
            {categories.slice(0, 6).map(cat => (
              <Col key={cat.id}>
                <Card as={Link} to={`/products?category_id=${cat.id}`} className="text-decoration-none text-center p-3 h-100 shadow-sm border-0"
                  style={{ transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="fs-2 mb-1">{cat.image || '📦'}</div>
                  <div className="fw-semibold small text-dark">{cat.name}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Featured Products */}
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0">Featured Products</h3>
          <Button as={Link} to="/products" variant="outline-danger" size="sm">View All →</Button>
        </div>
        <Row xs={1} sm={2} md={3} lg={4} className="g-3">
          {products.slice(0, 8).map(product => <Col key={product.id}><ProductCard product={product} /></Col>)}
        </Row>
        {products.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p>No featured products yet. Check back soon!</p>
            <Button as={Link} to="/products" variant="danger">Browse All Products</Button>
          </div>
        )}
      </Container>
    </>
  );
};

export default HomePage;
