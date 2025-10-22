<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('advertiser_id');
            $table->foreign('advertiser_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('title');
            $table->string('image_url')->nullable();
            $table->enum('ad_type', ['banner', 'sidebar', 'inline', 'popup']);
            $table->enum('payment_type', ['period', 'view']);
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->decimal('budget', 12, 2);
            $table->integer('target_views')->nullable();
            $table->integer('current_views')->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected', 'active', 'paused', 'completed'])->default('pending');
            $table->decimal('estimated_cost', 12, 2);
            $table->decimal('actual_cost', 12, 2)->default(0);
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
