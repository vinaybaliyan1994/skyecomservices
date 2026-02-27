import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart, updateCartItem } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total, loading } = useSelector(state => state.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleRemove = async (itemId) => {
    await dispatch(removeFromCart(itemId));
    dispatch(fetchCart());
    toast.success('Item removed from cart');
  };

  const handleUpdateQty = async (itemId, quantity) => {
    if (quantity < 1) return;
    await dispatch(updateCartItem({ itemId, quantity }));
    dispatch(fetchCart());
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Shopping Cart</h2>
      {items.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-3">🛒</div>
          <h4 className="text-muted">Your cart is empty</h4>
          <Button variant="danger" className="mt-3" onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      ) : (
        <Row>
          <Col md={8}>
            <Table responsive className="align-middle">
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={item.product?.primary_image?.image_path || 'https://via.placeholder.com/60'} alt="" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                        <div>
                          <div className="fw-semibold small">{item.product?.name}</div>
                          <small className="text-muted">{item.product?.brand}</small>
                        </div>
                      </div>
                    </td>
                    <td>₹{parseFloat(item.price).toLocaleString()}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <Button variant="outline-secondary" size="sm" onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button variant="outline-secondary" size="sm" onClick={() => handleUpdateQty(item.id, item.quantity + 1)} disabled={item.quantity >= 10}>+</Button>
                      </div>
                    </td>
                    <td className="fw-bold">₹{(item.price * item.quantity).toLocaleString()}</td>
                    <td><Button variant="outline-danger" size="sm" onClick={() => handleRemove(item.id)}>✕</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>₹{parseFloat(total).toLocaleString()}</span></div>
                <div className="d-flex justify-content-between mb-2"><span>Tax (18%)</span><span>₹{(parseFloat(total) * 0.18).toFixed(2)}</span></div>
                <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span className={parseFloat(total) > 999 ? 'text-success' : ''}>{parseFloat(total) > 999 ? 'FREE' : '₹49'}</span></div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>Total</span>
                  <span className="text-danger">₹{(parseFloat(total) * 1.18 + (parseFloat(total) > 999 ? 0 : 49)).toFixed(2)}</span>
                </div>
                <Button variant="danger" className="w-100" size="lg" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
                <Button variant="link" className="w-100 text-muted mt-1" onClick={() => navigate('/products')}>Continue Shopping</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;
