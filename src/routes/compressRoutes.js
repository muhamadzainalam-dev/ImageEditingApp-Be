import express from "express";
import upload from "../config/multerConfig.js";
import {
  compressImages,
  compressImagesToZip,
} from "../controllers/compressController.js";

const router = express.Router();

router.post("/compress", upload.array("images"), compressImages);
router.post("/compress-zip", upload.array("images"), compressImagesToZip);

export default router;
