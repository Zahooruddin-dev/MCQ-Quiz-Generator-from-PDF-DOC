export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export const SUPPORTED = [
  "text",
  "pdf",
  "msword",
  "vnd.openxmlformats-officedocument.wordprocessingml.document",
  "html",
];

export function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// 🔥 Added SAMPLE_TEXT here
export const SAMPLE_TEXT = `The Earth revolves around the Sun once every 365 days.
This motion causes the cycle of seasons, day and night,
and affects climate patterns across the globe.`;
