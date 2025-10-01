import {
  users,
  adSlots,
  ads,
  adViews,
  type User,
  type UpsertUser,
  type AdSlot,
  type InsertAdSlot,
  type Ad,
  type InsertAd,
  type AdWithRelations,
  type AdWithAnalytics,
  type UpdateAdStatus,
  type InsertAdView,
  type AdView,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Ad Slot operations
  getAdSlots(): Promise<AdSlot[]>;
  getAvailableAdSlots(): Promise<AdSlot[]>;
  getAdSlotById(id: string): Promise<AdSlot | undefined>;
  createAdSlot(slot: InsertAdSlot): Promise<AdSlot>;
  updateAdSlotAvailability(id: string, isAvailable: number): Promise<void>;
  
  // Ad operations
  createAd(ad: InsertAd): Promise<Ad>;
  getAdById(id: string): Promise<AdWithRelations | undefined>;
  getAdsByAdvertiser(advertiserId: string): Promise<AdWithRelations[]>;
  getPendingAds(): Promise<AdWithRelations[]>;
  getActiveAds(): Promise<AdWithRelations[]>;
  getAllAds(): Promise<AdWithRelations[]>;
  updateAdStatus(id: string, data: UpdateAdStatus): Promise<Ad>;
  updateAdViews(id: string, views: number): Promise<void>;
  
  // View tracking
  trackAdView(adId: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<AdView>;
  getAdAnalytics(adId: string): Promise<{
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
  }>;
  getAdvertiserAdsWithAnalytics(advertiserId: string): Promise<AdWithAnalytics[]>;
  
  // Booking conflict checking
  getBookedDatesForSlot(slotId: string): Promise<Array<{ startDate: Date; endDate: Date; adId: string }>>;
  checkSlotAvailability(slotId: string, startDate: Date, endDate: Date): Promise<boolean>;
  
  // Statistics
  getStatistics(): Promise<{
    pendingCount: number;
    activeCount: number;
    advertiserCount: number;
    monthlyRevenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Ad Slot operations
  async getAdSlots(): Promise<AdSlot[]> {
    return await db.select().from(adSlots);
  }

  async getAvailableAdSlots(): Promise<AdSlot[]> {
    return await db.select().from(adSlots).where(eq(adSlots.isAvailable, 1));
  }

  async getAdSlotById(id: string): Promise<AdSlot | undefined> {
    const [slot] = await db.select().from(adSlots).where(eq(adSlots.id, id));
    return slot;
  }

  async createAdSlot(slot: InsertAdSlot): Promise<AdSlot> {
    const [newSlot] = await db.insert(adSlots).values(slot).returning();
    return newSlot;
  }

  async updateAdSlotAvailability(id: string, isAvailable: number): Promise<void> {
    await db.update(adSlots).set({ isAvailable }).where(eq(adSlots.id, id));
  }

  // Ad operations
  async createAd(ad: InsertAd): Promise<Ad> {
    const [newAd] = await db.insert(ads).values(ad).returning();
    return newAd;
  }

  async getAdById(id: string): Promise<AdWithRelations | undefined> {
    const [ad] = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
      .where(eq(ads.id, id));

    if (!ad) return undefined;

    return {
      ...ad.ads,
      advertiser: ad.users!,
      slot: ad.ad_slots!,
    };
  }

  async getAdsByAdvertiser(advertiserId: string): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
      .where(eq(ads.advertiserId, advertiserId))
      .orderBy(desc(ads.createdAt));

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slot: r.ad_slots!,
    }));
  }

  async getPendingAds(): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
      .where(eq(ads.status, 'pending'))
      .orderBy(desc(ads.createdAt));

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slot: r.ad_slots!,
    }));
  }

  async getActiveAds(): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
      .where(eq(ads.status, 'active'))
      .orderBy(desc(ads.createdAt));

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slot: r.ad_slots!,
    }));
  }

  async getAllAds(): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
      .orderBy(desc(ads.createdAt));

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slot: r.ad_slots!,
    }));
  }

  async updateAdStatus(id: string, data: UpdateAdStatus): Promise<Ad> {
    const [updatedAd] = await db
      .update(ads)
      .set({
        status: data.status,
        rejectionReason: data.rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, id))
      .returning();
    return updatedAd;
  }

  async updateAdViews(id: string, views: number): Promise<void> {
    await db
      .update(ads)
      .set({ currentViews: views })
      .where(eq(ads.id, id));
  }

  // View tracking
  async trackAdView(adId: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<AdView> {
    const [view] = await db.insert(adViews).values({
      adId,
      ipAddress,
      userAgent,
      referrer,
    }).returning();

    // Update current views count
    await db.update(ads)
      .set({ currentViews: sql`${ads.currentViews} + 1` })
      .where(eq(ads.id, adId));

    return view;
  }

  async getAdAnalytics(adId: string): Promise<{
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(eq(adViews.adId, adId));

    const [today] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(and(eq(adViews.adId, adId), gte(adViews.viewedAt, startOfDay)));

    const [week] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(and(eq(adViews.adId, adId), gte(adViews.viewedAt, startOfWeek)));

    const [month] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(and(eq(adViews.adId, adId), gte(adViews.viewedAt, startOfMonth)));

    return {
      totalViews: total?.count || 0,
      viewsToday: today?.count || 0,
      viewsThisWeek: week?.count || 0,
      viewsThisMonth: month?.count || 0,
    };
  }

  async getAdvertiserAdsWithAnalytics(advertiserId: string): Promise<AdWithAnalytics[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const results = await db
      .select({
        ad: ads,
        advertiser: users,
        slot: adSlots,
        viewCount: sql<number>`count(${adViews.id})::int`,
        viewsToday: sql<number>`count(case when ${adViews.viewedAt} >= ${startOfDay.toISOString()} then 1 end)::int`,
      })
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .leftJoin(adSlots, eq(ads.slotId, adSlots.id))
      .leftJoin(adViews, eq(ads.id, adViews.adId))
      .where(eq(ads.advertiserId, advertiserId))
      .groupBy(ads.id, users.id, adSlots.id)
      .orderBy(desc(ads.createdAt));

    return results.map(r => ({
      ...r.ad,
      advertiser: r.advertiser!,
      slot: r.slot!,
      viewCount: r.viewCount || 0,
      viewsToday: r.viewsToday || 0,
    }));
  }

  // Booking conflict checking
  async getBookedDatesForSlot(slotId: string): Promise<Array<{ startDate: Date; endDate: Date; adId: string }>> {
    const bookedAds = await db
      .select({
        adId: ads.id,
        startDate: ads.startDate,
        endDate: ads.endDate,
      })
      .from(ads)
      .where(
        and(
          eq(ads.slotId, slotId),
          sql`${ads.status} IN ('pending', 'approved', 'active')`
        )
      );

    return bookedAds.map(ad => ({
      adId: ad.adId,
      startDate: ad.startDate,
      endDate: ad.endDate,
    }));
  }

  async checkSlotAvailability(slotId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingAds = await db
      .select({ id: ads.id })
      .from(ads)
      .where(
        and(
          eq(ads.slotId, slotId),
          sql`${ads.status} IN ('pending', 'approved', 'active')`,
          sql`(${ads.startDate}, ${ads.endDate}) OVERLAPS (${startDate}::date, ${endDate}::date)`
        )
      )
      .limit(1);

    return conflictingAds.length === 0;
  }

  // Statistics
  async getStatistics(): Promise<{
    pendingCount: number;
    activeCount: number;
    advertiserCount: number;
    monthlyRevenue: string;
  }> {
    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ads)
      .where(eq(ads.status, 'pending'));

    const [activeResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ads)
      .where(eq(ads.status, 'active'));

    const [advertiserResult] = await db
      .select({ count: sql<number>`count(distinct ${users.id})::int` })
      .from(users)
      .where(eq(users.role, 'advertiser'));

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [revenueResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(${ads.actualCost}), 0)::text`
      })
      .from(ads)
      .where(
        and(
          gte(ads.createdAt, currentMonth),
          eq(ads.status, 'active')
        )
      );

    return {
      pendingCount: pendingResult?.count || 0,
      activeCount: activeResult?.count || 0,
      advertiserCount: advertiserResult?.count || 0,
      monthlyRevenue: revenueResult?.total || '0',
    };
  }
}

export const storage = new DatabaseStorage();
