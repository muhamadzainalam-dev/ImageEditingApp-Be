import sharp from "sharp";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { ensureDir, removeFile } from "../utils/fileUtils.js";

export const compressImages = async (req, res) => {
  try {
    const { quality, format } = req.body;
    const results = [];

    for (const file of req.files) {
      const originalSize = fs.statSync(file.path).size;

      const buffer = await sharp(file.path)
        .toFormat(format || "jpeg", { quality: parseInt(quality) || 80 })
        .toBuffer();

      const compressedSize = buffer.length;
      const base64Image = `data:image/${
        format || "jpeg"
      };base64,${buffer.toString("base64")}`;

      results.push({
        filename: file.originalname,
        originalSize,
        compressedSize,
        reductionPercent: (
          ((originalSize - compressedSize) / originalSize) *
          100
        ).toFixed(2),
        compressedImage: base64Image,
      });

      removeFile(file.path);
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("❌ Compress Error:", err);
    res.status(500).json({ error: "Image compression failed" });
  }
};

export const compressImagesToZip = async (req, res) => {
  try {
    const { quality, format } = req.body;

    ensureDir("processed");
    const zipPath = path.join("processed", `compressed-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    for (const file of req.files) {
      const buffer = await sharp(file.path)
        .toFormat(format || "jpeg", { quality: parseInt(quality) || 80 })
        .toBuffer();

      archive.append(buffer, {
        name: `${path.parse(file.originalname).name}.${format || "jpeg"}`,
      });

      removeFile(file.path);
    }

    archive.finalize();

    output.on("close", () => {
      res.download(zipPath, () => removeFile(zipPath));
    });
  } catch (err) {
    console.error("❌ ZIP Error:", err);
    res.status(500).json({ error: "ZIP processing failed" });
  }
};
