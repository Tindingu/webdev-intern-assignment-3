-- AlterTable
ALTER TABLE "exam_results" ADD COLUMN     "group_b_total" DECIMAL(5,2),
ADD COLUMN     "group_c_total" DECIMAL(5,2),
ADD COLUMN     "group_d_total" DECIMAL(5,2);

-- CreateIndex
CREATE INDEX "exam_results_group_b_total_idx" ON "exam_results"("group_b_total");

-- CreateIndex
CREATE INDEX "exam_results_group_c_total_idx" ON "exam_results"("group_c_total");

-- CreateIndex
CREATE INDEX "exam_results_group_d_total_idx" ON "exam_results"("group_d_total");
