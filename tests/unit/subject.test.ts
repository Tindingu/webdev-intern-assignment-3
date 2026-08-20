import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { type ExamScoreField, Subject } from "@/lib/subjects/subject";

type ScoreRow = Record<ExamScoreField, Prisma.Decimal | null>;

function createScoreRow(overrides: Partial<ScoreRow> = {}): ScoreRow {
  return {
    toan: null,
    nguVan: null,
    ngoaiNgu: null,
    vatLi: null,
    hoaHoc: null,
    sinhHoc: null,
    lichSu: null,
    diaLi: null,
    gdcd: null,
    ...overrides
  };
}

describe("Subject", () => {
  const math = new Subject("toan", "Math", "toan", "#0f9f9a");

  it.each([
    [10, "gte8"],
    [8, "gte8"],
    [7.99, "gte6lt8"],
    [6, "gte6lt8"],
    [5.99, "gte4lt6"],
    [4, "gte4lt6"],
    [3.99, "lt4"],
    [0, "lt4"]
  ] as const)("classifies %s as %s", (score, expectedLevel) => {
    expect(math.classify(score)).toBe(expectedLevel);
  });

  it("validates finite scores inside the exam range", () => {
    expect(math.isValidScore(0)).toBe(true);
    expect(math.isValidScore(5.5)).toBe(true);
    expect(math.isValidScore(new Prisma.Decimal("10"))).toBe(true);
  });

  it("rejects empty, non-finite, and out-of-range scores", () => {
    expect(math.isValidScore(null)).toBe(false);
    expect(math.isValidScore(undefined)).toBe(false);
    expect(math.isValidScore(Number.NaN)).toBe(false);
    expect(math.isValidScore(-0.25)).toBe(false);
    expect(math.isValidScore(10.25)).toBe(false);
  });

  it("extracts the configured score field from an exam result row", () => {
    const literature = new Subject("ngu_van", "Literature", "nguVan", "#f26b5e");
    const row = createScoreRow({
      toan: new Prisma.Decimal("8.80"),
      nguVan: new Prisma.Decimal("7.25")
    });

    expect(math.extractScore(row)?.toString()).toBe("8.8");
    expect(literature.extractScore(row)?.toString()).toBe("7.25");
  });

  it("returns null when the configured score field is empty", () => {
    expect(math.extractScore(createScoreRow())).toBeNull();
  });
});
