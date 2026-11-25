-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "post" TEXT;

-- CreateTable
CREATE TABLE "CmsNotice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT 'Incubation',
    "date" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" TEXT NOT NULL DEFAULT 'High',
    "link" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsLeadership" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#0ef',
    "link" TEXT,
    "message" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsLeadership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsIncubation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "founder" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Incubated',
    "funding" TEXT,
    "website" TEXT,
    "image" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsIncubation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Flagship Event',
    "date" TEXT NOT NULL,
    "time" TEXT,
    "venue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "registrationLink" TEXT,
    "image" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsTeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'faculty',
    "post" TEXT NOT NULL,
    "email" TEXT,
    "department" TEXT,
    "image" TEXT,
    "about" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsGalleryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Events',
    "url" TEXT NOT NULL,
    "date" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsGalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsTalk" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "photo" TEXT,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsTalk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsQuery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "domain" TEXT,
    "stage" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsAbout" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "campusImage" TEXT,
    "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aboutHtml" TEXT NOT NULL,
    "visionPillars" JSONB,
    "supportSlides" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsAbout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsCategory" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'user-action',
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "CmsNotice_active_idx" ON "CmsNotice"("active");

-- CreateIndex
CREATE INDEX "CmsNotice_tag_idx" ON "CmsNotice"("tag");

-- CreateIndex
CREATE INDEX "CmsIncubation_status_idx" ON "CmsIncubation"("status");

-- CreateIndex
CREATE INDEX "CmsIncubation_sector_idx" ON "CmsIncubation"("sector");

-- CreateIndex
CREATE INDEX "CmsEvent_status_idx" ON "CmsEvent"("status");

-- CreateIndex
CREATE INDEX "CmsEvent_category_idx" ON "CmsEvent"("category");

-- CreateIndex
CREATE INDEX "CmsTeamMember_category_idx" ON "CmsTeamMember"("category");

-- CreateIndex
CREATE INDEX "CmsGalleryItem_category_idx" ON "CmsGalleryItem"("category");

-- CreateIndex
CREATE INDEX "CmsFaq_category_idx" ON "CmsFaq"("category");

-- CreateIndex
CREATE INDEX "CmsQuery_status_idx" ON "CmsQuery"("status");

-- CreateIndex
CREATE INDEX "CmsCategory_module_idx" ON "CmsCategory"("module");

-- CreateIndex
CREATE UNIQUE INDEX "CmsCategory_module_name_key" ON "CmsCategory"("module", "name");

-- CreateIndex
CREATE INDEX "SystemActivityLog_userId_idx" ON "SystemActivityLog"("userId");

-- CreateIndex
CREATE INDEX "SystemActivityLog_category_idx" ON "SystemActivityLog"("category");

-- CreateIndex
CREATE INDEX "SystemActivityLog_timestamp_idx" ON "SystemActivityLog"("timestamp");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- AddForeignKey
ALTER TABLE "SystemActivityLog" ADD CONSTRAINT "SystemActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
