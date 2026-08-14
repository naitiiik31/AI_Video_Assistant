import { Router } from "express";
import { protectRoute } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  analyzeVideo,
  getVideos,
  getVideo,
  getVideoStatus,
  deleteVideo,
  getStats,
  downloadContent,
} from "../controllers/videoController.js";

const router = Router();

// All routes require authentication
router.use(protectRoute);

// Dashboard stats
router.get("/stats", getStats);

// Video CRUD
router.get("/", getVideos);
router.get("/:id", getVideo);
router.delete("/:id", deleteVideo);

// Processing
router.post("/analyze", upload.single("file"), analyzeVideo);
router.get("/:id/status", getVideoStatus);

// Downloads
router.get("/:id/download/:type", downloadContent);

export default router;
