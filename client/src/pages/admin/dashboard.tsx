import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AdWithRelations } from "@shared/schema";
import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FaClock, 
  FaPlayCircle, 
  FaUsers, 
  FaMoneyBillWave,
  FaImage,
  FaCheck,
  FaTimes,
  FaEye,
  FaEdit,
  FaPause,
  FaCheckCircle,
  FaTimesCircle 
} from 'react-icons/fa';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface AdminStats {
  pendingCount: number;
  activeCount: number;
  advertiserCount: number;
  monthlyRevenue: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/statistics'],
  });

  const { data: pendingAds = [], isLoading: loadingPending } = useQuery<AdWithRelations[]>({
    queryKey: ['/api/ads/pending'],
  });

  const { data: allAds = [], isLoading: loadingAll } = useQuery<AdWithRelations[]>({
    queryKey: ['/api/ads/all'],
  });

  const { data: activeAds = [], isLoading: loadingActive } = useQuery<AdWithRelations[]>({
    queryKey: ['/api/ads/active'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      await apiRequest('PATCH', `/api/ads/${id}/status`, { status, rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Berhasil",
        description: "Status iklan berhasil diperbarui",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Gagal",
        description: "Gagal memperbarui status iklan",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: string) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (reason) {
      updateStatusMutation.mutate({ id, status: 'rejected', rejectionReason: reason });
    }
  };

  const handlePause = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'paused' });
  };

  return (
    <div className="min-h-screen">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Dashboard Admin</h2>
          <p className="text-muted-foreground">Kelola semua iklan dan pengajuan dari pemasang iklan</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaClock className="text-2xl text-primary" />
              </div>
              <Badge className="bg-accent/10 text-accent">Pending</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pengajuan Pending</p>
            <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-pending-count">
              {stats?.pendingCount || 0}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaPlayCircle className="text-2xl text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary">Aktif</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Iklan Tayang</p>
            <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-active-count">
              {stats?.activeCount || 0}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaUsers className="text-2xl text-primary" />
              </div>
              <Badge className="bg-accent/10 text-accent">Total</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Pemasang</p>
            <p className="text-3xl font-bold text-foreground font-mono" data-testid="text-advertiser-count">
              {stats?.advertiserCount || 0}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="text-2xl text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary">Bulan ini</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pendapatan</p>
            <p className="text-2xl font-bold text-foreground font-mono" data-testid="text-monthly-revenue">
              Rp {parseFloat(stats?.monthlyRevenue || '0').toLocaleString('id-ID')}
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Submissions */}
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Pengajuan Iklan Baru</h3>
                  <Badge className="bg-accent/10 text-accent">
                    {pendingAds.length} pending
                  </Badge>
                </div>
              </div>
              <div className="divide-y divide-border">
                {loadingPending ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat...</p>
                  </div>
                ) : pendingAds.length === 0 ? (
                  <div className="p-12 text-center">
                    <FaCheckCircle className="text-5xl text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada pengajuan pending</p>
                  </div>
                ) : (
                  pendingAds.map((ad: any) => (
                    <div key={ad.id} className="p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            {ad.imageUrl ? (
                              <AspectRatio className="flex justify-center items-center rounded-lg overflow-hidden" ratio={1 / 1}>
                                <img
                                  className="image"
                                  src={ad.imageUrl}
                                  alt="ad view"
                                />
                              </AspectRatio>
                            ) : (
                              <FaImage className="text-3xl text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1" data-testid={`text-pending-ad-${ad.id}`}>
                              {ad.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {ad.advertiser?.companyName || ad.advertiser?.email}
                            </p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span className="capitalize">{ad.adType}</span>
                              <span>{Math.ceil((new Date(ad.endDate).getTime() - new Date(ad.startDate).getTime()) / (1000 * 60 * 60 * 24))} hari</span>
                              <span className="font-mono font-medium text-foreground">
                                Rp {parseFloat(ad.budget).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full whitespace-nowrap">
                          Baru
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={() => handleApprove(ad.id)}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-approve-${ad.id}`}
                          className="flex-1"
                        >
                          <FaCheck className="mr-2" />Setujui
                        </Button>
                        <Button 
                          onClick={() => handleReject(ad.id)}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-reject-${ad.id}`}
                          variant="outline"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <FaTimes className="mr-2" />Tolak
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* All Ads */}
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Iklan yang Sedang Tayang</h3>
              </div>
              <div className="overflow-x-auto">
                {loadingAll ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat...</p>
                  </div>
                ) : allAds.length === 0 ? (
                  <div className="p-12 text-center">
                    <FaPlayCircle className="text-5xl text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada iklan aktif</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Iklan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pemasang</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allAds.map((ad: any) => (
                        <tr key={ad.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                {ad.imageUrl ? (
                                  <AspectRatio className="flex justify-center items-center rounded-lg overflow-hidden" ratio={1 / 1}>
                                    <img
                                      className="image"
                                      src={ad.imageUrl}
                                      alt="ad view"
                                    />
                                  </AspectRatio>
                                ) : (
                                  <FaImage className="text-3xl text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{ad.title}</p>
                                <p className="text-xs text-muted-foreground">ID: #{ad.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-foreground">{ad.advertiser?.companyName || ad.advertiser?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="capitalize">{ad.adType}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-mono font-medium text-foreground">{ad.currentViews.toLocaleString('id-ID')}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              onClick={() => handlePause(ad.id)}
                              disabled={updateStatusMutation.isPending}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <FaPause />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            {/* Active Ads */}
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Iklan yang Sedang Tayang</h3>
              </div>
              <div className="overflow-x-auto">
                {loadingActive ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat...</p>
                  </div>
                ) : activeAds.length === 0 ? (
                  <div className="p-12 text-center">
                    <FaPlayCircle className="text-5xl text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada iklan aktif</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Iklan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pemasang</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeAds.map((ad: any) => (
                        <tr key={ad.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                {ad.imageUrl ? (
                                  <AspectRatio className="flex justify-center items-center rounded-lg overflow-hidden" ratio={1 / 1}>
                                    <img
                                      className="image"
                                      src={ad.imageUrl}
                                      alt="ad view"
                                    />
                                  </AspectRatio>
                                ) : (
                                  <FaImage className="text-3xl text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{ad.title}</p>
                                <p className="text-xs text-muted-foreground">ID: #{ad.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-foreground">{ad.advertiser?.companyName || ad.advertiser?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="capitalize">{ad.adType}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-mono font-medium text-foreground">{ad.currentViews.toLocaleString('id-ID')}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              onClick={() => handlePause(ad.id)}
                              disabled={updateStatusMutation.isPending}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <FaPause />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - placeholder for future features */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Statistik Tambahan</h3>
              <p className="text-sm text-muted-foreground">Fitur statistik akan segera tersedia</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
