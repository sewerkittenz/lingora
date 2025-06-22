ALTER TABLE "lessons" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_items" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "trade_offers" ALTER COLUMN "message" SET DEFAULT '';