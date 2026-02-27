<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Inventory;
use App\Models\Address;
use App\Mail\OrderConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller {
    public function index(Request $request): JsonResponse {
        $orders = Order::with(['items', 'payment'])->where('user_id', auth()->id())->orderBy('created_at', 'desc')->paginate(10);
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function show(int $id): JsonResponse {
        $order = Order::with(['items.product.primaryImage', 'address', 'payment'])->where('id', $id)->where('user_id', auth()->id())->first();
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function store(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'address_id' => 'required|exists:addresses,id',
            'notes' => 'nullable|string',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $address = Address::where('id', $request->address_id)->where('user_id', auth()->id())->first();
        if (!$address) return response()->json(['success' => false, 'message' => 'Address not found'], 404);

        $cartItems = CartItem::with('product.inventory')->where('user_id', auth()->id())->get();
        if ($cartItems->isEmpty()) return response()->json(['success' => false, 'message' => 'Cart is empty'], 400);

        return DB::transaction(function () use ($request, $cartItems, $address) {
            $subtotal = 0;
            foreach ($cartItems as $item) {
                if (!$item->product || !$item->product->is_active) {
                    throw new \Exception("Product {$item->product->name} is no longer available");
                }
                $available = $item->product->inventory ? $item->product->inventory->available_quantity : 0;
                if ($available < $item->quantity) {
                    throw new \Exception("Insufficient stock for {$item->product->name}");
                }
                $subtotal += $item->price * $item->quantity;
            }

            $tax = round($subtotal * 0.18, 2);
            $shipping = $subtotal > 999 ? 0 : 49;
            $total = $subtotal + $tax + $shipping;

            $order = Order::create([
                'order_number' => 'SKY-' . strtoupper(uniqid()),
                'user_id' => auth()->id(),
                'address_id' => $request->address_id,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total,
                'notes' => $request->notes,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->price * $item->quantity,
                    'product_image' => $item->product->primaryImage?->image_path,
                ]);

                $item->product->inventory()->increment('reserved_quantity', $item->quantity);
            }

            CartItem::where('user_id', auth()->id())->delete();

            try {
                Mail::to(auth()->user()->email)->send(new OrderConfirmationMail($order->load('items')));
            } catch (\Exception $e) {}

            return response()->json(['success' => true, 'message' => 'Order placed successfully', 'data' => $order->load(['items', 'address'])], 201);
        });
    }

    public function cancel(int $id): JsonResponse {
        $order = Order::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found'], 404);

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['success' => false, 'message' => 'Order cannot be cancelled at this stage'], 400);
        }

        $order->update(['status' => 'cancelled']);

        // Release reserved inventory
        foreach ($order->items as $item) {
            Inventory::where('product_id', $item->product_id)->decrement('reserved_quantity', $item->quantity);
        }

        return response()->json(['success' => true, 'message' => 'Order cancelled']);
    }
}
