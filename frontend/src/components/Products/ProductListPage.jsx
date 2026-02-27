import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Pagination, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../../store/slices/productSlice';
import ProductCard from './ProductCard';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const { products, categories, loading, pagination } = useSelector(state => state.products);
  const [filters, setFilters] = useState({ search: '', category_id: '', min_price: '', max_price: '', sort: '', page: 1 });

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    dispatch(fetchProducts(params));
  }, [filters, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({...f, page: 1}));
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold">All Products</h2>
      <Row>
        <Col md={3}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <h6 className="fw-bold mb-3">Filters</h6>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Category</Form.Label>
                <Form.Select size="sm" value={filters.category_id} onChange={e => setFilters(f => ({...f, category_id: e.target.value, page: 1}))}>
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Price Range</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control size="sm" type="number" placeholder="Min" value={filters.min_price} onChange={e => setFilters(f => ({...f, min_price: e.target.value, page: 1}))} />
                  <Form.Control size="sm" type="number" placeholder="Max" value={filters.max_price} onChange={e => setFilters(f => ({...f, max_price: e.target.value, page: 1}))} />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Sort By</Form.Label>
                <Form.Select size="sm" value={filters.sort} onChange={e => setFilters(f => ({...f, sort: e.target.value, page: 1}))}>
                  <option value="">Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="newest">Newest First</option>
                </Form.Select>
              </Form.Group>
              <Button variant="outline-secondary" size="sm" className="w-100" onClick={() => setFilters({ search: '', category_id: '', min_price: '', max_price: '', sort: '', page: 1 })}>Clear Filters</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          <Form onSubmit={handleSearch} className="mb-3">
            <div className="d-flex gap-2">
              <Form.Control placeholder="Search products..." value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))} />
              <Button variant="danger" type="submit">Search</Button>
            </div>
          </Form>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 text-muted"><p className="fs-5">No products found</p></div>
          ) : (
            <>
              <p className="text-muted small mb-3">{pagination?.total || 0} products found</p>
              <Row xs={1} sm={2} lg={3} className="g-3">
                {products.map(product => <Col key={product.id}><ProductCard product={product} /></Col>)}
              </Row>
              {pagination && pagination.last_page > 1 && (
                <Pagination className="justify-content-center mt-4">
                  {[...Array(pagination.last_page)].map((_, i) => (
                    <Pagination.Item key={i+1} active={i+1 === pagination.current_page} onClick={() => setFilters(f => ({...f, page: i+1}))}>{i+1}</Pagination.Item>
                  ))}
                </Pagination>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductListPage;
