-- CreateTable
CREATE TABLE "exam_results" (
    "id" SERIAL NOT NULL,
    "sbd" TEXT NOT NULL,
    "toan" DECIMAL(4,2),
    "ngu_van" DECIMAL(4,2),
    "ngoai_ngu" DECIMAL(4,2),
    "vat_li" DECIMAL(4,2),
    "hoa_hoc" DECIMAL(4,2),
    "sinh_hoc" DECIMAL(4,2),
    "lich_su" DECIMAL(4,2),
    "dia_li" DECIMAL(4,2),
    "gdcd" DECIMAL(4,2),
    "ma_ngoai_ngu" TEXT,
    "group_a_total" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_reports" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "gte_8" INTEGER NOT NULL,
    "gte_6_lt_8" INTEGER NOT NULL,
    "gte_4_lt_6" INTEGER NOT NULL,
    "lt_4" INTEGER NOT NULL,

    CONSTRAINT "score_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_sbd_key" ON "exam_results"("sbd");

-- CreateIndex
CREATE INDEX "exam_results_group_a_total_idx" ON "exam_results"("group_a_total");

-- CreateIndex
CREATE UNIQUE INDEX "score_reports_subject_key" ON "score_reports"("subject");
