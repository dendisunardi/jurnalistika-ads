import { useEffect } from "react";
import { Link } from "wouter";
import AdvertiserNav from "@/components/AdvertiserNav";
import { FaPlus, FaAd, FaCalendarAlt, FaEye } from 'react-icons/fa';

export default function AdvertiserDashboard() {
  return (
    <div className="min-h-screen">
      <AdvertiserNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Selamat Datang</h2>
          <p className="text-muted-foreground">Mulai kampanye iklan Anda di Jurnalistika.id</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/create-ad">
            <a 
              data-testid="card-create-ad"
              className="block p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FaPlus className="text-2xl text-primary" />
                </div>
                <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Buat Iklan Baru</h3>
              <p className="text-sm text-muted-foreground">Mulai kampanye iklan baru dengan mudah</p>
            </a>
          </Link>

          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <FaAd className="text-2xl text-accent-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Iklan Aktif</h3>
            <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-active-ads-count">0</p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaEye className="text-2xl text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Total Tayangan</h3>
            <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-total-views">0</p>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Panduan Memulai</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Pilih Jenis Iklan</h4>
                <p className="text-sm text-muted-foreground">Tentukan format iklan yang sesuai dengan kebutuhan kampanye Anda (Banner, Sidebar, Inline, atau Pop-up)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Upload Materi Iklan</h4>
                <p className="text-sm text-muted-foreground">Siapkan gambar iklan dengan ukuran yang disarankan untuk hasil terbaik</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Atur Jadwal & Budget</h4>
                <p className="text-sm text-muted-foreground">Tentukan periode pemasangan dan budget yang sesuai dengan target Anda</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Submit & Tunggu Approval</h4>
                <p className="text-sm text-muted-foreground">Tim kami akan review iklan Anda dalam waktu 1x24 jam</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/create-ad">
              <a 
                data-testid="button-start-campaign"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
              >
                <FaPlus className="mr-2" />
                Mulai Kampanye Sekarang
              </a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
