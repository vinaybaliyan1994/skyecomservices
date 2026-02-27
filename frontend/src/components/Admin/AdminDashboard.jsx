import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const statusColors = { pending: 'warning', confirmed: 'info', processing: 'primary', shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'secondary' };

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!adminToken) { navigate('/admin'); return; }
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, navigate]);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin'); }
    } finally { setLoading(false); }
  };

  const loadOrders = async () => {
    const res = await adminAPI.getOrders();
    setOrders(res.data.data.data || []);
  };

  const loadUsers = async () => {
    const res = await adminAPI.getUsers();
    setUsers(res.data.data.data || []);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders' && orders.length === 0) loadOrders();
    if (tab === 'users' && users.length === 0) loadUsers();
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
      toast.success('Order status updated');
    } catch (err) { toast.error('Update failed'); }
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? {...u, is_active: !u.is_active} : u));
      toast.success('User status updated');
    } catch (err) { toast.error('Update failed'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    navigate('/admin');
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-danger fw-bold">🛒 SkyEcom Admin</h5>
        <div className="d-flex align-items-center gap-3">
          <span className="small">👤 {admin.name}</span>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      <Container fluid className="py-3">
        <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={handleTabChange}>
          <Nav.Item><Nav.Link eventKey="overview">📊 Overview</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="orders">📦 Orders</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="users">👥 Users</Nav.Link></Nav.Item>
        </Nav>

        {activeTab === 'overview' && data && (
          <>
            <Row className="g-3 mb-4">
              {[
                { label: 'Total Users', value: data.total_users, icon: '👥', color: 'primary' },
                { label: 'Total Orders', value: data.total_orders, icon: '📦', color: 'info' },
                { label: 'Total Revenue', value: `₹${parseFloat(data.total_revenue || 0).toLocaleString()}`, icon: '💰', color: 'success' },
                { label: 'Monthly Sales', value: `₹${parseFloat(data.monthly_sales || 0).toLocaleString()}`, icon: '📈', color: 'warning' },
              ].map(({ label, value, icon, color }) => (
                <Col md={3} key={label}>
                  <Card className={`border-0 shadow-sm border-start border-${color} border-4`}>
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div><p className="text-muted small mb-1">{label}</p><h4 className="fw-bold mb-0">{value}</h4></div>
                      <span className="fs-2">{icon}</span>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <Row className="g-3">
              <Col md={8}>
                <Card className="shadow-sm">
                  <Card.Header className="fw-bold bg-light">Recent Orders</Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive className="mb-0" hover>
                      <thead className="bg-light"><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {data.recent_orders?.slice(0, 8).map(order => (
                          <tr key={order.id}>
                            <td className="fw-semibold">{order.order_number}</td>
                            <td>{order.user?.name}</td>
                            <td>₹{parseFloat(order.total).toLocaleString()}</td>
                            <td><Badge bg={statusColors[order.status] || 'secondary'}>{order.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm mb-3">
                  <Card.Header className="fw-bold bg-light">Orders by Status</Card.Header>
                  <Card.Body>
                    {data.orders_by_status?.map(item => (
                      <div key={item.status} className="d-flex justify-content-between mb-1">
                        <span className="text-capitalize">{item.status}</span>
                        <Badge bg={statusColors[item.status] || 'secondary'}>{item.count}</Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
                {data.low_stock_products?.length > 0 && (
                  <Card className="shadow-sm border-warning">
                    <Card.Header className="fw-bold bg-warning">⚠️ Low Stock Alerts</Card.Header>
                    <Card.Body>
                      {data.low_stock_products?.slice(0, 5).map(item => (
                        <div key={item.id} className="d-flex justify-content-between mb-1">
                          <small>{item.product?.name}</small>
                          <Badge bg="danger">{item.quantity - item.reserved_quantity} left</Badge>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </>
        )}

        {activeTab === 'orders' && (
          <Card className="shadow-sm">
            <Card.Header className="fw-bold bg-light">All Orders</Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light"><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="fw-semibold">{order.order_number}</td>
                      <td>{order.user?.name}<br/><small className="text-muted">{order.user?.email}</small></td>
                      <td>₹{parseFloat(order.total).toLocaleString()}</td>
                      <td><Badge bg={statusColors[order.status] || 'secondary'}>{order.status}</Badge></td>
                      <td><Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>{order.payment_status}</Badge></td>
                      <td>
                        <select className="form-select form-select-sm" style={{ width: 130 }} value={order.status} onChange={e => handleUpdateStatus(order.id, e.target.value)}>
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No orders found</td></tr>}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card className="shadow-sm">
            <Card.Header className="fw-bold bg-light">All Users</Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light"><tr><th>Name</th><th>Email</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="fw-semibold">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.orders_count || 0}</td>
                      <td><Badge bg={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Active' : 'Inactive'}</Badge></td>
                      <td><Button variant={user.is_active ? 'outline-danger' : 'outline-success'} size="sm" onClick={() => handleToggleUser(user.id)}>{user.is_active ? 'Disable' : 'Enable'}</Button></td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">No users found</td></tr>}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default AdminDashboard;
