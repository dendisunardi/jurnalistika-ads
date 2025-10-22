-- Seed data for Jurnalistika Ads Platform
-- Run this after creating the schema to populate initial data

-- ============================================================================
-- AD SLOTS - Essential predefined advertising slots
-- ============================================================================

-- Banner ads (top of pages)
INSERT INTO ad_slots (id, name, ad_type, position, location, is_available, price_per_day, price_per_view) VALUES
('slot-banner-home-top', 'Homepage Banner Top', 'banner', 'top', 'homepage', 1, 50.00, 0.0050),
('slot-banner-articles-top', 'Articles Banner Top', 'banner', 'top', 'articles', 1, 40.00, 0.0040),
('slot-banner-category-top', 'Category Banner Top', 'banner', 'top', 'category', 1, 35.00, 0.0035);

-- Sidebar ads
INSERT INTO ad_slots (id, name, ad_type, position, location, is_available, price_per_day, price_per_view) VALUES
('slot-sidebar-home-right', 'Homepage Sidebar Right', 'sidebar', 'right', 'homepage', 1, 30.00, 0.0030),
('slot-sidebar-articles-right', 'Articles Sidebar Right', 'sidebar', 'right', 'articles', 1, 25.00, 0.0025),
('slot-sidebar-search-right', 'Search Results Sidebar', 'sidebar', 'right', 'search', 1, 20.00, 0.0020);

-- Inline ads (within content)
INSERT INTO ad_slots (id, name, ad_type, position, location, is_available, price_per_day, price_per_view) VALUES
('slot-inline-article-middle', 'Article Content Middle', 'inline', 'middle', 'article-content', 1, 45.00, 0.0045),
('slot-inline-feed-middle', 'News Feed Middle', 'inline', 'middle', 'news-feed', 1, 35.00, 0.0035);

-- Footer/bottom ads
INSERT INTO ad_slots (id, name, ad_type, position, location, is_available, price_per_day, price_per_view) VALUES
('slot-banner-home-bottom', 'Homepage Banner Bottom', 'banner', 'bottom', 'homepage', 1, 25.00, 0.0025),
('slot-banner-articles-bottom', 'Articles Banner Bottom', 'banner', 'bottom', 'articles', 1, 20.00, 0.0020);

-- Premium popup slots (higher pricing)
INSERT INTO ad_slots (id, name, ad_type, position, location, is_available, price_per_day, price_per_view) VALUES
('slot-popup-homepage', 'Homepage Popup', 'popup', 'middle', 'homepage', 1, 80.00, 0.0080),
('slot-popup-breaking-news', 'Breaking News Popup', 'popup', 'top', 'breaking-news', 1, 100.00, 0.0100);

-- ============================================================================
-- USERS - Admin and sample users
-- ============================================================================

-- Admin user
INSERT INTO users (id, email, first_name, last_name, role, company_name, created_at, updated_at) VALUES
('admin-001', 'admin@jurnalistika.com', 'Admin', 'User', 'admin', 'Jurnalistika Media', NOW(), NOW());

-- Sample advertiser users
INSERT INTO users (id, email, first_name, last_name, role, company_name, created_at, updated_at) VALUES
('user-001', 'marketing@techcorp.com', 'Sarah', 'Johnson', 'advertiser', 'TechCorp Solutions', NOW(), NOW()),
('user-002', 'ads@localstore.com', 'Mike', 'Chen', 'advertiser', 'Local Store Chain', NOW(), NOW()),
('user-003', 'promo@startup.io', 'Emma', 'Rodriguez', 'advertiser', 'Startup Innovations', NOW(), NOW()),
('user-004', 'brand@fashion.com', 'David', 'Kim', 'advertiser', 'Fashion Forward', NOW(), NOW());

-- ============================================================================
-- SAMPLE ADS - For demonstration and testing
-- ============================================================================

-- Active ads
INSERT INTO ads (id, advertiser_id, title, ad_type, payment_type, start_date, end_date, budget, target_views, current_views, status, estimated_cost, actual_cost, created_at, updated_at) VALUES
('ad-001', 'user-001', 'TechCorp New Product Launch', 'banner', 'period', NOW(), NOW() + INTERVAL '30 days', 1500.00, NULL, 1250, 'active', 1500.00, 1200.00, NOW(), NOW()),
('ad-002', 'user-002', 'Local Store Summer Sale', 'sidebar', 'view', NOW(), NOW() + INTERVAL '14 days', 800.00, 20000, 8500, 'active', 800.00, 340.00, NOW(), NOW()),
('ad-003', 'user-003', 'Startup App Download', 'inline', 'view', NOW(), NOW() + INTERVAL '21 days', 1200.00, 30000, 12000, 'active', 1200.00, 480.00, NOW(), NOW());

