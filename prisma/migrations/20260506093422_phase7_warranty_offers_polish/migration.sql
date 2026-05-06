-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "orderId" TEXT,
    "orderItemId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "reason" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "photos" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminNote" TEXT NOT NULL DEFAULT '',
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Claim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "proposedPrice" INTEGER NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminNote" TEXT NOT NULL DEFAULT '',
    "counterPrice" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "longDescription" TEXT NOT NULL DEFAULT '',
    "basePrice" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "compareAtPrice" INTEGER,
    "thumbnail" TEXT,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "kind" TEXT NOT NULL DEFAULT 'subscription',
    "durationDays" INTEGER,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "deliveryMode" TEXT NOT NULL DEFAULT 'manual',
    "deliveryNotes" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "landingPageId" TEXT,
    "vendorId" TEXT,
    "categoryId" TEXT,
    "scarcityEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scarcityText" TEXT,
    "scarcityCount" INTEGER,
    "urgencyEndsAt" DATETIME,
    "warrantyDays" INTEGER,
    "allowQuantity" BOOLEAN NOT NULL DEFAULT true,
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "minOfferPrice" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("badge", "basePrice", "categoryId", "compareAtPrice", "createdAt", "currency", "deliveryMode", "deliveryNotes", "description", "durationDays", "featured", "gallery", "id", "kind", "landingPageId", "longDescription", "name", "order", "scarcityCount", "scarcityEnabled", "scarcityText", "seoDescription", "seoTitle", "slug", "tagline", "thumbnail", "updatedAt", "urgencyEndsAt", "vendorId", "visible") SELECT "badge", "basePrice", "categoryId", "compareAtPrice", "createdAt", "currency", "deliveryMode", "deliveryNotes", "description", "durationDays", "featured", "gallery", "id", "kind", "landingPageId", "longDescription", "name", "order", "scarcityCount", "scarcityEnabled", "scarcityText", "seoDescription", "seoTitle", "slug", "tagline", "thumbnail", "updatedAt", "urgencyEndsAt", "vendorId", "visible" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE TABLE "new_Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "brandName" TEXT NOT NULL DEFAULT 'Salma',
    "tagline" TEXT NOT NULL DEFAULT 'Premium digital subscriptions, services & boosts.',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0047FF',
    "accentColor" TEXT NOT NULL DEFAULT '#000000',
    "supportEmail" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "defaultLocale" TEXT NOT NULL DEFAULT 'fr',
    "lsApiKey" TEXT,
    "lsStoreId" TEXT,
    "lsWebhookSecret" TEXT,
    "paymentsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tgBotToken" TEXT,
    "tgChatId" TEXT,
    "tgEnabled" BOOLEAN NOT NULL DEFAULT false,
    "waNumber" TEXT,
    "waEnabled" BOOLEAN NOT NULL DEFAULT false,
    "waRedirectMode" TEXT NOT NULL DEFAULT 'after',
    "waPrefilledMessage" TEXT NOT NULL DEFAULT 'Hello, I''d like to order: {product} ({variant}) — Order {order}.',
    "heroTitle" TEXT NOT NULL DEFAULT 'One platform.
Every digital subscription.',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Streaming, AI, gaming, social — premium quality, instant delivery.',
    "heroCtaLabel" TEXT NOT NULL DEFAULT 'Browse the catalog',
    "heroCtaHref" TEXT NOT NULL DEFAULT '/catalog',
    "marketplaceEnabled" BOOLEAN NOT NULL DEFAULT false,
    "vendorSignupOpen" BOOLEAN NOT NULL DEFAULT false,
    "adminEmail" TEXT,
    "warrantyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "warrantyDefaultDays" INTEGER NOT NULL DEFAULT 7,
    "claimsRequirePhoto" BOOLEAN NOT NULL DEFAULT true,
    "claimsAllowMessage" BOOLEAN NOT NULL DEFAULT true,
    "claimsMaxPhotos" INTEGER NOT NULL DEFAULT 4,
    "orderGroupingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "allowQuantityByDefault" BOOLEAN NOT NULL DEFAULT true,
    "negotiableEnabled" BOOLEAN NOT NULL DEFAULT false,
    "depthEffectsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "scrollRevealEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tgNotifyOnNewOrder" BOOLEAN NOT NULL DEFAULT true,
    "tgNotifyOnPaid" BOOLEAN NOT NULL DEFAULT true,
    "tgNotifyOnClaim" BOOLEAN NOT NULL DEFAULT true,
    "tgNotifyOnOffer" BOOLEAN NOT NULL DEFAULT true,
    "tgNotifyOnError" BOOLEAN NOT NULL DEFAULT false,
    "tgOrderTemplate" TEXT NOT NULL DEFAULT '🛒 New order {order}
From: {customer}
Items:
{items}
Total: {total}',
    "tgPaidTemplate" TEXT NOT NULL DEFAULT '💳 Payment received for {order}
{customer} paid {total}',
    "tgClaimTemplate" TEXT NOT NULL DEFAULT '🛡️ New warranty claim {claim}
Customer: {customer}
Reason: {reason}',
    "tgOfferTemplate" TEXT NOT NULL DEFAULT '💬 New offer {offer}
Product: {product}
Customer: {customer}
Proposed: {price}',
    "announcementBar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Setting" ("accentColor", "adminEmail", "announcementBar", "brandName", "createdAt", "defaultCurrency", "defaultLocale", "faviconUrl", "heroCtaHref", "heroCtaLabel", "heroSubtitle", "heroTitle", "id", "logoUrl", "lsApiKey", "lsStoreId", "lsWebhookSecret", "marketplaceEnabled", "paymentsEnabled", "primaryColor", "supportEmail", "tagline", "tgBotToken", "tgChatId", "tgEnabled", "updatedAt", "vendorSignupOpen", "waEnabled", "waNumber", "waPrefilledMessage", "waRedirectMode") SELECT "accentColor", "adminEmail", "announcementBar", "brandName", "createdAt", "defaultCurrency", "defaultLocale", "faviconUrl", "heroCtaHref", "heroCtaLabel", "heroSubtitle", "heroTitle", "id", "logoUrl", "lsApiKey", "lsStoreId", "lsWebhookSecret", "marketplaceEnabled", "paymentsEnabled", "primaryColor", "supportEmail", "tagline", "tgBotToken", "tgChatId", "tgEnabled", "updatedAt", "vendorSignupOpen", "waEnabled", "waNumber", "waPrefilledMessage", "waRedirectMode" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Claim_number_key" ON "Claim"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_number_key" ON "Offer"("number");
