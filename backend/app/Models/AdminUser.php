<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class AdminUser extends Authenticatable implements JWTSubject {
    protected $fillable = ['name', 'email', 'password', 'role', 'is_active', 'last_login_at'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['password' => 'hashed', 'is_active' => 'boolean', 'last_login_at' => 'datetime'];
    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return ['role' => $this->role, 'type' => 'admin']; }
}
