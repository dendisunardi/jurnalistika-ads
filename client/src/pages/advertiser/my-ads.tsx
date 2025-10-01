import { useQuery } from "@tanstack/react-query";
import AdvertiserNav from "@/components/AdvertiserNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaImage, FaClock, FaCheckCircle, FaTimesCircle, FaPause } from 'react-icons/fa';

export default function MyAds() {
  const { data: ads = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/ads/my-ads'],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-accent/10 text-accent"><FaClock className="inline mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-primary/10 text-primary"><FaCheckCircle className="inline mr-1" />Disetujui</Badge>;
      case 'active':
        return <Badge className="bg-primary/10 text-primary"><FaCheckCircle className="inline mr-1" />Aktif</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive"><FaTimesCircle className="inline mr-1" />Ditolak</Badge>;
      case 'paused':
        return <Badge className="bg-muted/50 text-muted-foreground"><FaPause className="inline mr-1" />Dijeda</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <AdvertiserNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Iklan Saya</h2>
          <p className="text-muted-foreground">Kelola semua iklan yang telah Anda buat</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat iklan...</p>
          </div>
        ) : ads.length === 0 ? (
          <Card className="p-12 text-center">
            <FaImage className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Iklan</h3>
            <p className="text-muted-foreground mb-6">Anda belum membuat iklan apapun</p>
            <a 
              href="/create-ad"
              data-testid="link-create-first-ad"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              Buat Iklan Pertama
            </a>
          </Card>
        ) : (
          <div className="space-y-4">
            {ads.map((ad: any) => (
              <Card key={ad.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaImage className="text-3xl text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1" data-testid={`text-ad-title-${ad.id}`}>
                        {ad.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span className="capitalize">{ad.adType}</span>
                        <span>•</span>
                        <span className="capitalize">{ad.paymentType}</span>
                        <span>•</span>
                        <span>{new Date(ad.startDate).toLocaleDateString('id-ID')} - {new Date(ad.endDate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(ad.status)}
                        <span className="text-sm text-muted-foreground">Views: {ad.currentViews.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <p className="text-xl font-bold text-foreground font-mono">
                      Rp {parseFloat(ad.budget).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {ad.status === 'rejected' && ad.rejectionReason && (
                  <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-1">Alasan Penolakan:</p>
                    <p className="text-sm text-muted-foreground">{ad.rejectionReason}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
