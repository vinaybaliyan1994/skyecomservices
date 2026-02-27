<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>OTP Verification</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e53935;">SkyEcomServices</h1>
    </div>
    <h2 style="color: #333;">Your One-Time Password</h2>
    <p style="color: #666;">Use the following OTP to {{ $purpose === 'registration' ? 'complete your registration' : ($purpose === 'login' ? 'login to your account' : 'reset your password') }}:</p>
    <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e53935; background: #f5f5f5; padding: 15px 25px; border-radius: 8px;">{{ $otp }}</span>
    </div>
    <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
</div>
</body>
</html>
