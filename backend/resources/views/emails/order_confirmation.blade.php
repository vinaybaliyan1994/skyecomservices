<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Order Confirmation</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px;">
    <h1 style="color: #e53935;">SkyEcomServices</h1>
    <h2 style="color: #333;">Order Confirmed! 🎉</h2>
    <p>Thank you for your order. Here are your order details:</p>
    <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Order Number:</strong></td><td style="padding: 8px;">{{ $order->order_number }}</td></tr>
        <tr><td style="padding: 8px;"><strong>Total Amount:</strong></td><td style="padding: 8px;">₹{{ number_format($order->total, 2) }}</td></tr>
        <tr><td style="padding: 8px; background: #f5f5f5;"><strong>Status:</strong></td><td style="padding: 8px;">{{ ucfirst($order->status) }}</td></tr>
    </table>
    <h3>Items Ordered:</h3>
    @foreach($order->items as $item)
    <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
        <span>{{ $item->product_name }}</span> x {{ $item->quantity }} - ₹{{ number_format($item->total, 2) }}
    </div>
    @endforeach
    <p style="color: #666; margin-top: 20px;">We'll notify you when your order ships. Thank you for shopping with us!</p>
</div>
</body>
</html>
