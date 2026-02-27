<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model {
    protected $fillable = ['name', 'slug', 'description', 'specifications', 'price', 'sale_price', 'discount_percentage', 'category_id', 'brand', 'sku', 'is_active', 'is_featured', 'rating', 'review_count', 'sort_order'];
    protected $casts = ['is_active' => 'boolean', 'is_featured' => 'boolean', 'price' => 'decimal:2', 'sale_price' => 'decimal:2'];

    public function category() { return $this->belongsTo(Category::class); }
    public function images() { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function primaryImage() { return $this->hasOne(ProductImage::class)->where('is_primary', true); }
    public function reviews() { return $this->hasMany(ProductReview::class); }
    public function inventory() { return $this->hasOne(Inventory::class); }
    public function getEffectivePriceAttribute() { return $this->sale_price ?? $this->price; }
}
