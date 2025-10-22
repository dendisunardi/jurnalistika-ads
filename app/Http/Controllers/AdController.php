<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\AdSlot;
use App\Models\AdSlotBooking;
use App\Models\AdView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdController extends Controller
{
    public function store(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $validated = $request->validate([
                'title' => 'required|string',
                'imageUrl' => 'nullable|string',
                'adType' => 'required|in:banner,sidebar,inline,popup',
                'paymentType' => 'required|in:period,view',
                'startDate' => 'required|date',
                'endDate' => 'required|date',
                'budget' => 'required|numeric|min:0',
                'targetViews' => 'nullable|integer|min:0',
                'slotIds' => 'required|array|min:1',
                'slotIds.*' => 'required|string',
            ]);

            // Validate dates
            $startDate = new \DateTime($validated['startDate']);
            $endDate = new \DateTime($validated['endDate']);

            if ($startDate > $endDate) {
                return response()->json(['message' => 'Start date must be before or equal to end date'], 400);
            }

            // Remove duplicates from slot IDs
            $slotIds = array_unique($validated['slotIds']);

            if (count($slotIds) !== count($validated['slotIds'])) {
                return response()->json(['message' => 'Duplicate slots detected. Please select each slot only once.'], 400);
            }

            // Fetch all selected slots
            $selectedSlots = AdSlot::whereIn('id', $slotIds)->get();

            if ($selectedSlots->count() !== count($slotIds)) {
                return response()->json(['message' => 'One or more selected slots do not exist'], 400);
            }

            // Check that all slots match the ad type
            $invalidSlots = $selectedSlots->filter(function ($slot) use ($validated) {
                return $slot->ad_type !== $validated['adType'];
            });

            if ($invalidSlots->count() > 0) {
                $names = $invalidSlots->pluck('name')->join(', ');
                return response()->json([
                    'message' => "All selected slots must match the ad type \"{$validated['adType']}\". Invalid slots: {$names}"
                ], 400);
            }

            // Check for booking conflicts on ALL selected slots
            foreach ($slotIds as $slotId) {
                $conflicts = DB::table('ad_slot_bookings')
                    ->join('ads', 'ad_slot_bookings.ad_id', '=', 'ads.id')
                    ->where('ad_slot_bookings.slot_id', $slotId)
                    ->whereIn('ads.status', ['pending', 'approved', 'active'])
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('ads.start_date', [$startDate, $endDate])
                            ->orWhereBetween('ads.end_date', [$startDate, $endDate])
                            ->orWhere(function ($q) use ($startDate, $endDate) {
                                $q->where('ads.start_date', '<=', $startDate)
                                  ->where('ads.end_date', '>=', $endDate);
                            });
                    })
                    ->exists();

                if ($conflicts) {
                    $slot = $selectedSlots->firstWhere('id', $slotId);
                    return response()->json([
                        'message' => "Slot \"{$slot->name}\" tidak tersedia untuk tanggal yang dipilih. Sudah ada iklan lain yang memesan slot ini pada periode tersebut."
                    ], 409);
                }
            }

            // SERVER-SIDE COST CALCULATION
            $interval = $startDate->diff($endDate);
            $numberOfDays = max(1, $interval->days + 1);

            $totalBaseCost = 0;

            if ($validated['paymentType'] === 'period') {
                foreach ($selectedSlots as $slot) {
                    $totalBaseCost += floatval($slot->price_per_day) * $numberOfDays;
                }
            } else if ($validated['paymentType'] === 'view') {
                $targetViews = $validated['targetViews'] ?? 0;
                foreach ($selectedSlots as $slot) {
                    $totalBaseCost += floatval($slot->price_per_view) * $targetViews;
                }
            }

            $tax = $totalBaseCost * 0.11;
            $estimatedCost = $totalBaseCost + $tax;

            // Create the ad
            $ad = Ad::create([
                'advertiser_id' => $userId,
                'title' => $validated['title'],
                'image_url' => $validated['imageUrl'] ?? null,
                'ad_type' => $validated['adType'],
                'payment_type' => $validated['paymentType'],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'budget' => $validated['budget'],
                'target_views' => $validated['targetViews'] ?? null,
                'estimated_cost' => $estimatedCost,
                'status' => 'pending',
            ]);

            // Create slot bookings
            foreach ($slotIds as $slotId) {
                AdSlotBooking::create([
                    'ad_id' => $ad->id,
                    'slot_id' => $slotId,
                ]);
            }

            // Load relationships
            $ad->load(['advertiser', 'slots']);

            return response()->json($ad, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid ad data', 'error' => $e->getMessage()], 400);
        }
    }

    public function myAds(Request $request)
    {
        $userId = $request->user()->id;
        $ads = Ad::with(['advertiser', 'slots'])
            ->where('advertiser_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ads);
    }

    public function myAdsAnalytics(Request $request)
    {
        $userId = $request->user()->id;
        $ads = Ad::with(['advertiser', 'slots'])
            ->where('advertiser_id', $userId)
            ->withCount([
                'views',
                'views as views_today' => function ($query) {
                    $query->whereDate('viewed_at', today());
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform to match expected format
        $ads = $ads->map(function ($ad) {
            $ad->viewCount = $ad->views_count;
            $ad->viewsToday = $ad->views_today;
            unset($ad->views_count);
            unset($ad->views_today);
            return $ad;
        });

        return response()->json($ads);
    }

    public function pending()
    {
        $ads = Ad::with(['advertiser', 'slots'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ads);
    }

    public function active()
    {
        $ads = Ad::with(['advertiser', 'slots'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ads);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,active,paused',
            'rejectionReason' => 'nullable|string',
        ]);

        $ad = Ad::findOrFail($id);
        $ad->status = $validated['status'];

        if ($validated['status'] === 'rejected' && isset($validated['rejectionReason'])) {
            $ad->rejection_reason = $validated['rejectionReason'];
        }

        $ad->save();

        return response()->json($ad);
    }

    public function analytics($id)
    {
        $ad = Ad::with(['advertiser', 'slots'])
            ->withCount([
                'views',
                'views as views_today' => function ($query) {
                    $query->whereDate('viewed_at', today());
                }
            ])
            ->findOrFail($id);

        $ad->viewCount = $ad->views_count;
        $ad->viewsToday = $ad->views_today;
        unset($ad->views_count);
        unset($ad->views_today);

        return response()->json($ad);
    }

    public function trackView(Request $request, $id)
    {
        $validated = $request->validate([
            'ipAddress' => 'nullable|string',
            'userAgent' => 'nullable|string',
            'referrer' => 'nullable|string',
        ]);

        AdView::create([
            'ad_id' => $id,
            'ip_address' => $validated['ipAddress'] ?? $request->ip(),
            'user_agent' => $validated['userAgent'] ?? $request->userAgent(),
            'referrer' => $validated['referrer'] ?? $request->header('referer'),
        ]);

        // Increment current views
        $ad = Ad::find($id);
        if ($ad) {
            $ad->increment('current_views');
        }

        return response()->json(['message' => 'View tracked successfully']);
    }

    public function uploadBlob(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,webp,avif|max:5120',
        ]);

        $file = $request->file('file');
        $filename = $request->query('filename', $file->getClientOriginalName());
        $sanitizedFilename = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $filename);

        $path = $file->storeAs('ads', Str::random(10) . '_' . $sanitizedFilename, 'public');
        $url = Storage::url($path);

        return response()->json([
            'url' => $url,
            'pathname' => $path,
        ], 201);
    }
}
