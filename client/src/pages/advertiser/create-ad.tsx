import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AdSlot } from "@shared/schema";
import AdvertiserNav from "@/components/AdvertiserNav";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UploadResult } from '@uppy/core';
import { FaAd, FaArrowLeft, FaArrowRight, FaCloudUploadAlt, FaCheck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const formSchema = z.object({
  adType: z.enum(['banner', 'sidebar', 'inline', 'popup']),
  paymentType: z.enum(['period', 'view']),
  slotId: z.string().min(1, "Pilih slot iklan"),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  imageUrl: z.string().min(1, "Upload gambar iklan"),
  startDate: z.string().min(1, "Pilih tanggal mulai"),
  endDate: z.string().min(1, "Pilih tanggal berakhir"),
  budget: z.string().min(1, "Masukkan budget"),
  targetViews: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateAd() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [slotTypeFilter, setSlotTypeFilter] = useState<string>("all");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adType: 'banner',
      paymentType: 'period',
      slotId: '',
      title: '',
      imageUrl: '',
      startDate: '',
      endDate: '',
      budget: '',
      targetViews: '',
    },
  });

  const { data: slots = [] } = useQuery<AdSlot[]>({
    queryKey: ['/api/ad-slots/available'],
  });

  const adType = form.watch('adType');
  const paymentType = form.watch('paymentType');
  const slotId = form.watch('slotId');

  // Fetch booked dates for selected slot
  const { data: bookedDates = [] } = useQuery<Array<{ startDate: Date; endDate: Date; adId: string }>>({
    queryKey: ['/api/ad-slots', slotId, 'booked-dates'],
    enabled: !!slotId,
  });
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const budget = form.watch('budget');
  const title = form.watch('title');
  const imageUrl = form.watch('imageUrl');

  // Filter slots by ad type and slot type filter
  const filteredSlots = slots.filter((slot) => {
    const matchesAdType = slot.adType === adType;
    const matchesFilter = slotTypeFilter === "all" || slot.adType === slotTypeFilter;
    return matchesAdType && matchesFilter;
  });

  // Calculate stepper progress
  const getCurrentStep = () => {
    if (!slotId) return 1;
    if (!imageUrl) return 2;
    if (!startDate || !endDate || !budget) return 3;
    return 4;
  };

  const currentStep = getCurrentStep();

  const stepperSteps = [
    { id: 1, title: "Pilih Slot", description: "Jenis & slot iklan" },
    { id: 2, title: "Upload Gambar", description: "Gambar iklan" },
    { id: 3, title: "Jadwal & Budget", description: "Periode & biaya" },
    { id: 4, title: "Review", description: "Periksa & kirim" },
  ];

  // Format Rupiah input
  const formatRupiah = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    form.setValue('budget', rawValue);
  };

  // Check if date range conflicts with booked dates
  const checkDateConflict = (start: string, end: string) => {
    if (!start || !end || bookedDates.length === 0) return false;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return bookedDates.some((booked) => {
      const bookedStart = new Date(booked.startDate);
      const bookedEnd = new Date(booked.endDate);
      
      // Check if dates overlap
      return (startDate <= bookedEnd && endDate >= bookedStart);
    });
  };

  const hasDateConflict = checkDateConflict(startDate, endDate);

  // Calculate cost estimation
  const calculateEstimate = () => {
    if (!startDate || !endDate || !budget || !slotId) {
      return { days: 0, pricePerDay: 0, tax: 0, total: 0 };
    }

    // Find the selected slot by ID
    const selectedSlot = slots.find((slot) => slot.id === slotId);
    if (!selectedSlot) {
      return { days: 0, pricePerDay: 0, tax: 0, total: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    // Ensure at least 1 day even if start and end are the same
    const days = daysDiff <= 0 ? 1 : Math.ceil(daysDiff);
    
    const pricePerDay = paymentType === 'period' ? parseFloat(selectedSlot.pricePerDay) : parseFloat(selectedSlot.pricePerView) * 1000;
    const subtotal = pricePerDay * days;
    const tax = subtotal * 0.11;
    const total = subtotal + tax;

    return { days, pricePerDay, tax, total };
  };

  const estimate = calculateEstimate();

  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        setUploadedImageUrl(uploadURL);
        form.setValue('imageUrl', uploadURL);
        toast({
          title: "Berhasil",
          description: "Gambar berhasil diupload",
        });
      }
    }
  };

  const createAdMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/ads', {
        ...data,
        advertiserId: (user as any)?.id,
        estimatedCost: estimate.total.toString(),
        budget: parseFloat(data.budget),
        targetViews: data.targetViews ? parseInt(data.targetViews) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Iklan berhasil dibuat dan menunggu persetujuan admin",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/my-ads'] });
      form.reset();
      setUploadedImageUrl("");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Anda tidak memiliki akses. Silakan login kembali.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      // Handle conflict error
      if (error.message && error.message.includes("tidak tersedia")) {
        toast({
          title: "Slot Tidak Tersedia",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Gagal",
        description: "Gagal membuat iklan. Silakan coba lagi.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createAdMutation.mutate(data);
  };

  useEffect(() => {
    if (filteredSlots.length > 0 && !form.getValues('slotId')) {
      form.setValue('slotId', filteredSlots[0].id);
    }
  }, [filteredSlots, form]);

  return (
    <div className="min-h-screen">
      <AdvertiserNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Buat Iklan Baru</h2>
          <p className="text-muted-foreground">Lengkapi informasi di bawah untuk membuat kampanye iklan Anda</p>
        </div>

        {/* Stepper */}
        <Stepper steps={stepperSteps} currentStep={currentStep} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Ad Type Selection */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Pilih Jenis Iklan</h3>
                  <FormField
                    control={form.control}
                    name="adType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid sm:grid-cols-2 gap-4"
                          >
                            {[
                              { value: 'banner', label: 'Banner', icon: FaAd, desc: 'Iklan horizontal di bagian atas atau bawah halaman' },
                              { value: 'sidebar', label: 'Sidebar', icon: FaAd, desc: 'Iklan vertikal di sisi kanan halaman' },
                              { value: 'inline', label: 'Inline Article', icon: FaAd, desc: 'Iklan di tengah konten artikel' },
                              { value: 'popup', label: 'Pop-up', icon: FaAd, desc: 'Iklan yang muncul di atas konten' },
                            ].map((type) => (
                              <FormItem key={type.value}>
                                <FormControl>
                                  <label className="relative cursor-pointer block">
                                    <RadioGroupItem value={type.value} className="sr-only peer" />
                                    <div className="p-4 border-2 border-border rounded-lg peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50 transition-all">
                                      <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                          <type.icon className="text-primary" />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-foreground mb-1">{type.label}</h4>
                                          <p className="text-sm text-muted-foreground">{type.desc}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                </FormControl>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                {/* Payment Type */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tipe Pembayaran</h3>
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid sm:grid-cols-2 gap-4"
                          >
                            <FormItem>
                              <FormControl>
                                <label className="relative cursor-pointer block">
                                  <RadioGroupItem value="period" className="sr-only peer" />
                                  <div className="p-5 border-2 border-border rounded-lg peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-foreground">Per Periode</h4>
                                      <FaAd className="text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">Bayar berdasarkan durasi pemasangan</p>
                                    <div className="mt-4 pt-4 border-t border-border">
                                      <p className="text-xs text-muted-foreground">Mulai dari</p>
                                      <p className="text-2xl font-bold text-foreground font-mono">Rp 500K<span className="text-sm text-muted-foreground font-normal">/bulan</span></p>
                                    </div>
                                  </div>
                                </label>
                              </FormControl>
                            </FormItem>

                            <FormItem>
                              <FormControl>
                                <label className="relative cursor-pointer block">
                                  <RadioGroupItem value="view" className="sr-only peer" />
                                  <div className="p-5 border-2 border-border rounded-lg peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-foreground">Per View</h4>
                                      <FaAd className="text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">Bayar berdasarkan jumlah tayangan</p>
                                    <div className="mt-4 pt-4 border-t border-border">
                                      <p className="text-xs text-muted-foreground">Mulai dari</p>
                                      <p className="text-2xl font-bold text-foreground font-mono">Rp 50<span className="text-sm text-muted-foreground font-normal">/view</span></p>
                                    </div>
                                  </div>
                                </label>
                              </FormControl>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                {/* Upload Ad Image */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Upload Gambar Iklan</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div>
                              {!uploadedImageUrl ? (
                                <ObjectUploader
                                  maxNumberOfFiles={1}
                                  maxFileSize={5242880}
                                  onGetUploadParameters={handleGetUploadParameters}
                                  onComplete={handleUploadComplete}
                                  buttonClassName="w-full"
                                >
                                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                      <FaCloudUploadAlt className="text-3xl text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-1">Klik untuk upload</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, atau GIF (maks. 5MB)</p>
                                  </div>
                                </ObjectUploader>
                              ) : (
                                <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                  <FaCheck className="text-2xl text-primary mx-auto mb-2" />
                                  <p className="text-sm text-foreground font-medium">Gambar berhasil diupload</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadedImageUrl("");
                                      form.setValue('imageUrl', '');
                                    }}
                                    className="text-xs text-muted-foreground hover:text-foreground mt-2"
                                  >
                                    Upload ulang
                                  </button>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-foreground mb-2">Ukuran yang Disarankan:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div><FaCheck className="inline text-primary mr-1" /> Banner: 728x90 px</div>
                        <div><FaCheck className="inline text-primary mr-1" /> Sidebar: 300x250 px</div>
                        <div><FaCheck className="inline text-primary mr-1" /> Inline: 336x280 px</div>
                        <div><FaCheck className="inline text-primary mr-1" /> Pop-up: 480x320 px</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Ad Details */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Detail Iklan</h3>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Iklan</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Contoh: Promo Gadget Terbaru"
                            data-testid="input-ad-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                {/* Schedule & Budget */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Jadwal & Budget</h3>
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal Mulai</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date"
                                data-testid="input-start-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal Berakhir</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date"
                                data-testid="input-end-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Date Conflict Warning */}
                    {hasDateConflict && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4" data-testid="alert-date-conflict">
                        <div className="flex items-start space-x-3">
                          <FaTimesCircle className="text-destructive mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-destructive">Tanggal Tidak Tersedia</p>
                            <p className="text-xs text-destructive/80 mt-1">
                              Slot ini sudah dipesan untuk periode yang dipilih. Silakan pilih tanggal lain.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Booked Dates Info */}
                    {bookedDates.length > 0 && (
                      <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <p className="text-sm font-medium text-foreground mb-2">Periode yang Sudah Dipesan:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {bookedDates.map((booked, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              {new Date(booked.startDate).toLocaleDateString('id-ID')} - {new Date(booked.endDate).toLocaleDateString('id-ID')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Maksimal</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                              <Input 
                                value={formatRupiah(field.value)}
                                onChange={handleBudgetChange}
                                type="text"
                                placeholder="5.000.000"
                                className="pl-12"
                                data-testid="input-budget"
                              />
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-2">Budget minimum: Rp 500.000</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {paymentType === 'view' && (
                      <FormField
                        control={form.control}
                        name="targetViews"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Tayangan (opsional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                placeholder="100000"
                                data-testid="input-target-views"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={createAdMutation.isPending || hasDateConflict}
                    data-testid="button-submit-ad"
                    className="px-6"
                  >
                    {createAdMutation.isPending ? 'Mengirim...' : hasDateConflict ? 'Tanggal Tidak Tersedia' : 'Submit Iklan'}
                    <FaArrowRight className="ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right Column: Summary */}
              <div className="space-y-6">
                <Card className="p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Ketersediaan Slot</h3>
                  
                  {/* Slot Type Filter */}
                  <Tabs value={slotTypeFilter} onValueChange={setSlotTypeFilter} className="mb-4">
                    <TabsList className="grid w-full grid-cols-5" data-testid="tabs-slot-filter">
                      <TabsTrigger value="all" data-testid="tab-all">Semua</TabsTrigger>
                      <TabsTrigger value="banner" data-testid="tab-banner">Banner</TabsTrigger>
                      <TabsTrigger value="sidebar" data-testid="tab-sidebar">Sidebar</TabsTrigger>
                      <TabsTrigger value="inline" data-testid="tab-inline">Inline</TabsTrigger>
                      <TabsTrigger value="popup" data-testid="tab-popup">Popup</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-3">
                    {filteredSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Tidak ada slot tersedia untuk jenis iklan ini</p>
                    ) : (
                      filteredSlots.map((slot: any) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-foreground">{slot.name}</p>
                            <p className="text-xs text-muted-foreground">Posisi: {slot.position}</p>
                          </div>
                          {slot.isAvailable ? (
                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                              <FaCheckCircle className="inline mr-1" />Tersedia
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
                              <FaTimesCircle className="inline mr-1" />Penuh
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {estimate.total > 0 && (
                    <>
                      <div className="mt-5 pt-5 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Estimasi Pembayaran</h4>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Durasi</span>
                            <span className="font-medium text-foreground font-mono">{estimate.days} hari</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Harga per hari</span>
                            <span className="font-medium text-foreground font-mono">Rp {estimate.pricePerDay.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pajak (11%)</span>
                            <span className="font-medium text-foreground font-mono">Rp {estimate.tax.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-foreground">Total</span>
                            <span className="text-2xl font-bold text-primary font-mono" data-testid="text-total-cost">
                              Rp {Math.round(estimate.total).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
