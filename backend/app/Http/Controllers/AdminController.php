<?php
namespace App\Http\Controllers;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class AdminController extends Controller {
    public function login(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $admin = AdminUser::where('email', $request->email)->where('is_active', true)->first();
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
        }

        $admin->update(['last_login_at' => now()]);
        $token = JWTAuth::fromUser($admin);
        return response()->json(['success' => true, 'message' => 'Login successful', 'admin' => $admin, 'token' => $token]);
    }

    public function dashboard(): JsonResponse {
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        return response()->json(['success' => true, 'data' => [
            'total_users' => User::count(),
            'total_orders' => Order::count(),
            'total_products' => Product::count(),
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total'),
            'recent_orders' => Order::with(['user', 'items'])->orderBy('created_at', 'desc')->take(10)->get(),
            'monthly_sales' => Order::where('payment_status', 'paid')->where('created_at', '>=', $thirtyDaysAgo)->sum('total'),
            'low_stock_products' => Inventory::with('product')->whereRaw('quantity - reserved_quantity <= low_stock_threshold')->get(),
            'orders_by_status' => Order::selectRaw('status, count(*) as count')->groupBy('status')->get(),
        ]]);
    }

    public function getOrders(Request $request): JsonResponse {
        $query = Order::with(['user', 'items', 'payment'])->orderBy('created_at', 'desc');
        if ($request->status) $query->where('status', $request->status);
        if ($request->payment_status) $query->where('payment_status', $request->payment_status);
        return response()->json(['success' => true, 'data' => $query->paginate(20)]);
    }

    public function updateOrderStatus(Request $request, int $id): JsonResponse {
        $validator = Validator::make($request->all(), ['status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded']);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $order = Order::find($id);
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found'], 404);

        $order->update(['status' => $request->status, 'tracking_number' => $request->tracking_number]);
        if ($request->status === 'shipped') $order->update(['shipped_at' => now()]);
        if ($request->status === 'delivered') $order->update(['delivered_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Order status updated', 'data' => $order]);
    }

    public function getUsers(Request $request): JsonResponse {
        $query = User::withCount('orders');
        if ($request->search) $query->where(function($q) use ($request) {
            $q->where('name', 'like', "%{$request->search}%")->orWhere('email', 'like', "%{$request->search}%");
        });
        return response()->json(['success' => true, 'data' => $query->paginate(20)]);
    }

    public function toggleUserStatus(int $id): JsonResponse {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);
        $user->update(['is_active' => !$user->is_active]);
        return response()->json(['success' => true, 'message' => 'User status updated', 'data' => $user]);
    }

    public function storeCategory(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $slug = \Illuminate\Support\Str::slug($request->name);
        $category = Category::create(array_merge($request->only(['name', 'description', 'image', 'parent_id', 'is_active', 'sort_order']), ['slug' => $slug]));
        return response()->json(['success' => true, 'message' => 'Category created', 'data' => $category], 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        $category->update($request->only(['name', 'description', 'image', 'parent_id', 'is_active', 'sort_order']));
        return response()->json(['success' => true, 'message' => 'Category updated', 'data' => $category]);
    }
}
