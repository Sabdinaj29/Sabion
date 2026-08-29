-- CreateTable
CREATE TABLE "prospects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "company_name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "origin_country" TEXT NOT NULL,
    "target_market" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_role" TEXT,
    "source" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'Sourced',
    "next_follow_up_date" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
