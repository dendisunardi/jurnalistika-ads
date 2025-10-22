<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AdSlot extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'ad_type',
        'position',
        'location',
        'is_available',
        'price_per_day',
        'price_per_view',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'is_available' => 'integer',
        'price_per_day' => 'decimal:2',
        'price_per_view' => 'decimal:4',
    ];

    public $timestamps = false;

    public function adSlotBookings()
    {
        return $this->hasMany(AdSlotBooking::class, 'slot_id');
    }

    public function ads()
    {
        return $this->belongsToMany(Ad::class, 'ad_slot_bookings', 'slot_id', 'ad_id')
                    ->withTimestamps();
    }
}
