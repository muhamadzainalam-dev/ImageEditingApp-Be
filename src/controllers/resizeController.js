import sharp from "sharp";
import path from "path";
import { ensureDir, removeFile } from "../utils/fileUtils.js";

export const resizeImages = async (req, res) => {
  try {
    const { width, height, quality, format } = req.body;

    ensureDir("processed");

    const w = width && !isNaN(parseInt(width)) ? parseInt(width) : null;
    const h = height && !isNaN(parseInt(height)) ? parseInt(height) : null;
    const q = quality && !isNaN(parseInt(quality)) ? parseInt(quality) : 80;
    const fmt = format || "jpeg";

    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        const fileName = `${Date.now()}-${
          path.parse(file.originalname).name
        }.${fmt}`;
        const outputPath = path.join("processed", fileName);

        await sharp(file.path)
          .resize({ width: w, height: h, fit: "inside" })
          .toFormat(fmt, { quality: q })
          .toFile(outputPath);

        removeFile(file.path);

        return {
          name: fileName,
          url: `http://localhost:5000/processed/${fileName}`,
        };
      })
    );

    res.json({ success: true, files: processedFiles });
  } catch (err) {
    console.error("❌ Resize Error:", err);
    res.status(500).json({ success: false, error: "Image resize failed" });
  }
};
