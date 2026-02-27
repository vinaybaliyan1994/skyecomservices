<?php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller {
    public function index(Request $request): JsonResponse {
        $query = Product::with(['primaryImage', 'category', 'inventory'])->where('is_active', true);

        if ($request->category_id) $query->where('category_id', $request->category_id);
        if ($request->search) $query->where(function($q) use ($request) {
            $q->where('name', 'like', "%{$request->search}%")->orWhere('description', 'like', "%{$request->search}%")->orWhere('brand', 'like', "%{$request->search}%");
        });
        if ($request->min_price) $query->where('price', '>=', $request->min_price);
        if ($request->max_price) $query->where('price', '<=', $request->max_price);
        if ($request->brand) $query->where('brand', $request->brand);
        if ($request->featured) $query->where('is_featured', true);
        if ($request->sort === 'price_asc') $query->orderBy('price', 'asc');
        elseif ($request->sort === 'price_desc') $query->orderBy('price', 'desc');
        elseif ($request->sort === 'rating') $query->orderBy('rating', 'desc');
        elseif ($request->sort === 'newest') $query->orderBy('created_at', 'desc');
        else $query->orderBy('sort_order');

        $products = $query->paginate($request->per_page ?? 12);
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function show(int $id): JsonResponse {
        $product = Product::with(['images', 'category', 'inventory', 'reviews.user'])->where('is_active', true)->find($id);
        if (!$product) return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function store(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|string|unique:products,sku',
            'stock_quantity' => 'required|integer|min:0',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $slug = Str::slug($request->name);
        $slug = Product::where('slug', $slug)->exists() ? $slug . '-' . time() : $slug;

        $discount = 0;
        if ($request->sale_price) {
            $discount = round((($request->price - $request->sale_price) / $request->price) * 100, 2);
        }

        $product = Product::create(array_merge($request->only(['name', 'description', 'specifications', 'price', 'sale_price', 'category_id', 'brand', 'sku', 'is_active', 'is_featured']), ['slug' => $slug, 'discount_percentage' => $discount]));

        Inventory::create(['product_id' => $product->id, 'quantity' => $request->stock_quantity]);
        return response()->json(['success' => true, 'message' => 'Product created', 'data' => $product->load('inventory')], 201);
    }

    public function update(Request $request, int $id): JsonResponse {
        $product = Product::find($id);
        if (!$product) return response()->json(['success' => false, 'message' => 'Product not found'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'sku' => 'sometimes|string|unique:products,sku,' . $id,
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        if ($request->has('name') && $request->name !== $product->name) {
            $slug = Str::slug($request->name);
            $product->slug = Product::where('slug', $slug)->where('id', '!=', $id)->exists() ? $slug . '-' . time() : $slug;
        }

        $product->fill($request->only(['name', 'description', 'specifications', 'price', 'sale_price', 'category_id', 'brand', 'sku', 'is_active', 'is_featured']));

        if ($request->has('price') || $request->has('sale_price')) {
            $price = $request->price ?? $product->price;
            $salePrice = $request->sale_price ?? $product->sale_price;
            $product->discount_percentage = $salePrice ? round((($price - $salePrice) / $price) * 100, 2) : 0;
        }

        $product->save();

        if ($request->has('stock_quantity')) {
            $product->inventory()->updateOrCreate(['product_id' => $product->id], ['quantity' => $request->stock_quantity]);
        }

        return response()->json(['success' => true, 'message' => 'Product updated', 'data' => $product->load('inventory')]);
    }

    public function destroy(int $id): JsonResponse {
        $product = Product::find($id);
        if (!$product) return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        $product->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted']);
    }

    public function categories(): JsonResponse {
        $categories = Category::where('is_active', true)->orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function addReview(Request $request, int $productId): JsonResponse {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'review' => 'nullable|string',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $product = Product::find($productId);
        if (!$product) return response()->json(['success' => false, 'message' => 'Product not found'], 404);

        $review = $product->reviews()->updateOrCreate(
            ['user_id' => auth()->id()],
            ['rating' => $request->rating, 'title' => $request->title, 'review' => $request->review]
        );

        // Update product rating with a single query
        $stats = $product->reviews()->where('is_approved', true)->selectRaw('AVG(rating) as avg_rating, COUNT(*) as review_count')->first();
        $product->update(['rating' => round($stats->avg_rating ?? 0, 2), 'review_count' => $stats->review_count ?? 0]);

        return response()->json(['success' => true, 'message' => 'Review submitted', 'data' => $review], 201);
    }
}
