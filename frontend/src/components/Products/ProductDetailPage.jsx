import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Badge, Spinner, Tab, Tabs, Form, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { productAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', review: '' });

  useEffect(() => {
    productAPI.getProduct(id).then(res => { setProduct(res.data.data); setLoading(false); }).catch(() => { toast.error('Product not found'); navigate('/products'); });
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Please login to add items to cart'); navigate('/login'); return; }
    const result = await dispatch(addToCart({ product_id: product.id, quantity }));
    if (addToCart.fulfilled.match(result)) toast.success('Added to cart!');
    else toast.error(result.payload?.message || 'Failed to add to cart');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please login to review'); return; }
    try {
      await productAPI.addReview(product.id, reviewForm);
      toast.success('Review submitted for approval!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (!product) return null;

  const images = product.images?.length ? product.images : [{ image_path: 'https://via.placeholder.com/500x400?text=No+Image', alt_text: product.name }];
  const price = product.sale_price || product.price;

  return (
    <Container className="py-4">
      <Row>
        <Col md={5}>
          <div className="border rounded p-2 mb-2" style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
            <img src={images[selectedImage]?.image_path} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          </div>
          {images.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <img key={idx} src={img.image_path} alt="" onClick={() => setSelectedImage(idx)} style={{ width: 60, height: 60, objectFit: 'contain', cursor: 'pointer', border: idx === selectedImage ? '2px solid #dc3545' : '1px solid #dee2e6', borderRadius: 4 }} />
              ))}
            </div>
          )}
        </Col>
        <Col md={7}>
          <small className="text-muted">{product.category?.name} {product.brand && `| ${product.brand}`}</small>
          <h2 className="fw-bold mt-1">{product.name}</h2>
          {product.rating > 0 && <div className="text-warning mb-2">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))} <span className="text-muted small">({product.review_count} reviews)</span></div>}
          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="text-danger fw-bold fs-3">₹{parseFloat(price).toLocaleString()}</span>
            {product.sale_price && <span className="text-muted text-decoration-line-through fs-5">₹{parseFloat(product.price).toLocaleString()}</span>}
            {product.discount_percentage > 0 && <Badge bg="success">{product.discount_percentage}% OFF</Badge>}
          </div>
          <div className="mb-3">
            <Form.Label className="fw-semibold">Quantity:</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-secondary" size="sm" onClick={() => setQuantity(q => Math.max(1, q-1))}>-</Button>
              <span className="fw-bold px-3">{quantity}</span>
              <Button variant="outline-secondary" size="sm" onClick={() => setQuantity(q => Math.min(10, q+1))}>+</Button>
            </div>
          </div>
          <div className="d-flex gap-2 mb-4">
            <Button variant="danger" size="lg" onClick={handleAddToCart}>🛒 Add to Cart</Button>
            <Button variant="outline-danger" size="lg" onClick={() => { handleAddToCart(); navigate('/cart'); }}>Buy Now</Button>
          </div>
          {product.description && (
            <div>
              <h6 className="fw-bold">Description</h6>
              <p className="text-muted">{product.description}</p>
            </div>
          )}
        </Col>
      </Row>
      <Tabs className="mt-4">
        {product.specifications && (
          <Tab eventKey="specs" title="Specifications">
            <Card className="border-top-0 rounded-0 rounded-bottom"><Card.Body><p className="text-muted">{product.specifications}</p></Card.Body></Card>
          </Tab>
        )}
        <Tab eventKey="reviews" title={`Reviews (${product.review_count})`}>
          <Card className="border-top-0 rounded-0 rounded-bottom">
            <Card.Body>
              {product.reviews?.filter(r => r.is_approved).map(review => (
                <div key={review.id} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between">
                    <strong>{review.user?.name}</strong>
                    <span className="text-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                  </div>
                  {review.title && <p className="fw-semibold mb-1">{review.title}</p>}
                  <p className="text-muted mb-0">{review.review}</p>
                </div>
              ))}
              {isAuthenticated && (
                <Form onSubmit={handleSubmitReview} className="mt-3">
                  <h6 className="fw-bold">Write a Review</h6>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Rating</Form.Label>
                    <Form.Select size="sm" value={reviewForm.rating} onChange={e => setReviewForm(r => ({...r, rating: parseInt(e.target.value)}))}>
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Control size="sm" className="mb-2" placeholder="Review title (optional)" value={reviewForm.title} onChange={e => setReviewForm(r => ({...r, title: e.target.value}))} />
                  <Form.Control as="textarea" rows={3} size="sm" className="mb-2" placeholder="Your review..." value={reviewForm.review} onChange={e => setReviewForm(r => ({...r, review: e.target.value}))} />
                  <Button variant="danger" size="sm" type="submit">Submit Review</Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ProductDetailPage;
