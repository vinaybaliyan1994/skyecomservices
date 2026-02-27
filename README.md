# SkyEcomServices 🛒
**Professional Ecommerce Platform** — Laravel 10 + React 18 + MySQL

A complete, production-ready ecommerce platform inspired by Pepperfry, featuring OTP-based authentication, Razorpay payments, and a full admin dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.x, Laravel 10.x |
| Frontend | React 18, Redux Toolkit, Bootstrap 5 |
| Database | MySQL 8.0 |
| Auth | JWT + Email OTP |
| Payment | Razorpay |
| Email | Gmail SMTP |

---

## Features

- ✅ **OTP-based Authentication** (Registration, Login, Password Reset)
- ✅ **Product Management** with images, reviews, inventory
- ✅ **Shopping Cart** with real-time updates
- ✅ **Checkout Flow** with address selection
- ✅ **Razorpay Payment Integration**
- ✅ **Order Tracking** and history
- ✅ **User Profile** with address book and wishlist
- ✅ **Admin Dashboard** with analytics, order & user management
- ✅ **Email Notifications** (OTP, order confirmation)
- ✅ **Rate Limiting** on OTP requests (3/hour)
- ✅ **JWT Token** authentication with refresh

---

## Project Structure

```
skyecomservices/
├── backend/          # Laravel 10 API
│   ├── app/
│   │   ├── Http/Controllers/   # Auth, Product, Cart, Order, Payment, User, Admin
│   │   ├── Models/             # All 15 Eloquent models
│   │   ├── Services/           # OtpService, RazorpayService
│   │   └── Mail/               # OtpMail, OrderConfirmationMail
│   ├── database/migrations/    # 15 migration files
│   └── routes/api.php          # All API routes
├── frontend/         # React 18 app
│   └── src/
│       ├── components/         # Auth, Products, Cart, Orders, User, Admin, Layout
│       ├── pages/              # HomePage
│       ├── store/              # Redux slices (auth, cart, products)
│       └── services/api.js     # Axios API layer
└── database/
    ├── schema.sql              # MySQL schema
    └── sample_data.sql         # Test data
```

---

## Setup Instructions

### Prerequisites
- PHP 8.x + Composer
- Node.js 18+ + npm
- MySQL 8.0
- Gmail account (for SMTP)
- Razorpay account

### 1. Database Setup
```sql
mysql -u root -p < database/schema.sql
mysql -u root -p skyecomservices < database/sample_data.sql
```

### 2. Backend Setup
```bash
cd backend

# Copy and configure environment
cp .env.example .env

# Edit .env and set:
# - DB_DATABASE, DB_USERNAME, DB_PASSWORD
# - MAIL_USERNAME, MAIL_PASSWORD (Gmail App Password)
# - RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
# - JWT_SECRET (auto-generated below)

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate

# (Optional) Load sample data via migrations or:
# php artisan db:seed

# Start development server
php artisan serve
# API available at: http://localhost:8000/api
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:8000/api

# Start development server
npm start
# App available at: http://localhost:3000
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Send registration OTP |
| POST | `/api/auth/verify-otp` | Verify OTP & create account |
| POST | `/api/auth/login/send-otp` | Send login OTP |
| POST | `/api/auth/login` | Login with OTP |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/logout` | Logout (JWT required) |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |

### Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/{id}` | Get product details |
| GET | `/api/categories` | List categories |

### Cart (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add item |
| PUT | `/api/cart/{id}` | Update quantity |
| DELETE | `/api/cart/{id}` | Remove item |
| DELETE | `/api/cart` | Clear cart |

### Orders (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/{id}` | Order details |
| PUT | `/api/orders/{id}/cancel` | Cancel order |

### Payments (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/razorpay` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |

### Admin (Admin Token Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/{id}/status` | Update order status |
| GET | `/api/admin/users` | All users |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/{id}` | Update product |
| DELETE | `/api/admin/products/{id}` | Delete product |

---

## Default Admin Credentials (Sample Data)
- **Email:** admin@skyecom.com
- **Password:** password
- **URL:** http://localhost:3000/admin

---

## Security Features
- ✅ JWT token authentication
- ✅ OTP rate limiting (3 per hour per email)
- ✅ OTP expiry (10 minutes)
- ✅ Password hashing (bcrypt)
- ✅ CSRF protection
- ✅ Input validation on all endpoints
- ✅ Razorpay signature verification
- ✅ Admin route isolation

---

## Gmail SMTP Setup
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate an App Password for "Mail"
4. Use the 16-character password in `.env` as `MAIL_PASSWORD`
