import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['advertiser', 'admin']);

// Ad type enum
export const adTypeEnum = pgEnum('ad_type', ['banner', 'sidebar', 'inline', 'popup']);

// Payment type enum
export const paymentTypeEnum = pgEnum('payment_type', ['period', 'view']);

// Ad status enum
export const adStatusEnum = pgEnum('ad_status', ['pending', 'approved', 'rejected', 'active', 'paused', 'completed']);

// Slot position enum
export const slotPositionEnum = pgEnum('slot_position', ['top', 'bottom', 'right', 'middle']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default('advertiser'),
  companyName: varchar("company_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ads: many(ads),
}));

// Ad slots table
export const adSlots = pgTable("ad_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  adType: adTypeEnum("ad_type").notNull(),
  position: slotPositionEnum("position").notNull(),
  location: varchar("location").notNull(), // e.g., "homepage", "article"
  isAvailable: integer("is_available").notNull().default(1), // 1 = available, 0 = not available
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  pricePerView: decimal("price_per_view", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adSlotsRelations = relations(adSlots, ({ many }) => ({
  adSlotBookings: many(adSlotBookings),
}));

// Ads table (removed slotId - now uses junction table)
export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertiserId: varchar("advertiser_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  imageUrl: varchar("image_url"),
  adType: adTypeEnum("ad_type").notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: decimal("budget", { precision: 12, scale: 2 }).notNull(),
  targetViews: integer("target_views"),
  currentViews: integer("current_views").notNull().default(0),
  status: adStatusEnum("status").notNull().default('pending'),
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 2 }).notNull(),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }).default('0'),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adsRelations = relations(ads, ({ one, many }) => ({
  advertiser: one(users, {
    fields: [ads.advertiserId],
    references: [users.id],
  }),
  adSlotBookings: many(adSlotBookings),
  views: many(adViews),
}));

// Ad Slot Bookings junction table (many-to-many between ads and ad_slots)
export const adSlotBookings = pgTable("ad_slot_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").notNull().references(() => ads.id, { onDelete: 'cascade' }),
  slotId: varchar("slot_id").notNull().references(() => adSlots.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_ad_slot_bookings_ad_id").on(table.adId),
  index("idx_ad_slot_bookings_slot_id").on(table.slotId),
  // Unique constraint to prevent duplicate bookings for same ad and slot
  unique("unique_ad_slot").on(table.adId, table.slotId),
]);

export const adSlotBookingsRelations = relations(adSlotBookings, ({ one }) => ({
  ad: one(ads, {
    fields: [adSlotBookings.adId],
    references: [ads.id],
  }),
  slot: one(adSlots, {
    fields: [adSlotBookings.slotId],
    references: [adSlots.id],
  }),
}));

// Ad Views table for tracking impressions
export const adViews = pgTable("ad_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").notNull().references(() => ads.id, { onDelete: 'cascade' }),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  referrer: varchar("referrer"),
}, (table) => [
  index("idx_ad_views_ad_id").on(table.adId),
  index("idx_ad_views_viewed_at").on(table.viewedAt),
]);

export const adViewsRelations = relations(adViews, ({ one }) => ({
  ad: one(ads, {
    fields: [adViews.adId],
    references: [ads.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  companyName: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertAdSlotSchema = createInsertSchema(adSlots).omit({
  id: true,
  createdAt: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentViews: true,
  actualCost: true,
  status: true,
}).extend({
  slotIds: z.array(z.string()).min(1, "At least one slot must be selected"),
  startDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  endDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  budget: z.number().or(z.string()).transform((val) => typeof val === 'string' ? parseFloat(val) : val),
  estimatedCost: z.number().or(z.string()).transform((val) => typeof val === 'string' ? parseFloat(val) : val),
});

export const insertAdSlotBookingSchema = createInsertSchema(adSlotBookings).omit({
  id: true,
  createdAt: true,
});

export const insertAdViewSchema = createInsertSchema(adViews).omit({
  id: true,
  viewedAt: true,
});

export const updateAdStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'active', 'paused']),
  rejectionReason: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AdSlot = typeof adSlots.$inferSelect;
export type InsertAdSlot = z.infer<typeof insertAdSlotSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type AdSlotBooking = typeof adSlotBookings.$inferSelect;
export type InsertAdSlotBooking = z.infer<typeof insertAdSlotBookingSchema>;
export type AdView = typeof adViews.$inferSelect;
export type InsertAdView = z.infer<typeof insertAdViewSchema>;
export type UpdateAdStatus = z.infer<typeof updateAdStatusSchema>;

// Extended types with relations
export type AdWithRelations = Ad & {
  advertiser: User;
  slots: AdSlot[];
};

export type AdWithAnalytics = Ad & {
  advertiser: User;
  slots: AdSlot[];
  viewCount: number;
  viewsToday: number;
};
