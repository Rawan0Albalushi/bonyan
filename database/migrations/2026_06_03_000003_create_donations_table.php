<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->uuid('reference')->unique();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('phone', 20);
            $table->string('donor_name')->nullable();
            $table->string('status', 32)->default('completed');
            $table->string('payment_method')->default('manual');
            $table->string('payment_gateway')->nullable();
            $table->string('payment_reference')->nullable();
            $table->json('payment_metadata')->nullable();
            $table->string('locale', 5)->default('ar');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status']);
            $table->index('phone');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
