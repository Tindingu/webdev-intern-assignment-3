CREATE TABLE IF NOT EXISTS "top_group_reports" (
    "id" SERIAL NOT NULL,
    "group" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "sbd" TEXT NOT NULL,
    "subject_one" DECIMAL(4,2) NOT NULL,
    "subject_two" DECIMAL(4,2) NOT NULL,
    "subject_three" DECIMAL(4,2) NOT NULL,
    "total" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "top_group_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "top_group_reports_group_rank_key"
  ON "top_group_reports"("group", "rank");

CREATE INDEX IF NOT EXISTS "top_group_reports_group_idx"
  ON "top_group_reports"("group");

TRUNCATE TABLE "top_group_reports" RESTART IDENTITY;

INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
SELECT 'A', ROW_NUMBER() OVER (ORDER BY "group_a_total" DESC, "sbd" ASC), "sbd", "toan", "vat_li", "hoa_hoc", "group_a_total"
FROM "exam_results"
WHERE "group_a_total" IS NOT NULL
ORDER BY "group_a_total" DESC, "sbd" ASC
LIMIT 10;

INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
SELECT 'B', ROW_NUMBER() OVER (ORDER BY ("toan" + "hoa_hoc" + "sinh_hoc") DESC, "sbd" ASC), "sbd", "toan", "hoa_hoc", "sinh_hoc", "toan" + "hoa_hoc" + "sinh_hoc"
FROM "exam_results"
WHERE "toan" IS NOT NULL AND "hoa_hoc" IS NOT NULL AND "sinh_hoc" IS NOT NULL
ORDER BY ("toan" + "hoa_hoc" + "sinh_hoc") DESC, "sbd" ASC
LIMIT 10;

INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
SELECT 'C', ROW_NUMBER() OVER (ORDER BY ("ngu_van" + "lich_su" + "dia_li") DESC, "sbd" ASC), "sbd", "ngu_van", "lich_su", "dia_li", "ngu_van" + "lich_su" + "dia_li"
FROM "exam_results"
WHERE "ngu_van" IS NOT NULL AND "lich_su" IS NOT NULL AND "dia_li" IS NOT NULL
ORDER BY ("ngu_van" + "lich_su" + "dia_li") DESC, "sbd" ASC
LIMIT 10;

INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
SELECT 'D', ROW_NUMBER() OVER (ORDER BY ("toan" + "ngu_van" + "ngoai_ngu") DESC, "sbd" ASC), "sbd", "toan", "ngu_van", "ngoai_ngu", "toan" + "ngu_van" + "ngoai_ngu"
FROM "exam_results"
WHERE "toan" IS NOT NULL AND "ngu_van" IS NOT NULL AND "ngoai_ngu" IS NOT NULL
ORDER BY ("toan" + "ngu_van" + "ngoai_ngu") DESC, "sbd" ASC
LIMIT 10;
