import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar as BsNavbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { count } = useSelector(state => state.cart);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="fw-bold text-danger fs-4">
          🛒 SkyEcom
        </BsNavbar.Brand>
        <BsNavbar.Toggle />
        <BsNavbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/products">Products</Nav.Link>
            <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
          </Nav>
          <Nav className="ms-auto align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/cart" className="position-relative">
                  🛒 Cart
                  {count > 0 && <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">{count}</Badge>}
                </Nav.Link>
                <Nav.Link as={Link} to="/wishlist">❤️ Wishlist</Nav.Link>
                <Nav.Link as={Link} to="/orders">My Orders</Nav.Link>
                <Nav.Link as={Link} to="/profile">👤 {user?.name}</Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="danger" size="sm">Register</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
