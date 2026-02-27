<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->string('to_email');
            $table->string('subject');
            $table->enum('type', ['otp', 'order_confirmation', 'shipment', 'password_reset', 'promotional', 'other'])->default('other');
            $table->enum('status', ['sent', 'failed', 'pending'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->index('to_email');
        });
    }
    public function down(): void { Schema::dropIfExists('email_logs'); }
};
