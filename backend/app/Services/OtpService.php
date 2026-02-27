<?php
namespace App\Services;

use App\Models\Otp;
use App\Models\EmailLog;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class OtpService {
    public function generateAndSend(string $email, string $purpose): array {
        // Rate limiting: max 3 OTPs per hour per email+purpose
        $recentCount = Otp::where('email', $email)
            ->where('purpose', $purpose)
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->count();

        if ($recentCount >= 3) {
            return ['success' => false, 'message' => 'Too many OTP requests. Please try again after an hour.'];
        }

        // Invalidate old OTPs
        Otp::where('email', $email)->where('purpose', $purpose)->where('is_used', false)->update(['is_used' => true]);

        $otpCode = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = Carbon::now()->addMinutes(10);

        $otp = Otp::create([
            'email' => $email,
            'otp' => $otpCode,
            'purpose' => $purpose,
            'expires_at' => $expiresAt,
        ]);

        try {
            Mail::to($email)->send(new OtpMail($otpCode, $purpose));
            EmailLog::create(['to_email' => $email, 'subject' => 'Your OTP - ' . config('app.name'), 'type' => 'otp', 'status' => 'sent']);
        } catch (\Exception $e) {
            EmailLog::create(['to_email' => $email, 'subject' => 'Your OTP - ' . config('app.name'), 'type' => 'otp', 'status' => 'failed', 'error_message' => $e->getMessage()]);
        }

        return ['success' => true, 'message' => 'OTP sent successfully', 'expires_at' => $expiresAt];
    }

    public function verify(string $email, string $otpCode, string $purpose): array {
        $otp = Otp::where('email', $email)
            ->where('otp', $otpCode)
            ->where('purpose', $purpose)
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$otp) {
            return ['success' => false, 'message' => 'Invalid OTP'];
        }

        $otp->increment('attempts');

        if ($otp->attempts > 5) {
            return ['success' => false, 'message' => 'Too many attempts. Please request a new OTP.'];
        }

        if ($otp->isExpired()) {
            return ['success' => false, 'message' => 'OTP has expired. Please request a new one.'];
        }

        $otp->update(['is_used' => true]);
        return ['success' => true, 'message' => 'OTP verified successfully'];
    }
}
