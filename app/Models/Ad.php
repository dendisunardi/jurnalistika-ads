<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    use HasUuids;

    protected $fillable = [
        'advertiser_id',
        'title',
        'image_url',
        'ad_type',
        'payment_type',
        'start_date',
        'end_date',
        'budget',
        'target_views',
        'current_views',
        'status',
        'estimated_cost',
        'actual_cost',
        'rejection_reason',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'budget' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'target_views' => 'integer',
        'current_views' => 'integer',
    ];

    public function advertiser()
    {
        return $this->belongsTo(User::class, 'advertiser_id');
    }

    public function adSlotBookings()
    {
        return $this->hasMany(AdSlotBooking::class, 'ad_id');
    }

    public function slots()
    {
        return $this->belongsToMany(AdSlot::class, 'ad_slot_bookings', 'ad_id', 'slot_id')
                    ->withTimestamps();
    }

    public function views()
    {
        return $this->hasMany(AdView::class, 'ad_id');
    }
}
