import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertAdSchema, updateAdStatusSchema, insertAdSlotSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object storage endpoints for ad images
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Ad Slot endpoints
  app.get("/api/ad-slots", isAuthenticated, async (req, res) => {
    try {
      const slots = await storage.getAdSlots();
      res.json(slots);
    } catch (error) {
      console.error("Error fetching ad slots:", error);
      res.status(500).json({ message: "Failed to fetch ad slots" });
    }
  });

  app.get("/api/ad-slots/available", isAuthenticated, async (req, res) => {
    try {
      const slots = await storage.getAvailableAdSlots();
      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ message: "Failed to fetch available slots" });
    }
  });

  app.get("/api/ad-slots/:slotId/booked-dates", isAuthenticated, async (req, res) => {
    try {
      const { slotId } = req.params;
      const bookedDates = await storage.getBookedDatesForSlot(slotId);
      res.json(bookedDates);
    } catch (error) {
      console.error("Error fetching booked dates:", error);
      res.status(500).json({ message: "Failed to fetch booked dates" });
    }
  });

  app.post("/api/ad-slots", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    try {
      const validatedData = insertAdSlotSchema.parse(req.body);
      const slot = await storage.createAdSlot(validatedData);
      res.json(slot);
    } catch (error) {
      console.error("Error creating ad slot:", error);
      res.status(400).json({ message: "Invalid ad slot data" });
    }
  });

  // Ad endpoints
  app.post("/api/ads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAdSchema.parse({
        ...req.body,
        advertiserId: userId,
      });

      // Check for booking conflicts
      const isAvailable = await storage.checkSlotAvailability(
        validatedData.slotId,
        validatedData.startDate,
        validatedData.endDate
      );

      if (!isAvailable) {
        return res.status(409).json({ 
          message: "Slot tidak tersedia untuk tanggal yang dipilih. Sudah ada iklan lain yang memesan slot ini pada periode tersebut." 
        });
      }

      // Set image ACL policy after upload
      if (req.body.imageUrl) {
        const objectStorageService = new ObjectStorageService();
        const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
          req.body.imageUrl,
          {
            owner: userId,
            visibility: "public", // Ad images should be public
          }
        );
        validatedData.imageUrl = normalizedPath;
      }

      const ad = await storage.createAd(validatedData);
      res.json(ad);
    } catch (error) {
      console.error("Error creating ad:", error);
      res.status(400).json({ message: "Invalid ad data" });
    }
  });

  app.get("/api/ads/my-ads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ads = await storage.getAdsByAdvertiser(userId);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching advertiser ads:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.get("/api/ads/my-ads-analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const adsWithAnalytics = await storage.getAdvertiserAdsWithAnalytics(userId);
      res.json(adsWithAnalytics);
    } catch (error) {
      console.error("Error fetching ads with analytics:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.get("/api/ads/pending", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    try {
      const ads = await storage.getPendingAds();
      res.json(ads);
    } catch (error) {
      console.error("Error fetching pending ads:", error);
      res.status(500).json({ message: "Failed to fetch pending ads" });
    }
  });

  app.get("/api/ads/active", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    try {
      const ads = await storage.getActiveAds();
      res.json(ads);
    } catch (error) {
      console.error("Error fetching active ads:", error);
      res.status(500).json({ message: "Failed to fetch active ads" });
    }
  });

  app.get("/api/ads/all", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error) {
      console.error("Error fetching all ads:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.get("/api/ads/:id", isAuthenticated, async (req, res) => {
    try {
      const ad = await storage.getAdById(req.params.id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      console.error("Error fetching ad:", error);
      res.status(500).json({ message: "Failed to fetch ad" });
    }
  });

  app.patch("/api/ads/:id/status", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    try {
      const validatedData = updateAdStatusSchema.parse(req.body);
      const ad = await storage.updateAdStatus(req.params.id, validatedData);
      res.json(ad);
    } catch (error) {
      console.error("Error updating ad status:", error);
      res.status(400).json({ message: "Invalid status data" });
    }
  });

  // Statistics endpoint (admin only)
  app.get("/api/statistics", isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // View tracking endpoints
  app.post("/api/ads/:id/track-view", async (req: any, res) => {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const referrer = req.headers['referer'] || req.headers['referrer'];

      const view = await storage.trackAdView(id, ipAddress, userAgent, referrer);
      res.json(view);
    } catch (error) {
      console.error("Error tracking ad view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  app.get("/api/ads/:id/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Get ad to verify ownership or admin
      const ad = await storage.getAdById(id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      const user = await storage.getUser(userId);
      if (ad.advertiserId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const analytics = await storage.getAdAnalytics(id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching ad analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
