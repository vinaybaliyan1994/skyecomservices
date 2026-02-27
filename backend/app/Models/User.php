<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject {
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'phone', 'password', 'is_verified', 'is_active', 'profile_image'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return []; }

    public function addresses() { return $this->hasMany(Address::class); }
    public function cartItems() { return $this->hasMany(CartItem::class); }
    public function wishlists() { return $this->hasMany(Wishlist::class); }
    public function orders() { return $this->hasMany(Order::class); }
    public function reviews() { return $this->hasMany(ProductReview::class); }
    public function defaultAddress() { return $this->hasOne(Address::class)->where('is_default', true); }
}
