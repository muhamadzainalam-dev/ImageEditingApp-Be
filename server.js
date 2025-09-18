import express from "express";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const app = express();
app.use(cors());

// Ensure upload folder
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

// Multi-image compress
app.post("/api/compress", upload.array("images"), async (req, res) => {
  try {
    const { quality, format } = req.body;
    const results = [];

    for (const file of req.files) {
      const inputPath = file.path;
      const originalSize = fs.statSync(inputPath).size;

      const buffer = await sharp(inputPath)
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

      fs.unlinkSync(inputPath); // delete temp
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

// ZIP download for multiple files
app.post("/api/compress-zip", upload.array("images"), async (req, res) => {
  try {
    const { quality, format } = req.body;

    const zipPath = path.join("processed", `compressed-${Date.now()}.zip`);
    if (!fs.existsSync("processed")) fs.mkdirSync("processed");

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);

    for (const file of req.files) {
      const inputPath = file.path;
      const buffer = await sharp(inputPath)
        .toFormat(format || "jpeg", { quality: parseInt(quality) || 80 })
        .toBuffer();

      archive.append(buffer, {
        name: `${path.parse(file.originalname).name}.${format || "jpeg"}`,
      });

      fs.unlinkSync(inputPath);
    }

    archive.finalize();

    output.on("close", () => {
      res.download(zipPath, () => {
        fs.unlinkSync(zipPath); // delete after sending
      });
    });
  } catch (err) {
    console.error("ZIP Error:", err);
    res.status(500).json({ error: "ZIP processing failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
