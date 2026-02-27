import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { toast } from 'react-toastify';

const statusColors = { pending: 'warning', confirmed: 'info', processing: 'primary', shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'secondary' };

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOrders().then(res => { setOrders(res.data.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderAPI.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: 'cancelled'} : o));
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel order'); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-3">📦</div>
          <h4 className="text-muted">No orders yet</h4>
          <Button variant="danger" className="mt-3" onClick={() => navigate('/products')}>Start Shopping</Button>
        </div>
      ) : orders.map(order => (
        <Card key={order.id} className="shadow-sm mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <strong>{order.order_number}</strong>
                <br/><small className="text-muted">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
              </div>
              <div className="text-end">
                <Badge bg={statusColors[order.status] || 'secondary'} className="mb-1">{order.status?.toUpperCase()}</Badge>
                <br/><Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>{order.payment_status?.toUpperCase()}</Badge>
              </div>
            </div>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              {order.items?.slice(0, 3).map(item => (
                <div key={item.id} className="d-flex align-items-center gap-1 bg-light rounded p-1">
                  <small>{item.product_name} x{item.quantity}</small>
                </div>
              ))}
              {order.items?.length > 3 && <small className="text-muted">+{order.items.length - 3} more</small>}
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-danger">₹{parseFloat(order.total).toLocaleString()}</span>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>View Details</Button>
                {['pending', 'confirmed'].includes(order.status) && <Button variant="outline-danger" size="sm" onClick={() => handleCancel(order.id)}>Cancel</Button>}
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default OrdersPage;
