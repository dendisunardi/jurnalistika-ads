<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdController;
use App\Http\Controllers\AdSlotController;
use App\Http\Controllers\StatisticsController;

// Public routes
Route::post('/auth/google', [AuthController::class, 'googleAuth']);
Route::post('/auth/google/callback', [AuthController::class, 'googleCallback']);

// Track ad view (public)
Route::post('/ads/{id}/track-view', [AdController::class, 'trackView']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::get('/auth/user', [AuthController::class, 'getUser']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Ad Slots
    Route::get('/ad-slots', [AdSlotController::class, 'index']);
    Route::get('/ad-slots/available', [AdSlotController::class, 'available']);
    Route::get('/ad-slots/{slotId}/booked-dates', [AdSlotController::class, 'bookedDates']);

    // Ads
    Route::get('/ads/my-ads', [AdController::class, 'myAds']);
    Route::get('/ads/my-ads-analytics', [AdController::class, 'myAdsAnalytics']);
    Route::post('/ads', [AdController::class, 'store']);
    Route::get('/ads/{id}/analytics', [AdController::class, 'analytics']);

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/ads/pending', [AdController::class, 'pending']);
        Route::get('/ads/active', [AdController::class, 'active']);
        Route::patch('/ads/{id}/status', [AdController::class, 'updateStatus']);
        Route::get('/statistics', [StatisticsController::class, 'index']);
    });

    // File upload
    Route::post('/blob/upload', [AdController::class, 'uploadBlob']);
});
