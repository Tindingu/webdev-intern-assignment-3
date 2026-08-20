import { describe, expect, it } from "vitest";
import { buildMedalLevelByTotal, getMedalLevel } from "@/lib/ranking";

describe("ranking medals", () => {
  it("assigns gold, silver, and bronze by distinct total scores", () => {
    const medals = buildMedalLevelByTotal([29.6, 29.55, 29.35, 29.2]);

    expect(getMedalLevel(29.6, medals)).toBe(1);
    expect(getMedalLevel(29.55, medals)).toBe(2);
    expect(getMedalLevel(29.35, medals)).toBe(3);
    expect(getMedalLevel(29.2, medals)).toBe(0);
  });

  it("gives the same medal level to students with the same total", () => {
    const medals = buildMedalLevelByTotal([29.6, 29.6, 29.35, 29.2]);

    expect(getMedalLevel(29.6, medals)).toBe(1);
    expect(getMedalLevel(29.35, medals)).toBe(2);
    expect(getMedalLevel(29.2, medals)).toBe(3);
  });

  it("rounds totals to two decimals before comparing medal levels", () => {
    const medals = buildMedalLevelByTotal([29.604, 29.554, 29.354]);

    expect(getMedalLevel(29.6, medals)).toBe(1);
    expect(getMedalLevel(29.55, medals)).toBe(2);
    expect(getMedalLevel(29.35, medals)).toBe(3);
  });
});
