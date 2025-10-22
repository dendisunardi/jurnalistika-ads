<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AdView extends Model
{
    use HasUuids;

    protected $fillable = [
        'ad_id',
        'viewed_at',
        'ip_address',
        'user_agent',
        'referrer',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public $timestamps = false;

    public function ad()
    {
        return $this->belongsTo(Ad::class, 'ad_id');
    }
}
