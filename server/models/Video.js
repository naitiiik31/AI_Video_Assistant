import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ["youtube", "upload"],
      required: true,
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    originalFileName: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      enum: ["english", "hinglish"],
      default: "english",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processingStage: {
      type: String,
      default: "pending",
    },
    transcript: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    actionItems: {
      type: String,
      default: "",
    },
    keyDecisions: {
      type: String,
      default: "",
    },
    openQuestions: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    mlJobId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific queries
videoSchema.index({ userId: 1, createdAt: -1 });

const Video = mongoose.model("Video", videoSchema);

export default Video;
