// Single source of truth for notice categories on the backend.
// Must match the `NoticeCategory` enum in schema.prisma.
export const NOTICE_CATEGORIES = ["GENERAL", "ACADEMIC", "EXAM", "ADMISSION", "EVENT"] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

export function isNoticeCategory(value: unknown): value is NoticeCategory {
  return typeof value === "string" && (NOTICE_CATEGORIES as readonly string[]).includes(value);
}