import express from "express";
import upload from "../config/multerConfig.js";
import { resizeImages } from "../controllers/resizeController.js";

const router = express.Router();

router.post("/resize", upload.array("images", 10), resizeImages);

export default router;
