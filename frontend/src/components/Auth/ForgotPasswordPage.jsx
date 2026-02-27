import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', otp: '', password: '', password_confirmation: '' });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authAPI.forgotPassword(formData.email);
      setStep(2); toast.success('OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.resetPassword(formData);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 440 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="text-danger fw-bold text-center mb-4">Reset Password</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {step === 1 ? (
            <Form onSubmit={handleSendOtp}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </Form.Group>
              <Button variant="danger" type="submit" className="w-100" disabled={loading}>{loading ? 'Sending...' : 'Send Reset OTP'}</Button>
              <div className="text-center mt-3"><Link to="/login" className="text-muted">Back to Login</Link></div>
            </Form>
          ) : (
            <Form onSubmit={handleReset}>
              <Form.Group className="mb-3">
                <Form.Label>OTP</Form.Label>
                <Form.Control type="text" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} required />
              </Form.Group>
              <Button variant="danger" type="submit" className="w-100" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPasswordPage;
