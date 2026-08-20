import type { Prisma, PrismaClient } from "@prisma/client";
import { subjects } from "./subject-config";
import type { ExamScoreField, SubjectCode } from "./subject";

type ReportCountRow = {
  gte8: bigint | number;
  gte6lt8: bigint | number;
  gte4lt6: bigint | number;
  lt4: bigint | number;
};

type ScoreReportInput = {
  subject: SubjectCode;
  gte8: number;
  gte6lt8: number;
  gte4lt6: number;
  lt4: number;
};

const columnByField: Record<ExamScoreField, string> = {
  toan: "toan",
  nguVan: "ngu_van",
  ngoaiNgu: "ngoai_ngu",
  vatLi: "vat_li",
  hoaHoc: "hoa_hoc",
  sinhHoc: "sinh_hoc",
  lichSu: "lich_su",
  diaLi: "dia_li",
  gdcd: "gdcd"
};

export class SubjectService {
  getAll() {
    return subjects;
  }

  findByCode(code: SubjectCode) {
    return subjects.find((subject) => subject.code === code) ?? null;
  }

  async buildScoreReports(
    prisma: PrismaClient
  ): Promise<ScoreReportInput[]> {
    const reports: ScoreReportInput[] = [];

    for (const subject of subjects) {
      const column = columnByField[subject.field];
      const rows = await prisma.$queryRawUnsafe<ReportCountRow[]>(`
        SELECT
          COUNT(*) FILTER (WHERE "${column}" >= 8) AS "gte8",
          COUNT(*) FILTER (WHERE "${column}" < 8 AND "${column}" >= 6) AS "gte6lt8",
          COUNT(*) FILTER (WHERE "${column}" < 6 AND "${column}" >= 4) AS "gte4lt6",
          COUNT(*) FILTER (WHERE "${column}" < 4) AS "lt4"
        FROM "exam_results"
        WHERE "${column}" IS NOT NULL
      `);
      const row = rows[0];

      reports.push({
        subject: subject.code,
        gte8: Number(row.gte8),
        gte6lt8: Number(row.gte6lt8),
        gte4lt6: Number(row.gte4lt6),
        lt4: Number(row.lt4)
      });
    }

    return reports;
  }

  serializeScore(score: Prisma.Decimal | null) {
    return score === null ? null : Number(score);
  }
}
