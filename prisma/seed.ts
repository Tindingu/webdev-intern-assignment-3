import { createReadStream } from "node:fs";
import path from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";
import { SubjectService } from "../src/lib/subjects/subject-service";

type CsvRow = {
  sbd: string;
  toan: string;
  ngu_van: string;
  ngoai_ngu: string;
  vat_li: string;
  hoa_hoc: string;
  sinh_hoc: string;
  lich_su: string;
  dia_li: string;
  gdcd: string;
  ma_ngoai_ngu: string;
};

const prisma = new PrismaClient();
const subjectService = new SubjectService();
const batchSize = Number(process.env.SEED_BATCH_SIZE ?? 5000);
const skipRows = Number(process.env.SEED_SKIP_ROWS ?? 0);

function parseDecimal(value: string): Prisma.Decimal | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const score = new Prisma.Decimal(normalized);
  if (score.lessThan(0) || score.greaterThan(10)) {
    throw new Error(`Invalid score "${value}"`);
  }

  return score;
}

function parseCsvLine(line: string): CsvRow {
  const columns = line.split(",");

  if (columns.length !== 11) {
    throw new Error(`Invalid CSV row with ${columns.length} columns: ${line}`);
  }

  return {
    sbd: columns[0],
    toan: columns[1],
    ngu_van: columns[2],
    ngoai_ngu: columns[3],
    vat_li: columns[4],
    hoa_hoc: columns[5],
    sinh_hoc: columns[6],
    lich_su: columns[7],
    dia_li: columns[8],
    gdcd: columns[9],
    ma_ngoai_ngu: columns[10]
  };
}

function buildExamResult(row: CsvRow): Prisma.ExamResultCreateManyInput {
  const toan = parseDecimal(row.toan);
  const nguVan = parseDecimal(row.ngu_van);
  const ngoaiNgu = parseDecimal(row.ngoai_ngu);
  const vatLi = parseDecimal(row.vat_li);
  const hoaHoc = parseDecimal(row.hoa_hoc);
  const sinhHoc = parseDecimal(row.sinh_hoc);
  const lichSu = parseDecimal(row.lich_su);
  const diaLi = parseDecimal(row.dia_li);
  const gdcd = parseDecimal(row.gdcd);

  const result = {
    sbd: row.sbd,
    toan,
    nguVan,
    ngoaiNgu,
    vatLi,
    hoaHoc,
    sinhHoc,
    lichSu,
    diaLi,
    gdcd,
    maNgoaiNgu: row.ma_ngoai_ngu || null
  };

  return result;
}

async function flushBatch(batch: Prisma.ExamResultCreateManyInput[]) {
  if (batch.length === 0) {
    return;
  }

  await prisma.examResult.createMany({
    data: batch,
    skipDuplicates: true
  });
}

async function* readCsvLines(filePath: string) {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  let remainder = "";

  for await (const chunk of stream) {
    const lines = `${remainder}${chunk}`.split(/\r?\n/);
    remainder = lines.pop() ?? "";

    for (const line of lines) {
      if (line.length > 0) {
        yield line;
      }
    }
  }

  if (remainder.length > 0) {
    yield remainder;
  }
}

async function seedExamResults() {
  const datasetPath = path.join(
    process.cwd(),
    "dataset",
    "diem_thi_thpt_2024.csv"
  );

  let isHeader = true;
  let processed = 0;
  let skipped = 0;
  let batch: Prisma.ExamResultCreateManyInput[] = [];

  for await (const line of readCsvLines(datasetPath)) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    if (skipped < skipRows) {
      skipped += 1;
      continue;
    }

    const row = parseCsvLine(line);
    batch.push(buildExamResult(row));
    processed += 1;

    if (batch.length >= batchSize) {
      await flushBatch(batch);
      batch = [];
      console.log(`Imported ${processed.toLocaleString()} rows`);
    }
  }

  await flushBatch(batch);
  if (skipped > 0) {
    console.log(`Skipped ${skipped.toLocaleString()} existing rows`);
  }
  console.log(`Imported ${processed.toLocaleString()} rows in total`);
}

async function seedScoreReports() {
  const reports = await subjectService.buildScoreReports(prisma);

  await prisma.scoreReport.deleteMany();
  await prisma.scoreReport.createMany({
    data: reports
  });

  console.log(`Generated ${reports.length} score reports`);
}

async function seedTopGroupReports() {
  await prisma.$executeRaw`TRUNCATE TABLE "top_group_reports" RESTART IDENTITY`;

  await prisma.$executeRaw`
    INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
    SELECT 'A', ROW_NUMBER() OVER (ORDER BY ("toan" + "vat_li" + "hoa_hoc") DESC, "sbd" ASC), "sbd", "toan", "vat_li", "hoa_hoc", "toan" + "vat_li" + "hoa_hoc"
    FROM "exam_results"
    WHERE "toan" IS NOT NULL AND "vat_li" IS NOT NULL AND "hoa_hoc" IS NOT NULL
    ORDER BY ("toan" + "vat_li" + "hoa_hoc") DESC, "sbd" ASC
    LIMIT 10
  `;

  await prisma.$executeRaw`
    INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
    SELECT 'B', ROW_NUMBER() OVER (ORDER BY ("toan" + "hoa_hoc" + "sinh_hoc") DESC, "sbd" ASC), "sbd", "toan", "hoa_hoc", "sinh_hoc", "toan" + "hoa_hoc" + "sinh_hoc"
    FROM "exam_results"
    WHERE "toan" IS NOT NULL AND "hoa_hoc" IS NOT NULL AND "sinh_hoc" IS NOT NULL
    ORDER BY ("toan" + "hoa_hoc" + "sinh_hoc") DESC, "sbd" ASC
    LIMIT 10
  `;

  await prisma.$executeRaw`
    INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
    SELECT 'C', ROW_NUMBER() OVER (ORDER BY ("ngu_van" + "lich_su" + "dia_li") DESC, "sbd" ASC), "sbd", "ngu_van", "lich_su", "dia_li", "ngu_van" + "lich_su" + "dia_li"
    FROM "exam_results"
    WHERE "ngu_van" IS NOT NULL AND "lich_su" IS NOT NULL AND "dia_li" IS NOT NULL
    ORDER BY ("ngu_van" + "lich_su" + "dia_li") DESC, "sbd" ASC
    LIMIT 10
  `;

  await prisma.$executeRaw`
    INSERT INTO "top_group_reports" ("group", "rank", "sbd", "subject_one", "subject_two", "subject_three", "total")
    SELECT 'D', ROW_NUMBER() OVER (ORDER BY ("toan" + "ngu_van" + "ngoai_ngu") DESC, "sbd" ASC), "sbd", "toan", "ngu_van", "ngoai_ngu", "toan" + "ngu_van" + "ngoai_ngu"
    FROM "exam_results"
    WHERE "toan" IS NOT NULL AND "ngu_van" IS NOT NULL AND "ngoai_ngu" IS NOT NULL
    ORDER BY ("toan" + "ngu_van" + "ngoai_ngu") DESC, "sbd" ASC
    LIMIT 10
  `;

  console.log("Generated top group reports");
}

async function main() {
  await seedExamResults();
  await seedScoreReports();
  await seedTopGroupReports();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
