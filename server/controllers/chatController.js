import ChatMessage from "../models/ChatMessage.js";
import Video from "../models/Video.js";
import { getUserId } from "../middleware/auth.js";
import mlService from "../services/mlService.js";

/**
 * POST /api/videos/:id/chat
 * Send a question to the RAG AI and get an answer.
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { question } = req.body;
    const videoId = req.params.id;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question cannot be empty.",
      });
    }

    // Verify video exists and belongs to user
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }

    if (video.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (video.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Video processing is not complete. Please wait until processing finishes.",
      });
    }

    // Save user message
    await ChatMessage.create({
      userId,
      videoId,
      role: "user",
      content: question.trim(),
    });

    // Get AI answer from ML service
    const mlResponse = await mlService.askQuestion(videoId, question.trim());

    // Save AI response
    const aiMessage = await ChatMessage.create({
      userId,
      videoId,
      role: "assistant",
      content: mlResponse.answer,
    });

    res.json({
      success: true,
      data: {
        answer: mlResponse.answer,
        messageId: aiMessage._id,
      },
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "AI service is currently unavailable. Please try again later.",
      });
    }

    if (error.response?.status === 500) {
      return res.status(500).json({
        success: false,
        message: "Unable to answer right now. Please try again.",
      });
    }

    next(error);
  }
};

/**
 * GET /api/videos/:id/chat
 * Get chat history for a video.
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const videoId = req.params.id;

    // Verify video exists and belongs to user
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }

    if (video.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const messages = await ChatMessage.find({ videoId, userId })
      .sort({ createdAt: 1 })
      .select("role content createdAt");

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/videos/:id/chat
 * Clear chat history for a video.
 */
export const clearChatHistory = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const videoId = req.params.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }

    if (video.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await ChatMessage.deleteMany({ videoId, userId });

    res.json({ success: true, message: "Chat history cleared." });
  } catch (error) {
    next(error);
  }
};
