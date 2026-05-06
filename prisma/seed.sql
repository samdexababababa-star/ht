-- Idempotent dev/demo seed for Salma. Safe to run multiple times.
-- Categories ----------------------------------------------------------------
INSERT OR IGNORE INTO "Setting" ("id","updatedAt") VALUES ('default', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Category" ("id","slug","name","icon","description","visible","order","updatedAt")
VALUES
  ('cat_streaming','streaming','Streaming','streaming','Netflix, Spotify, Disney+, more.', 1, 0, CURRENT_TIMESTAMP),
  ('cat_ai','ai-tools','AI tools','ai','ChatGPT Plus, Midjourney, Claude, Cursor.', 1, 1, CURRENT_TIMESTAMP),
  ('cat_gaming','gaming','Gaming','gaming','Xbox, PSN, Steam wallet, top-ups.', 1, 2, CURRENT_TIMESTAMP),
  ('cat_growth','followers-growth','Followers & growth','followers','Instagram, TikTok, YouTube boosts.', 1, 3, CURRENT_TIMESTAMP);

-- Products ------------------------------------------------------------------
INSERT OR IGNORE INTO "Product" ("id","slug","name","tagline","description","longDescription","basePrice","compareAtPrice","currency","gallery","kind","visible","featured","badge","deliveryMode","deliveryNotes","categoryId","scarcityEnabled","scarcityText","allowQuantity","negotiable","order","updatedAt")
VALUES
  ('p_netflix','netflix-premium','Netflix Premium','4K, 4 screens, no ads.','','', 1499, 2299,'USD','[]','subscription',1,1,'BEST SELLER','manual','','cat_streaming',1,'Only 6 left at this price',1,0,0,CURRENT_TIMESTAMP),
  ('p_chatgpt','chatgpt-plus','ChatGPT Plus','GPT-5 access, fast and unlimited.','','', 1999, NULL,'USD','[]','subscription',1,1,'NEW','manual','','cat_ai',0,NULL,1,0,1,CURRENT_TIMESTAMP),
  ('p_spotify','spotify-premium','Spotify Premium','Lossless, offline, ad-free.','','', 999, NULL,'USD','[]','subscription',1,0,NULL,'manual','','cat_streaming',0,NULL,1,0,2,CURRENT_TIMESTAMP),
  ('p_ig','instagram-followers-1k','Instagram followers — 1,000 pack','Organic-looking, no drops, fast delivery.','','', 799, NULL,'USD','[]','followers',1,1,NULL,'auto','','cat_growth',0,NULL,1,1,3,CURRENT_TIMESTAMP),
  ('p_psplus','ps-plus-essential','PlayStation Plus Essential','Online play + monthly games.','','', 1099, NULL,'USD','[]','subscription',1,0,NULL,'manual','','cat_gaming',0,NULL,1,0,4,CURRENT_TIMESTAMP),
  ('p_midj','midjourney-standard','Midjourney Standard','Unlimited slow-mode generations.','','', 2999, NULL,'USD','[]','subscription',1,0,NULL,'manual','','cat_ai',0,NULL,1,0,5,CURRENT_TIMESTAMP);

-- Variants ------------------------------------------------------------------
INSERT OR IGNORE INTO "Variant" ("id","productId","name","price","compareAtPrice","durationDays","order","updatedAt") VALUES
  ('v_nf_1','p_netflix','1 month',1499,NULL,30,0,CURRENT_TIMESTAMP),
  ('v_nf_3','p_netflix','3 months',3999,NULL,90,1,CURRENT_TIMESTAMP),
  ('v_nf_12','p_netflix','12 months',13999,21900,365,2,CURRENT_TIMESTAMP),
  ('v_cg_1','p_chatgpt','1 month',1999,NULL,30,0,CURRENT_TIMESTAMP),
  ('v_cg_3','p_chatgpt','3 months',5499,NULL,90,1,CURRENT_TIMESTAMP),
  ('v_sp_1','p_spotify','1 month',999,NULL,30,0,CURRENT_TIMESTAMP),
  ('v_sp_12','p_spotify','12 months',9999,NULL,365,1,CURRENT_TIMESTAMP),
  ('v_ig_1','p_ig','1,000 followers',799,NULL,NULL,0,CURRENT_TIMESTAMP),
  ('v_ig_5','p_ig','5,000 followers',2999,NULL,NULL,1,CURRENT_TIMESTAMP),
  ('v_ig_10','p_ig','10,000 followers',4999,7999,NULL,2,CURRENT_TIMESTAMP),
  ('v_ps_1','p_psplus','1 month',1099,NULL,30,0,CURRENT_TIMESTAMP),
  ('v_ps_12','p_psplus','12 months',6999,NULL,365,1,CURRENT_TIMESTAMP),
  ('v_mj_1','p_midj','1 month',2999,NULL,30,0,CURRENT_TIMESTAMP);
