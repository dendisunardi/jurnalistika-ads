import AdminNav from "@/components/AdminNav";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdWithRelations } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaPause,
  FaTimesCircle,
  FaDollarSign,
  FaEye,
  FaCalendar,
} from "react-icons/fa";
import { Link, useParams } from "wouter";
import { format } from "date-fns";

export default function AdminAdDetail() {
  const params = useParams();
  const { data: ad, isLoading } = useQuery<AdWithRelations>({
    queryKey: ["/api/ads/", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/ads/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
  });

  console.table(ad);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-accent/10 text-accent">
            <FaClock className="inline mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-primary/10 text-primary">
            <FaCheckCircle className="inline mr-1" />
            Disetujui
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-primary/10 text-primary">
            <FaCheckCircle className="inline mr-1" />
            Aktif
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/10 text-destructive">
            <FaTimesCircle className="inline mr-1" />
            Ditolak
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-muted/50 text-muted-foreground">
            <FaPause className="inline mr-1" />
            Dijeda
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-muted/50 text-muted-foreground">
            <FaCheckCircle className="inline mr-1" />
            Selesai
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  return (
    <div className="min-h-screen">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat iklan...</p>
          </div>
        ) : !ad ? (
          <Card className="p-12 text-center bg-primary/10">
            <FaExclamationCircle className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Iklan tidak ditemukan
            </h3>
            <p className="text-muted-foreground mb-6">
              Iklan yang dicari tidak ditemukan atau telah dihapus.
            </p>
            <Link
              href="/ads"
              data-testid="link-create-first-ad"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
            >
              Kembali ke List Iklan
            </Link>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                {ad.title}
              </h2>
              <p className="text-muted-foreground">
                Kelola dan tinjau detail iklan ini
              </p>
            </div>

            {/* Ad Image */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Gambar Iklan
              </h3>
              <AspectRatio
                ratio={16 / 9}
                className="flex justify-center items-center rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={ad.imageUrl ?? ""}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </Card>

            {/* Ad Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Main Info */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Informasi Iklan
                </h3>
                <div className="space-y-4">
                  {/* Status & Type */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground font-medium">
                      Status:
                    </span>
                    {getStatusBadge(ad.status)}
                    <span className="text-sm text-muted-foreground font-medium ml-4">
                      Tipe Iklan:
                    </span>
                    <Badge variant="outline">{ad.adType}</Badge>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mb-1">
                        <FaCalendar className="w-3 h-3" /> Tanggal Mulai
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {ad.startDate
                          ? format(new Date(ad.startDate), "dd MMM yyyy")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mb-1">
                        <FaCalendar className="w-3 h-3" /> Tanggal Berakhir
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {ad.endDate
                          ? format(new Date(ad.endDate), "dd MMM yyyy")
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Tipe Pembayaran
                    </p>
                    <Badge variant="secondary">
                      {ad.paymentType === "view" ? "Per View" : "Periode Waktu"}
                    </Badge>
                  </div>

                  {/* Rejection Reason */}
                  {ad.rejectionReason && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 mt-2">
                      <p className="text-xs text-destructive font-medium mb-1">
                        Alasan Penolakan
                      </p>
                      <p className="text-sm text-destructive">
                        {ad.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Budget & Views */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Budget & Views
                </h3>
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-md p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-2">
                      <FaDollarSign className="w-3 h-3" /> Total Budget
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(parseInt(ad.budget) || 0)}
                    </p>
                  </div>

                  <div className="bg-secondary/10 rounded-md p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-2">
                      <FaEye className="w-3 h-3" /> Target Views
                    </p>
                    <p className="text-lg font-bold text-secondary">
                      {(ad.targetViews || 0).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="border rounded-md p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-2">
                      <FaEye className="w-3 h-3" /> Current Views
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {(ad.currentViews || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cost Analysis */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Analisis Biaya
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    Biaya Estimasi
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(parseInt(ad.estimatedCost) || 0)}
                  </p>
                </div>
                <div className="border rounded-md p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    Biaya Aktual
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(parseInt(ad.actualCost ?? '') || 0)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Advertiser Info */}
            {ad.advertiser && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Informasi Pengiklan
                </h3>
                <div className="flex items-start gap-4">
                  {ad.advertiser.profileImageUrl && (
                    <img
                      src={ad.advertiser.profileImageUrl}
                      alt={ad.advertiser.firstName ?? 'profile picture'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">
                      {ad.advertiser.firstName} {ad.advertiser.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {ad.advertiser.email}
                    </p>
                    {ad.advertiser.companyName && (
                      <p className="text-sm text-foreground font-medium mb-3">
                        Perusahaan: {ad.advertiser.companyName}
                      </p>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {ad.advertiser.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Terdaftar:{" "}
                      {format(new Date(ad.advertiser.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Ad Slots */}
            {ad.slots && ad.slots.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Slot Iklan
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Nama
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Lokasi
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Posisi
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Harga/Hari
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Harga/View
                        </th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ad.slots.map((slot) => (
                        <tr
                          key={slot.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3 px-3 font-medium text-foreground">
                            {slot.name}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {slot.location}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {slot.position}
                          </td>
                          <td className="py-3 px-3">
                            {formatCurrency(parseInt(slot.pricePerDay) || 0)}
                          </td>
                          <td className="py-3 px-3">
                            {formatCurrency(parseInt(slot.pricePerView) || 0)}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                slot.isAvailable ? "default" : "secondary"
                              }
                            >
                              {slot.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
