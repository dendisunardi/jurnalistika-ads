<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AdSlotBooking extends Model
{
    use HasUuids;

    protected $fillable = [
        'ad_id',
        'slot_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public $timestamps = false;

    public function ad()
    {
        return $this->belongsTo(Ad::class, 'ad_id');
    }

    public function slot()
    {
        return $this->belongsTo(AdSlot::class, 'slot_id');
    }
}
