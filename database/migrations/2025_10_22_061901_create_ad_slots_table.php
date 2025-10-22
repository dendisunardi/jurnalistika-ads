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
        Schema::create('ad_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->enum('ad_type', ['banner', 'sidebar', 'inline', 'popup']);
            $table->enum('position', ['top', 'bottom', 'right', 'middle']);
            $table->string('location');
            $table->integer('is_available')->default(1);
            $table->decimal('price_per_day', 10, 2);
            $table->decimal('price_per_view', 10, 4);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_slots');
    }
};
