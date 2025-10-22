<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function index()
    {
        $pendingAdsCount = Ad::where('status', 'pending')->count();
        $activeAdsCount = Ad::where('status', 'active')->count();
        $advertiserCount = User::where('role', 'advertiser')->count();
        
        // Calculate monthly revenue from approved/active ads
        $monthlyRevenue = Ad::whereIn('status', ['approved', 'active', 'completed'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('estimated_cost');

        return response()->json([
            'pendingAdsCount' => $pendingAdsCount,
            'activeAdsCount' => $activeAdsCount,
            'advertiserCount' => $advertiserCount,
            'monthlyRevenue' => floatval($monthlyRevenue),
        ]);
    }
}
