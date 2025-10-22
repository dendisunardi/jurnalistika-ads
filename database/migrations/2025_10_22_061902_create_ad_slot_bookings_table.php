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
        Schema::create('ad_slot_bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ad_id');
            $table->foreign('ad_id')->references('id')->on('ads')->onDelete('cascade');
            $table->uuid('slot_id');
            $table->foreign('slot_id')->references('id')->on('ad_slots')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['ad_id', 'slot_id'], 'unique_ad_slot');
            $table->index('ad_id', 'idx_ad_slot_bookings_ad_id');
            $table->index('slot_id', 'idx_ad_slot_bookings_slot_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_slot_bookings');
    }
};
