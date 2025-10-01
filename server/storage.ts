import {
  users,
  adSlots,
  ads,
  type User,
  type UpsertUser,
  type AdSlot,
  type InsertAdSlot,
  type Ad,
  type InsertAd,
  type AdWithRelations,
  type UpdateAdStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

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
