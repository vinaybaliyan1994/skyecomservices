<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('otps', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('otp', 10);
            $table->enum('purpose', ['registration', 'login', 'forgot_password'])->default('registration');
            $table->boolean('is_used')->default(false);
            $table->integer('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamps();
            $table->index(['email', 'purpose']);
        });
    }
    public function down(): void { Schema::dropIfExists('otps'); }
};
