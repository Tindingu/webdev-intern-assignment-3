-- DropIndex
DROP INDEX IF EXISTS "exam_results_group_b_total_idx";

-- DropIndex
DROP INDEX IF EXISTS "exam_results_group_c_total_idx";

-- DropIndex
DROP INDEX IF EXISTS "exam_results_group_d_total_idx";

-- AlterTable
ALTER TABLE "exam_results"
  DROP COLUMN IF EXISTS "group_b_total",
  DROP COLUMN IF EXISTS "group_c_total",
  DROP COLUMN IF EXISTS "group_d_total";
