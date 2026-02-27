<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->string('razorpay_order_id')->nullable();
            $table->string('razorpay_payment_id')->nullable();
            $table->string('razorpay_signature')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('INR');
            $table->enum('method', ['card', 'netbanking', 'wallet', 'upi', 'cod', 'other'])->default('other');
            $table->enum('status', ['pending', 'success', 'failed', 'refunded'])->default('pending');
            $table->text('failure_reason')->nullable();
            $table->timestamps();
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->index('razorpay_order_id');
        });
    }
    public function down(): void { Schema::dropIfExists('payments'); }
};
