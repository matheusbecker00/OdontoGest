export type { paths, components } from "./generated.js";

export const ROLE_CODES = [
  "OWNER",
  "ADMIN",
  "DENTIST",
  "RECEPTIONIST",
  "FINANCE",
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];
