import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AdvertiserNav from "@/components/AdvertiserNav";
import { FaPlus, FaAd, FaEye, FaClock, FaCheckCircle } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdWithAnalytics } from "@shared/schema";

export default function AdvertiserDashboard() {
  const { data: adsWithAnalytics, isLoading } = useQuery<AdWithAnalytics[]>({
    queryKey: ['/api/ads/my-ads-analytics'],
  });

  // Calculate overall stats
  const stats = {
    totalAds: adsWithAnalytics?.length || 0,
    activeAds: adsWithAnalytics?.filter(ad => ad.status === 'active').length || 0,
    pendingAds: adsWithAnalytics?.filter(ad => ad.status === 'pending').length || 0,
    totalViews: adsWithAnalytics?.reduce((sum, ad) => sum + (ad.viewCount || 0), 0) || 0,
    viewsToday: adsWithAnalytics?.reduce((sum, ad) => sum + (ad.viewsToday || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen">
      <AdvertiserNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Pantau performa kampanye iklan Anda</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Iklan</CardTitle>
                <FaAd className="text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-total-ads">{stats.totalAds}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Iklan Aktif</CardTitle>
                <FaCheckCircle className="text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-active-ads">{stats.activeAds}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu Review</CardTitle>
                <FaClock className="text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-pending-ads">{stats.pendingAds}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tayangan</CardTitle>
                <FaEye className="text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div>
                  <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-total-views">
                    {stats.totalViews.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    +{stats.viewsToday.toLocaleString('id-ID')} hari ini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link 
            href="/create-ad"
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
          </Link>

          <Link 
            href="/my-ads"
            data-testid="card-my-ads"
            className="block p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <FaAd className="text-2xl text-accent-foreground" />
              </div>
              <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Lihat Semua Iklan</h3>
            <p className="text-sm text-muted-foreground">Kelola dan monitor semua iklan Anda</p>
          </Link>
        </div>

        {/* Recent Ads Performance */}
        {!isLoading && adsWithAnalytics && adsWithAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performa Iklan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adsWithAnalytics.slice(0, 5).map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    data-testid={`ad-performance-${ad.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{ad.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{ad.slot.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          ad.status === 'active' ? 'bg-green-100 text-green-800' :
                          ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          ad.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <FaEye className="text-blue-600" />
                        <span data-testid={`text-views-${ad.id}`}>{(ad.viewCount || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        +{(ad.viewsToday || 0).toLocaleString('id-ID')} hari ini
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started Guide - show only if no ads */}
        {!isLoading && (!adsWithAnalytics || adsWithAnalytics.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Panduan Memulai</CardTitle>
            </CardHeader>
            <CardContent>
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
                <Link 
                  href="/create-ad"
                  data-testid="button-start-campaign"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
                >
                  <FaPlus className="mr-2" />
                  Mulai Kampanye Sekarang
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
      </main>
    </div>
  );
}
