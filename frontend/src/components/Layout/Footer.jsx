import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-dark text-light py-4 mt-5">
    <Container>
      <Row>
        <Col md={4}>
          <h5 className="text-danger fw-bold">🛒 SkyEcomServices</h5>
          <p className="text-muted">Your trusted ecommerce destination for quality products at great prices.</p>
        </Col>
        <Col md={2}>
          <h6>Quick Links</h6>
          <ul className="list-unstyled">
            <li><Link to="/products" className="text-muted text-decoration-none">Products</Link></li>
            <li><Link to="/categories" className="text-muted text-decoration-none">Categories</Link></li>
            <li><Link to="/orders" className="text-muted text-decoration-none">My Orders</Link></li>
          </ul>
        </Col>
        <Col md={3}>
          <h6>Customer Service</h6>
          <ul className="list-unstyled text-muted">
            <li>support@skyecom.com</li>
            <li>+91 98765 43210</li>
            <li>Mon-Sat 9AM-6PM IST</li>
          </ul>
        </Col>
        <Col md={3}>
          <h6>We Accept</h6>
          <p className="text-muted">💳 Credit/Debit Cards<br />🏦 Net Banking<br />📱 UPI / Wallets</p>
        </Col>
      </Row>
      <hr className="border-secondary" />
      <p className="text-center text-muted mb-0">© 2024 SkyEcomServices. All rights reserved.</p>
    </Container>
  </footer>
);

export default Footer;
