<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller {
    public function __construct(private OtpService $otpService) {}

    public function sendRegistrationOtp(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $result = $this->otpService->generateAndSend($request->email, 'registration');
        return response()->json($result, $result['success'] ? 200 : 429);
    }

    public function verifyOtpAndRegister(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $result = $this->otpService->verify($request->email, $request->otp, 'registration');
        if (!$result['success']) return response()->json($result, 400);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);

        $token = JWTAuth::fromUser($user);
        return response()->json(['success' => true, 'message' => 'Registration successful', 'user' => $user, 'token' => $token], 201);
    }

    public function sendLoginOtp(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), ['email' => 'required|email']);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $user = User::where('email', $request->email)->where('is_active', true)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'No account found with this email'], 404);

        $result = $this->otpService->generateAndSend($request->email, 'login');
        return response()->json($result, $result['success'] ? 200 : 429);
    }

    public function login(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $result = $this->otpService->verify($request->email, $request->otp, 'login');
        if (!$result['success']) return response()->json($result, 400);

        $user = User::where('email', $request->email)->where('is_active', true)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'Account not found or disabled'], 404);

        $ttl = $request->remember_me ? config('jwt.remember_ttl', 43200) : config('jwt.ttl', 1440);
        JWTAuth::factory()->setTTL($ttl);
        $token = JWTAuth::fromUser($user);

        return response()->json(['success' => true, 'message' => 'Login successful', 'user' => $user, 'token' => $token]);
    }

    public function forgotPassword(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), ['email' => 'required|email']);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'No account found with this email'], 404);

        $result = $this->otpService->generateAndSend($request->email, 'forgot_password');
        return response()->json($result, $result['success'] ? 200 : 429);
    }

    public function resetPassword(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $result = $this->otpService->verify($request->email, $request->otp, 'forgot_password');
        if (!$result['success']) return response()->json($result, 400);

        User::where('email', $request->email)->update(['password' => Hash::make($request->password)]);
        return response()->json(['success' => true, 'message' => 'Password reset successfully']);
    }

    public function logout(Request $request): JsonResponse {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['success' => true, 'message' => 'Logged out successfully']);
        } catch (JWTException $e) {
            return response()->json(['success' => false, 'message' => 'Failed to logout'], 500);
        }
    }

    public function refreshToken(Request $request): JsonResponse {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json(['success' => true, 'token' => $token]);
        } catch (JWTException $e) {
            return response()->json(['success' => false, 'message' => 'Token refresh failed'], 401);
        }
    }

    public function me(Request $request): JsonResponse {
        return response()->json(['success' => true, 'user' => auth()->user()]);
    }
}
