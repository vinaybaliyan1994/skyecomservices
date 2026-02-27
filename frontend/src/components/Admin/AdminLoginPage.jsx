import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await adminAPI.login(formData);
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin', JSON.stringify(res.data.admin));
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 400 }}>
      <Card className="shadow">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-danger fw-bold">Admin Panel</h2>
            <p className="text-muted">SkyEcomServices Administration</p>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={formData.password} onChange={e => setFormData(f => ({...f, password: e.target.value}))} required />
            </Form.Group>
            <Button variant="danger" type="submit" className="w-100" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminLoginPage;
