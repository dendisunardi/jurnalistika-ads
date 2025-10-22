<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $slots = [
            [
                'name' => 'Banner Atas Homepage',
                'ad_type' => 'banner',
                'position' => 'top',
                'location' => 'homepage',
                'is_available' => 1,
                'price_per_day' => 50000.00,
                'price_per_view' => 50.00,
            ],
            [
                'name' => 'Banner Bawah Homepage',
                'ad_type' => 'banner',
                'position' => 'bottom',
                'location' => 'homepage',
                'is_available' => 1,
                'price_per_day' => 40000.00,
                'price_per_view' => 40.00,
            ],
            [
                'name' => 'Sidebar Kanan Homepage',
                'ad_type' => 'sidebar',
                'position' => 'right',
                'location' => 'homepage',
                'is_available' => 1,
                'price_per_day' => 35000.00,
                'price_per_view' => 35.00,
            ],
            [
                'name' => 'Inline Artikel - Posisi Atas',
                'ad_type' => 'inline',
                'position' => 'top',
                'location' => 'article',
                'is_available' => 1,
                'price_per_day' => 60000.00,
                'price_per_view' => 60.00,
            ],
            [
                'name' => 'Inline Artikel - Posisi Tengah',
                'ad_type' => 'inline',
                'position' => 'middle',
                'location' => 'article',
                'is_available' => 1,
                'price_per_day' => 75000.00,
                'price_per_view' => 75.00,
            ],
            [
                'name' => 'Inline Artikel - Posisi Bawah',
                'ad_type' => 'inline',
                'position' => 'bottom',
                'location' => 'article',
                'is_available' => 1,
                'price_per_day' => 55000.00,
                'price_per_view' => 55.00,
            ],
            [
                'name' => 'Pop-up Homepage',
                'ad_type' => 'popup',
                'position' => 'middle',
                'location' => 'homepage',
                'is_available' => 1,
                'price_per_day' => 100000.00,
                'price_per_view' => 100.00,
            ],
            [
                'name' => 'Pop-up Artikel',
                'ad_type' => 'popup',
                'position' => 'middle',
                'location' => 'article',
                'is_available' => 1,
                'price_per_day' => 120000.00,
                'price_per_view' => 120.00,
            ],
        ];

        foreach ($slots as $slot) {
            \App\Models\AdSlot::create($slot);
        }
    }
}
