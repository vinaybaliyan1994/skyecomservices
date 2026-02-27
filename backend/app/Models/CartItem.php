<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model {
    protected $fillable = ['user_id', 'product_id', 'quantity', 'price'];
    protected $casts = ['price' => 'decimal:2'];
    public function user() { return $this->belongsTo(User::class); }
    public function product() { return $this->belongsTo(Product::class)->with('primaryImage'); }
    public function getTotalAttribute() { return $this->price * $this->quantity; }
}
