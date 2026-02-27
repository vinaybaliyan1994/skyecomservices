<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    protected $fillable = ['order_number', 'user_id', 'address_id', 'subtotal', 'discount', 'tax', 'shipping', 'total', 'status', 'payment_status', 'notes', 'tracking_number', 'shipped_at', 'delivered_at'];
    protected $casts = ['shipped_at' => 'datetime', 'delivered_at' => 'datetime', 'subtotal' => 'decimal:2', 'total' => 'decimal:2'];
    public function user() { return $this->belongsTo(User::class); }
    public function address() { return $this->belongsTo(Address::class); }
    public function items() { return $this->hasMany(OrderItem::class); }
    public function payment() { return $this->hasOne(Payment::class); }
}
