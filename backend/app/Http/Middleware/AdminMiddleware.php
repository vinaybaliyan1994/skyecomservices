<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\AdminUser;

class AdminMiddleware {
    public function handle(Request $request, Closure $next) {
        try {
            $token = JWTAuth::parseToken();
            $payload = $token->getPayload();
            if ($payload->get('type') !== 'admin') {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }
            $admin = JWTAuth::parseToken()->authenticate();
            if (!$admin || !($admin instanceof AdminUser)) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Authentication required'], 401);
        }
        return $next($request);
    }
}
