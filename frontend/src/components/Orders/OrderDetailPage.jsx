import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';

const statusColors = { pending: 'warning', confirmed: 'info', processing: 'primary', shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'secondary' };

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOrder(id).then(res => { setOrder(res.data.data); setLoading(false); }).catch(() => { navigate('/orders'); });
  }, [id, navigate]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (!order) return null;

  return (
    <Container className="py-4">
      <Button variant="link" className="text-muted ps-0 mb-3" onClick={() => navigate('/orders')}>← Back to Orders</Button>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Order #{order.order_number}</h2>
        <Badge bg={statusColors[order.status] || 'secondary'} className="fs-6 px-3 py-2">{order.status?.toUpperCase()}</Badge>
      </div>
      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold bg-light">Order Items</Card.Header>
            <Card.Body>
              {order.items?.map(item => (
                <div key={item.id} className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <img src={item.product_image || 'https://via.placeholder.com/60'} alt="" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{item.product_name}</div>
                    <small className="text-muted">Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString()}</small>
                  </div>
                  <span className="fw-bold">₹{parseFloat(item.total).toLocaleString()}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
          {order.address && (
            <Card className="shadow-sm mb-3">
              <Card.Header className="fw-bold bg-light">Delivery Address</Card.Header>
              <Card.Body>
                <strong>{order.address.full_name}</strong>
                <p className="text-muted mb-1">{order.address.address_line1}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p className="text-muted mb-0">📞 {order.address.phone}</p>
              </Card.Body>
            </Card>
          )}
        </Col>
        <Col md={4}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold bg-light">Price Details</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>₹{parseFloat(order.subtotal).toLocaleString()}</span></div>
              <div className="d-flex justify-content-between mb-2"><span>Tax</span><span>₹{parseFloat(order.tax).toLocaleString()}</span></div>
              <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>{parseFloat(order.shipping) === 0 ? <span className="text-success">FREE</span> : `₹${order.shipping}`}</span></div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span className="text-danger">₹{parseFloat(order.total).toLocaleString()}</span></div>
            </Card.Body>
          </Card>
          {order.payment && (
            <Card className="shadow-sm">
              <Card.Header className="fw-bold bg-light">Payment Info</Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-1"><span className="small text-muted">Status</span><Badge bg={order.payment.status === 'success' ? 'success' : 'warning'}>{order.payment.status?.toUpperCase()}</Badge></div>
                {order.payment.razorpay_payment_id && <div className="d-flex justify-content-between"><span className="small text-muted">Payment ID</span><small>{order.payment.razorpay_payment_id}</small></div>}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailPage;
