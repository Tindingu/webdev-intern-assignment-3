import { describe, expect, it } from "vitest";
import { registrationNumberSchema } from "@/lib/validators";

describe("registrationNumberSchema", () => {
  it.each(["01000001", "12345678", "99999999"])("accepts %s", (value) => {
    expect(registrationNumberSchema.safeParse(value).success).toBe(true);
  });

  it.each(["1234567", "123456789", "abcdefgh", "1234abcd", ""])(
    "rejects %s",
    (value) => {
      expect(registrationNumberSchema.safeParse(value).success).toBe(false);
    }
  );

  it("trims whitespace before validation", () => {
    const result = registrationNumberSchema.safeParse(" 01000001 ");

    expect(result.success).toBe(true);
    expect(result.data).toBe("01000001");
  });
});
