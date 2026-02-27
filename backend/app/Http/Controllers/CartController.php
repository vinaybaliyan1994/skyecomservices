<?php
namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller {
    public function index(): JsonResponse {
        $cartItems = CartItem::with('product.images')->where('user_id', auth()->id())->get();
        $total = $cartItems->sum(fn($item) => $item->price * $item->quantity);
        return response()->json(['success' => true, 'data' => ['items' => $cartItems, 'total' => $total, 'count' => $cartItems->count()]]);
    }

    public function add(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:10',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $product = Product::with('inventory')->find($request->product_id);
        if (!$product || !$product->is_active) return response()->json(['success' => false, 'message' => 'Product not available'], 400);

        $availableStock = $product->inventory ? $product->inventory->available_quantity : 0;
        if ($availableStock < $request->quantity) return response()->json(['success' => false, 'message' => 'Insufficient stock'], 400);

        $cartItem = CartItem::updateOrCreate(
            ['user_id' => auth()->id(), 'product_id' => $request->product_id],
            ['quantity' => $request->quantity, 'price' => $product->effective_price]
        );

        return response()->json(['success' => true, 'message' => 'Item added to cart', 'data' => $cartItem->load('product')], 201);
    }

    public function update(Request $request, int $itemId): JsonResponse {
        $validator = Validator::make($request->all(), ['quantity' => 'required|integer|min:1|max:10']);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $cartItem = CartItem::where('id', $itemId)->where('user_id', auth()->id())->first();
        if (!$cartItem) return response()->json(['success' => false, 'message' => 'Cart item not found'], 404);

        $cartItem->update(['quantity' => $request->quantity]);
        return response()->json(['success' => true, 'message' => 'Cart updated', 'data' => $cartItem]);
    }

    public function remove(int $itemId): JsonResponse {
        $cartItem = CartItem::where('id', $itemId)->where('user_id', auth()->id())->first();
        if (!$cartItem) return response()->json(['success' => false, 'message' => 'Cart item not found'], 404);
        $cartItem->delete();
        return response()->json(['success' => true, 'message' => 'Item removed from cart']);
    }

    public function clear(): JsonResponse {
        CartItem::where('user_id', auth()->id())->delete();
        return response()->json(['success' => true, 'message' => 'Cart cleared']);
    }
}
