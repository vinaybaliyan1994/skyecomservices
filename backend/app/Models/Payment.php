<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model {
    protected $fillable = ['order_id', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'amount', 'currency', 'method', 'status', 'failure_reason'];
    protected $casts = ['amount' => 'decimal:2'];
    public function order() { return $this->belongsTo(Order::class); }
}
