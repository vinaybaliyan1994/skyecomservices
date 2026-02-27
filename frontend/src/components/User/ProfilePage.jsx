import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Nav, Badge, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', type: 'home', is_default: false });

  useEffect(() => {
    userAPI.getAddresses().then(res => { setAddresses(res.data.data); setLoading(false); });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.addAddress(newAddress);
      setAddresses(prev => [...prev, res.data.data]);
      setShowForm(false);
      setNewAddress({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', type: 'home', is_default: false });
      toast.success('Address added!');
    } catch (err) { toast.error('Failed to add address'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await userAPI.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch (err) { toast.error('Failed to delete address'); }
  };

  if (loading) return <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>;

  return (
    <Card className="shadow-sm">
      <Card.Header className="fw-bold bg-light d-flex justify-content-between align-items-center">
        Saved Addresses
        <Button variant="outline-danger" size="sm" onClick={() => setShowForm(!showForm)}>+ Add New</Button>
      </Card.Header>
      <Card.Body>
        {showForm && (
          <Form onSubmit={handleAdd} className="mb-3 p-3 bg-light rounded">
            <Row>
              <Col md={6}><Form.Control className="mb-2" placeholder="Full Name *" value={newAddress.full_name} onChange={e => setNewAddress(a => ({...a, full_name: e.target.value}))} required /></Col>
              <Col md={6}><Form.Control className="mb-2" placeholder="Phone *" value={newAddress.phone} onChange={e => setNewAddress(a => ({...a, phone: e.target.value}))} required /></Col>
            </Row>
            <Form.Control className="mb-2" placeholder="Address Line 1 *" value={newAddress.address_line1} onChange={e => setNewAddress(a => ({...a, address_line1: e.target.value}))} required />
            <Form.Control className="mb-2" placeholder="Address Line 2 (optional)" value={newAddress.address_line2} onChange={e => setNewAddress(a => ({...a, address_line2: e.target.value}))} />
            <Row>
              <Col md={4}><Form.Control className="mb-2" placeholder="City *" value={newAddress.city} onChange={e => setNewAddress(a => ({...a, city: e.target.value}))} required /></Col>
              <Col md={4}><Form.Control className="mb-2" placeholder="State *" value={newAddress.state} onChange={e => setNewAddress(a => ({...a, state: e.target.value}))} required /></Col>
              <Col md={4}><Form.Control className="mb-2" placeholder="Pincode *" value={newAddress.pincode} onChange={e => setNewAddress(a => ({...a, pincode: e.target.value}))} required /></Col>
            </Row>
            <div className="d-flex gap-2 align-items-center">
              <Form.Select className="mb-0" style={{ width: 120 }} value={newAddress.type} onChange={e => setNewAddress(a => ({...a, type: e.target.value}))}>
                <option value="home">Home</option>
                <option value="office">Office</option>
                <option value="other">Other</option>
              </Form.Select>
              <Form.Check label="Set as default" checked={newAddress.is_default} onChange={e => setNewAddress(a => ({...a, is_default: e.target.checked}))} />
              <Button variant="danger" size="sm" type="submit">Save</Button>
              <Button variant="link" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Form>
        )}
        {addresses.map(addr => (
          <div key={addr.id} className="d-flex justify-content-between align-items-start p-3 mb-2 border rounded">
            <div>
              <strong>{addr.full_name}</strong> {addr.is_default && <Badge bg="success" className="ms-1">Default</Badge>}
              <p className="mb-0 text-muted small">{addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
              <small className="text-muted">📞 {addr.phone} • {addr.type}</small>
            </div>
            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(addr.id)}>Delete</Button>
          </div>
        ))}
        {addresses.length === 0 && <p className="text-muted text-center py-3">No addresses saved yet</p>}
      </Card.Body>
    </Card>
  );
};

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateProfile(profile);
      toast.success('Profile updated!');
    } catch (err) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.password !== password.password_confirmation) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await userAPI.changePassword(password);
      toast.success('Password changed!');
      setPassword({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">My Account</h2>
      <Tab.Container defaultActiveKey="profile">
        <Row>
          <Col md={3}>
            <Card className="shadow-sm mb-3">
              <Card.Body className="text-center py-4">
                <div className="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 70, height: 70, fontSize: 28 }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <h6 className="fw-bold mb-0">{user?.name}</h6>
                <small className="text-muted">{user?.email}</small>
              </Card.Body>
              <Nav variant="pills" className="flex-column p-2">
                {[['profile', '👤 Profile'], ['password', '🔑 Password'], ['addresses', '📍 Addresses']].map(([key, label]) => (
                  <Nav.Item key={key}><Nav.Link eventKey={key} className="text-dark rounded mb-1">{label}</Nav.Link></Nav.Item>
                ))}
              </Nav>
            </Card>
          </Col>
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                <Card className="shadow-sm">
                  <Card.Header className="fw-bold bg-light">Profile Information</Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleUpdateProfile}>
                      <Form.Group className="mb-3"><Form.Label>Full Name</Form.Label><Form.Control value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control value={user?.email} disabled /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>Phone</Form.Label><Form.Control value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} placeholder="+91 XXXXX XXXXX" /></Form.Group>
                      <Button variant="danger" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="password">
                <Card className="shadow-sm">
                  <Card.Header className="fw-bold bg-light">Change Password</Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleChangePassword}>
                      <Form.Group className="mb-3"><Form.Label>Current Password</Form.Label><Form.Control type="password" value={password.current_password} onChange={e => setPassword(p => ({...p, current_password: e.target.value}))} required /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>New Password</Form.Label><Form.Control type="password" value={password.password} onChange={e => setPassword(p => ({...p, password: e.target.value}))} required /></Form.Group>
                      <Form.Group className="mb-3"><Form.Label>Confirm New Password</Form.Label><Form.Control type="password" value={password.password_confirmation} onChange={e => setPassword(p => ({...p, password_confirmation: e.target.value}))} required /></Form.Group>
                      <Button variant="danger" type="submit" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="addresses">
                <AddressManager />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ProfilePage;
