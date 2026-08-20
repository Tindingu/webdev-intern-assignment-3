DROP INDEX IF EXISTS "exam_results_group_a_total_idx";

ALTER TABLE "exam_results"
  DROP COLUMN IF EXISTS "group_a_total";
