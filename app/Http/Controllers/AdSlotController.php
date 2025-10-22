<?php

namespace App\Http\Controllers;

use App\Models\AdSlot;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdSlotController extends Controller
{
    public function index()
    {
        $slots = AdSlot::all();
        return response()->json($slots);
    }

    public function available()
    {
        $slots = AdSlot::where('is_available', 1)->get();
        return response()->json($slots);
    }

    public function bookedDates($slotId)
    {
        $bookedDates = DB::table('ad_slot_bookings')
            ->join('ads', 'ad_slot_bookings.ad_id', '=', 'ads.id')
            ->where('ad_slot_bookings.slot_id', $slotId)
            ->whereIn('ads.status', ['pending', 'approved', 'active'])
            ->select('ads.start_date', 'ads.end_date')
            ->get();

        return response()->json($bookedDates);
    }
}
