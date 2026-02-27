<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model {
    protected $fillable = ['product_id', 'quantity', 'reserved_quantity', 'low_stock_threshold'];
    public function product() { return $this->belongsTo(Product::class); }
    public function getAvailableQuantityAttribute() { return $this->quantity - $this->reserved_quantity; }
    public function isLowStock() { return $this->available_quantity <= $this->low_stock_threshold; }
}
