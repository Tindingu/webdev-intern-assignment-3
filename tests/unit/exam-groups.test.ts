import { describe, expect, it } from "vitest";
import { findExamGroup } from "@/lib/exam-groups";

describe("findExamGroup", () => {
  it.each(["A", "B", "C", "D"] as const)("returns group %s", (code) => {
    expect(findExamGroup(code).code).toBe(code);
  });

  it("falls back to group A for missing or unknown codes", () => {
    expect(findExamGroup(null).code).toBe("A");
    expect(findExamGroup("X").code).toBe("A");
    expect(findExamGroup("").code).toBe("A");
  });
});
