<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\RazorpayService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller {
    public function __construct(private RazorpayService $razorpayService) {}

    public function createRazorpayOrder(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), ['order_id' => 'required|exists:orders,id']);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $order = Order::where('id', $request->order_id)->where('user_id', auth()->id())->first();
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        if ($order->payment_status === 'paid') return response()->json(['success' => false, 'message' => 'Order already paid'], 400);

        $razorpayOrder = $this->razorpayService->createOrder($order->total, 'INR', $order->order_number);

        Payment::updateOrCreate(
            ['order_id' => $order->id],
            ['razorpay_order_id' => $razorpayOrder['id'], 'amount' => $order->total, 'status' => 'pending']
        );

        return response()->json([
            'success' => true,
            'data' => [
                'razorpay_order_id' => $razorpayOrder['id'],
                'amount' => $order->total,
                'currency' => 'INR',
                'key_id' => config('services.razorpay.key_id'),
            ]
        ]);
    }

    public function verifyPayment(Request $request): JsonResponse {
        $validator = Validator::make($request->all(), [
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);

        $isValid = $this->razorpayService->verifySignature($request->razorpay_order_id, $request->razorpay_payment_id, $request->razorpay_signature);

        $payment = Payment::where('razorpay_order_id', $request->razorpay_order_id)->first();
        if (!$payment) return response()->json(['success' => false, 'message' => 'Payment record not found'], 404);

        if ($isValid) {
            $payment->update(['razorpay_payment_id' => $request->razorpay_payment_id, 'razorpay_signature' => $request->razorpay_signature, 'status' => 'success']);
            $payment->order->update(['payment_status' => 'paid', 'status' => 'confirmed']);
            return response()->json(['success' => true, 'message' => 'Payment verified successfully']);
        } else {
            $payment->update(['status' => 'failed', 'failure_reason' => 'Signature verification failed']);
            return response()->json(['success' => false, 'message' => 'Payment verification failed'], 400);
        }
    }

    public function getStatus(int $orderId): JsonResponse {
        $order = Order::where('id', $orderId)->where('user_id', auth()->id())->first();
        if (!$order) return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        return response()->json(['success' => true, 'data' => $order->payment]);
    }
}
