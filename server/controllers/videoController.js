import Video from "../models/Video.js";
import { getUserId } from "../middleware/auth.js";
import mlService from "../services/mlService.js";
import fs from "fs";

/**
 * POST /api/videos/analyze
 * Start analyzing a video (YouTube URL or uploaded file).
 */
export const analyzeVideo = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { sourceUrl, language = "english" } = req.body;
    const file = req.file;

    // Determine source type
    let sourceType, source, originalFileName;

    if (file) {
      sourceType = "upload";
      originalFileName = file.originalname;

      // Upload file to ML service
      const uploadResult = await mlService.uploadFileToML(file.path, file.originalname);
      source = uploadResult.filename;

      // Remove the Express-side copy after forwarding to ML service
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        /* ignore cleanup errors */
      }
    } else if (sourceUrl) {
      sourceType = "youtube";
      source = sourceUrl;
      originalFileName = "";

      // Basic YouTube URL validation
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/;
      if (!youtubeRegex.test(sourceUrl)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid YouTube URL.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide a YouTube URL or upload a file.",
      });
    }

    if (!["english", "hinglish"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Language must be 'english' or 'hinglish'.",
      });
    }

    // Create video document in MongoDB
    const video = await Video.create({
      userId,
      sourceType,
      sourceUrl: sourceType === "youtube" ? sourceUrl : "",
      originalFileName,
      language,
      status: "processing",
      processingStage: "audio_extraction",
    });

    // Start processing on ML service
    const mlResult = await mlService.startProcessing({
      videoId: video._id.toString(),
      source,
      sourceType,
      language,
    });

    // Store ML job ID for status tracking
    video.mlJobId = mlResult.job_id;
    await video.save();

    res.status(201).json({
      success: true,
      data: {
        videoId: video._id,
        status: "processing",
        mlJobId: mlResult.job_id,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        /* ignore */
      }
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "AI processing service is currently unavailable. Please try again later.",
      });
    }
    next(error);
  }
};

/**
 * GET /api/videos
 * List all videos for the authenticated user (paginated).
 */
export const getVideos = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      Video.find({ userId })
        .select("-transcript -summary -actionItems -keyDecisions -openQuestions")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/videos/:id
 * Get a single video with all data (ownership check).
 */
export const getVideo = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    if (video.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/videos/:id/status
 * Check processing status (polls ML service if still processing).
 */
export const getVideoStatus = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }

    if (video.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // If already completed or failed, return stored status
    if (video.status === "completed" || video.status === "failed") {
      return res.json({
        success: true,
        data: {
          status: video.status,
          stage: video.processingStage,
          title: video.title,
          error: video.error,
        },
      });
    }

    // Poll ML service for current status
    if (video.mlJobId) {
      try {
        const jobStatus = await mlService.getJobStatus(video.mlJobId);

        // Update video with latest status
        video.status = jobStatus.status;
        video.processingStage = jobStatus.stage;

        if (jobStatus.status === "completed" && jobStatus.results) {
          video.title = jobStatus.results.title || "";
          video.transcript = jobStatus.results.transcript || "";
          video.summary = jobStatus.results.summary || "";
          video.actionItems = jobStatus.results.action_items || "";
          video.keyDecisions = jobStatus.results.key_decisions || "";
          video.openQuestions = jobStatus.results.open_questions || "";
        }

        if (jobStatus.status === "failed") {
          video.error = jobStatus.error || "Processing failed";
        }

        await video.save();

        return res.json({
          success: true,
          data: {
            status: video.status,
            stage: video.processingStage,
            title: video.title,
            error: video.error,
          },
        });
      } catch (mlError) {
        // ML service might be down — return stored status
        return res.json({
          success: true,
          data: {
            status: video.status,
            stage: video.processingStage,
            error: "Unable to reach processing service.",
          },
        });
      }
    }

    res.json({
      success: true,
      data: {
        status: video.status,
        stage: video.processingStage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/videos/:id
 * Delete a video and its associated data.
 */
export const deleteVideo = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }

    if (video.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Delete associated chat messages
    const ChatMessage = (await import("../models/ChatMessage.js")).default;
    await ChatMessage.deleteMany({ videoId: video._id });

    // Delete the video document
    await Video.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/videos/stats
 * Get dashboard statistics for the authenticated user.
 */
export const getStats = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const ChatMessage = (await import("../models/ChatMessage.js")).default;

    const [totalVideos, completedVideos, processingVideos, totalQuestions] =
      await Promise.all([
        Video.countDocuments({ userId }),
        Video.countDocuments({ userId, status: "completed" }),
        Video.countDocuments({ userId, status: "processing" }),
        ChatMessage.countDocuments({ userId, role: "user" }),
      ]);

    const recentVideos = await Video.find({ userId })
      .select("title status sourceType createdAt processingStage")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalVideos,
        completedVideos,
        processingVideos,
        totalQuestions,
        recentVideos,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/videos/:id/download/:type
 * Download transcript, summary, or full report.
 */
export const downloadContent = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { type } = req.params;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }

    if (video.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (video.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Video processing is not complete yet.",
      });
    }

    switch (type) {
      case "transcript":
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="${video.title || "transcript"}.txt"`);
        return res.send(video.transcript);

      case "summary":
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="${video.title || "summary"}_summary.txt"`);
        return res.send(video.summary);

      case "report": {
        const report = `# ${video.title}\n\n## Summary\n${video.summary}\n\n## Action Items\n${video.actionItems}\n\n## Key Decisions\n${video.keyDecisions}\n\n## Open Questions\n${video.openQuestions}`;
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader("Content-Disposition", `attachment; filename="${video.title || "report"}_report.md"`);
        return res.send(report);
      }

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid download type. Use 'transcript', 'summary', or 'report'.",
        });
    }
  } catch (error) {
    next(error);
  }
};
