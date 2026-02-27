import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendRegistrationOtp, register, clearError, clearOtpSent } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent, isAuthenticated } = useSelector(state => state.auth);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', name: '', otp: '', password: '', password_confirmation: '' });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => { dispatch(clearError()); dispatch(clearOtpSent()); };
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (otpSent && step === 1) { setStep(2); toast.success('OTP sent to your email!'); }
  }, [otpSent, step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    dispatch(sendRegistrationOtp(formData.email));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) { toast.error('Passwords do not match'); return; }
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) { toast.success('Registration successful!'); navigate('/'); }
    else toast.error(result.payload?.message || 'Registration failed');
  };

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-danger fw-bold">Create Account</h2>
            <p className="text-muted">Join SkyEcomServices today</p>
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
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-danger">Login</Link>
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control type="text" placeholder="Your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>OTP (sent to {formData.email})</Form.Label>
                <Form.Control type="text" placeholder="6-digit OTP" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} required />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Min 8 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" placeholder="Repeat password" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} required />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="danger" type="submit" className="w-100" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
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

export default RegisterPage;