-- Pending ads (awaiting approval)
INSERT INTO ads (id, advertiser_id, title, ad_type, payment_type, start_date, end_date, budget, target_views, current_views, status, estimated_cost, actual_cost, created_at, updated_at) VALUES
('ad-004', 'user-004', 'Fashion Week Collection', 'popup', 'period', NOW() + INTERVAL '7 days', NOW() + INTERVAL '37 days', 2400.00, NULL, 0, 'pending', 2400.00, 0.00, NOW(), NOW()),
('ad-005', 'user-001', 'TechCorp Webinar Series', 'banner', 'view', NOW() + INTERVAL '3 days', NOW() + INTERVAL '17 days', 600.00, 15000, 0, 'pending', 600.00, 0.00, NOW(), NOW());

-- Completed ads
INSERT INTO ads (id, advertiser_id, title, ad_type, payment_type, start_date, end_date, budget, target_views, current_views, status, estimated_cost, actual_cost, created_at, updated_at) VALUES
('ad-006', 'user-002', 'Local Store Spring Campaign', 'sidebar', 'period', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days', 900.00, NULL, 18500, 'completed', 900.00, 900.00, NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days');

-- ============================================================================
-- AD SLOT BOOKINGS - Link ads to slots
-- ============================================================================

-- Active bookings
INSERT INTO ad_slot_bookings (id, ad_id, slot_id, created_at) VALUES
('booking-001', 'ad-001', 'slot-banner-home-top', NOW()),
('booking-002', 'ad-002', 'slot-sidebar-articles-right', NOW()),
('booking-003', 'ad-003', 'slot-inline-article-middle', NOW()),
('booking-004', 'ad-006', 'slot-sidebar-home-right', NOW() - INTERVAL '45 days');

-- ============================================================================
-- AD VIEWS - Sample view tracking data
-- ============================================================================

-- Sample ad views for analytics (last 7 days)
INSERT INTO ad_views (id, ad_id, viewed_at, ip_address, user_agent, referrer) VALUES
-- Views for ad-001 (TechCorp banner)
('view-001', 'ad-001', NOW() - INTERVAL '1 hour', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://google.com'),
('view-002', 'ad-001', NOW() - INTERVAL '2 hours', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'https://facebook.com'),
('view-003', 'ad-001', NOW() - INTERVAL '3 hours', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', 'direct'),

-- Views for ad-002 (Local Store sidebar)
('view-004', 'ad-002', NOW() - INTERVAL '30 minutes', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://twitter.com'),
('view-005', 'ad-002', NOW() - INTERVAL '1 hour', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0', 'https://google.com'),

-- Views for ad-003 (Startup inline)
('view-006', 'ad-003', NOW() - INTERVAL '45 minutes', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://linkedin.com'),
('view-007', 'ad-003', NOW() - INTERVAL '2 hours', '192.168.1.106', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'direct');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these to verify the data was inserted correctly:

-- SELECT 'Ad Slots Count:' as info, COUNT(*) as count FROM ad_slots;
-- SELECT 'Users Count:' as info, COUNT(*) as count FROM users;
-- SELECT 'Ads Count:' as info, COUNT(*) as count FROM ads;
-- SELECT 'Bookings Count:' as info, COUNT(*) as count FROM ad_slot_bookings;
-- SELECT 'Views Count:' as info, COUNT(*) as count FROM ad_views;

-- SELECT 'Available Ad Slots:' as info;
-- SELECT name, ad_type, position, location, price_per_day, price_per_view 
-- FROM ad_slots 
-- WHERE is_available = 1 
-- ORDER BY ad_type, position;

-- SELECT 'Active Ads:' as info;
-- SELECT a.title, u.company_name, a.status, a.budget, a.current_views
-- FROM ads a
-- JOIN users u ON a.advertiser_id = u.id
-- WHERE a.status = 'active'
-- ORDER BY a.created_at DESC;