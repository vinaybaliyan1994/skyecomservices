<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model {
    protected $fillable = ['email', 'otp', 'purpose', 'is_used', 'attempts', 'expires_at'];
    protected $casts = ['expires_at' => 'datetime', 'is_used' => 'boolean'];

    public function isExpired(): bool { return $this->expires_at->isPast(); }
    public function isValid(): bool { return !$this->is_used && !$this->isExpired() && $this->attempts < 5; }
}
