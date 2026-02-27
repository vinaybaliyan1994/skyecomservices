import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendLoginOtp, login, clearError, clearOtpSent } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent, isAuthenticated } = useSelector(state => state.auth);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', otp: '', remember_me: false });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => { dispatch(clearError()); dispatch(clearOtpSent()); };
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (otpSent && step === 1) { setStep(2); toast.success('OTP sent to your email!'); }
  }, [otpSent, step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    dispatch(sendLoginOtp(formData.email));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) { toast.success('Login successful!'); navigate('/'); }
    else toast.error(result.payload?.message || 'Login failed');
  };

  return (
    <Container className="py-5" style={{ maxWidth: 440 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-danger fw-bold">Welcome Back</h2>
            <p className="text-muted">Login to your account</p>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {step === 1 ? (
            <Form onSubmit={handleSendOtp}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </Form.Group>
              <Button variant="danger" type="submit" className="w-100" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
              <div className="text-center mt-3">
                <Link to="/forgot-password" className="text-muted small">Forgot Password?</Link>
              </div>
              <div className="text-center mt-2">
                <span className="text-muted">Don&apos;t have an account? </span>
                <Link to="/register" className="text-danger">Register</Link>
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>OTP (sent to {formData.email})</Form.Label>
                <Form.Control type="text" placeholder="6-digit OTP" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} required autoFocus />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="Remember me for 30 days" checked={formData.remember_me} onChange={e => setFormData({...formData, remember_me: e.target.checked})} />
              </Form.Group>
              <Button variant="danger" type="submit" className="w-100" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button variant="link" className="w-100 text-muted" onClick={() => { setStep(1); dispatch(clearOtpSent()); }}>
                Change email / Resend OTP
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
