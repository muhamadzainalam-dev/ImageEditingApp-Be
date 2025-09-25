import express from "express";
import cors from "cors";
import resizeRoutes from "./routes/resizeRoutes.js";
import compressRoutes from "./routes/compressRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", resizeRoutes);
app.use("/api", compressRoutes);

// Serve processed files
app.use("/processed", express.static("processed"));

export default app;
