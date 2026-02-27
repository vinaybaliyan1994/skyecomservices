import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { userAPI, orderAPI, paymentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total } = useSelector(state => state.cart);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', address_line1: '', city: '', state: '', pincode: '', type: 'home' });

  useEffect(() => {
    userAPI.getAddresses().then(res => {
      setAddresses(res.data.data);
      const def = res.data.data.find(a => a.is_default);
      if (def) setSelectedAddress(def.id.toString());
    });
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.addAddress({...newAddress, is_default: addresses.length === 0});
      setAddresses(prev => [...prev, res.data.data]);
      setSelectedAddress(res.data.data.id.toString());
      setShowAddressForm(false);
      toast.success('Address added!');
    } catch (err) { toast.error('Failed to add address'); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const orderRes = await orderAPI.createOrder({ address_id: parseInt(selectedAddress) });
      const order = orderRes.data.data;

      const rzpRes = await paymentAPI.createRazorpayOrder(order.id);
      const { razorpay_order_id, amount, key_id } = rzpRes.data.data;

      const options = {
        key: key_id,
        amount: amount * 100,
        currency: 'INR',
        name: 'SkyEcomServices',
        description: `Order ${order.order_number}`,
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Order confirmed.');
            navigate(`/orders/${order.id}`);
          } catch (err) { toast.error('Payment verification failed'); }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#dc3545' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Payment gateway not loaded. Please try again.');
        navigate(`/orders/${order.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const subtotal = parseFloat(total || 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 999 ? 0 : 49;
  const orderTotal = subtotal + tax + shipping;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Checkout</h2>
      <Row>
        <Col md={7}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="fw-bold bg-light d-flex justify-content-between align-items-center">
              Delivery Address
              <Button variant="outline-danger" size="sm" onClick={() => setShowAddressForm(true)}>+ Add New</Button>
            </Card.Header>
            <Card.Body>
              {addresses.length === 0 ? (
                <p className="text-muted">No addresses saved. Please add one.</p>
              ) : addresses.map(addr => (
                <div key={addr.id} className={`p-3 mb-2 border rounded ${selectedAddress === addr.id.toString() ? 'border-danger bg-danger bg-opacity-10' : ''}`} onClick={() => setSelectedAddress(addr.id.toString())} style={{ cursor: 'pointer' }}>
                  <div className="d-flex justify-content-between">
                    <strong>{addr.full_name}</strong>
                    <small className="badge bg-secondary">{addr.type}</small>
                  </div>
                  <p className="mb-0 text-muted small">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  <small className="text-muted">📞 {addr.phone}</small>
                </div>
              ))}
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="fw-bold bg-light">Order Items ({items.length})</Card.Header>
            <Card.Body>
              {items.map(item => (
                <div key={item.id} className="d-flex align-items-center gap-3 mb-2 pb-2 border-bottom">
                  <img src={item.product?.primary_image?.image_path || 'https://via.placeholder.com/50'} alt="" style={{ width: 50, height: 50, objectFit: 'contain' }} />
                  <div className="flex-grow-1">
                    <div className="fw-semibold small">{item.product?.name}</div>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <span className="fw-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold bg-light">Price Summary</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="d-flex justify-content-between mb-2"><span>Tax (18% GST)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span className={shipping === 0 ? 'text-success' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {subtotal > 0 && subtotal <= 999 && <small className="text-muted">Add ₹{(999 - subtotal + 1).toFixed(0)} more for free shipping</small>}
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-4"><span>Total</span><span className="text-danger">₹{orderTotal.toFixed(2)}</span></div>
              <Button variant="danger" size="lg" className="w-100" onClick={handlePlaceOrder} disabled={loading || items.length === 0}>
                {loading ? <Spinner size="sm" /> : '🔒 Place Order & Pay'}
              </Button>
              <small className="text-muted d-block text-center mt-2">Secured by Razorpay</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showAddressForm} onHide={() => setShowAddressForm(false)}>
        <Modal.Header closeButton><Modal.Title>Add New Address</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAddress}>
            <Row>
              <Col><Form.Control className="mb-2" placeholder="Full Name *" value={newAddress.full_name} onChange={e => setNewAddress(a => ({...a, full_name: e.target.value}))} required /></Col>
              <Col><Form.Control className="mb-2" placeholder="Phone *" value={newAddress.phone} onChange={e => setNewAddress(a => ({...a, phone: e.target.value}))} required /></Col>
            </Row>
            <Form.Control className="mb-2" placeholder="Address Line 1 *" value={newAddress.address_line1} onChange={e => setNewAddress(a => ({...a, address_line1: e.target.value}))} required />
            <Row>
              <Col><Form.Control className="mb-2" placeholder="City *" value={newAddress.city} onChange={e => setNewAddress(a => ({...a, city: e.target.value}))} required /></Col>
              <Col><Form.Control className="mb-2" placeholder="State *" value={newAddress.state} onChange={e => setNewAddress(a => ({...a, state: e.target.value}))} required /></Col>
            </Row>
            <Row>
              <Col><Form.Control className="mb-2" placeholder="Pincode *" value={newAddress.pincode} onChange={e => setNewAddress(a => ({...a, pincode: e.target.value}))} required /></Col>
              <Col>
                <Form.Select className="mb-2" value={newAddress.type} onChange={e => setNewAddress(a => ({...a, type: e.target.value}))}>
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Col>
            </Row>
            <Button variant="danger" type="submit" className="w-100">Add Address</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CheckoutPage;
