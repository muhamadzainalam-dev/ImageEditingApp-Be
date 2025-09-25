import fs from "fs";

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function removeFile(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
