<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Auth routes (public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'sendRegistrationOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtpAndRegister']);
    Route::post('/login/send-otp', [AuthController::class, 'sendLoginOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Product routes (public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);

// Admin login (public)
Route::post('/admin/login', [AdminController::class, 'login']);

// Protected user routes
Route::middleware('jwt.auth')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refreshToken']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // User profile
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'changePassword']);

    // Addresses
    Route::get('/user/addresses', [UserController::class, 'getAddresses']);
    Route::post('/user/addresses', [UserController::class, 'addAddress']);
    Route::put('/user/addresses/{id}', [UserController::class, 'updateAddress']);
    Route::delete('/user/addresses/{id}', [UserController::class, 'deleteAddress']);

    // Wishlist
    Route::get('/user/wishlist', [UserController::class, 'getWishlist']);
    Route::post('/user/wishlist/{productId}', [UserController::class, 'toggleWishlist']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/{itemId}', [CartController::class, 'update']);
    Route::delete('/cart/{itemId}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Payments
    Route::post('/payments/razorpay', [PaymentController::class, 'createRazorpayOrder']);
    Route::post('/payments/verify', [PaymentController::class, 'verifyPayment']);
    Route::get('/payments/{orderId}', [PaymentController::class, 'getStatus']);

    // Product reviews
    Route::post('/products/{productId}/reviews', [ProductController::class, 'addReview']);
});

// Admin protected routes
Route::prefix('admin')->middleware('admin.auth')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/orders', [AdminController::class, 'getOrders']);
    Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::put('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);

    // Admin product management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});
