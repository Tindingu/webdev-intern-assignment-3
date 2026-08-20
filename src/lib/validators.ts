import { z } from "zod";

export const registrationNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, "Registration number must contain exactly 8 digits");
