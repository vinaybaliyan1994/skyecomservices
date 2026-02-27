<?php
namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller {
    public function updateProfile(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        auth()->user()->update($request->only(['name', 'phone']));
        return response()->json(['success' => true, 'message' => 'Profile updated', 'data' => auth()->user()]);
    }

    public function changePassword(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        if (!Hash::check($request->current_password, auth()->user()->password)) {
            return response()->json(['success' => false, 'message' => 'Current password is incorrect'], 400);
        }

        auth()->user()->update(['password' => Hash::make($request->password)]);
        return response()->json(['success' => true, 'message' => 'Password changed successfully']);
    }

    public function getAddresses(): JsonResponse {
        $addresses = Address::where('user_id', auth()->id())->get();
        return response()->json(['success' => true, 'data' => $addresses]);
    }

    public function addAddress(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line1' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'pincode' => 'required|string|max:10',
            'type' => 'in:home,office,other',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        if ($request->is_default) Address::where('user_id', auth()->id())->update(['is_default' => false]);

        $address = Address::create(array_merge($request->only(['full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'pincode', 'country', 'type', 'is_default']), ['user_id' => auth()->id()]));
        return response()->json(['success' => true, 'message' => 'Address added', 'data' => $address], 201);
    }

    public function updateAddress(Request $request, int $id): JsonResponse {
        $address = Address::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$address) return response()->json(['success' => false, 'message' => 'Address not found'], 404);

        if ($request->is_default) Address::where('user_id', auth()->id())->where('id', '!=', $id)->update(['is_default' => false]);

        $address->update($request->only(['full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'pincode', 'country', 'type', 'is_default']));
        return response()->json(['success' => true, 'message' => 'Address updated', 'data' => $address]);
    }

    public function deleteAddress(int $id): JsonResponse {
        $address = Address::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$address) return response()->json(['success' => false, 'message' => 'Address not found'], 404);
        $address->delete();
        return response()->json(['success' => true, 'message' => 'Address deleted']);
    }

    public function getWishlist(): JsonResponse {
        $wishlist = Wishlist::with('product.primaryImage')->where('user_id', auth()->id())->get();
        return response()->json(['success' => true, 'data' => $wishlist]);
    }

    public function toggleWishlist(int $productId): JsonResponse {
        $existing = Wishlist::where('user_id', auth()->id())->where('product_id', $productId)->first();
        if ($existing) {
            $existing->delete();
            return response()->json(['success' => true, 'message' => 'Removed from wishlist', 'in_wishlist' => false]);
        }
        Wishlist::create(['user_id' => auth()->id(), 'product_id' => $productId]);
        return response()->json(['success' => true, 'message' => 'Added to wishlist', 'in_wishlist' => true], 201);
    }
}
