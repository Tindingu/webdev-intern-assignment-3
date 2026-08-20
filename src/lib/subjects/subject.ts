import type { ExamResult, Prisma } from "@prisma/client";

export type ScoreLevel = "gte8" | "gte6lt8" | "gte4lt6" | "lt4";

export type SubjectCode =
  | "toan"
  | "ngu_van"
  | "ngoai_ngu"
  | "vat_li"
  | "hoa_hoc"
  | "sinh_hoc"
  | "lich_su"
  | "dia_li"
  | "gdcd";

export type ExamScoreField =
  | "toan"
  | "nguVan"
  | "ngoaiNgu"
  | "vatLi"
  | "hoaHoc"
  | "sinhHoc"
  | "lichSu"
  | "diaLi"
  | "gdcd";

export class Subject {
  constructor(
    public readonly code: SubjectCode,
    public readonly label: string,
    public readonly field: ExamScoreField,
    public readonly color: string
  ) {}

  extractScore(row: Pick<ExamResult, ExamScoreField>): Prisma.Decimal | null {
    return row[this.field] ?? null;
  }

  isValidScore(score: Prisma.Decimal | number | null | undefined): boolean {
    if (score === null || score === undefined) {
      return false;
    }

    const value = Number(score);
    return Number.isFinite(value) && value >= 0 && value <= 10;
  }

  classify(score: Prisma.Decimal | number): ScoreLevel {
    const value = Number(score);

    if (value >= 8) {
      return "gte8";
    }

    if (value >= 6) {
      return "gte6lt8";
    }

    if (value >= 4) {
      return "gte4lt6";
    }

    return "lt4";
  }

  toPublic() {
    return {
      code: this.code,
      label: this.label,
      field: this.field,
      color: this.color
    };
  }
}
