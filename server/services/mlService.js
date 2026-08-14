import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 300000, // 5 minutes for long operations
});

/**
 * Check ML service health.
 */
export const checkHealth = async () => {
  const response = await mlClient.get("/health");
  return response.data;
};

/**
 * Start a video processing job on the ML service.
 */
export const startProcessing = async ({ videoId, source, sourceType, language }) => {
  const response = await mlClient.post("/process", {
    video_id: videoId,
    source,
    source_type: sourceType,
    language,
  });
  return response.data;
};

/**
 * Get processing job status from the ML service.
 */
export const getJobStatus = async (jobId) => {
  const response = await mlClient.get(`/jobs/${jobId}`);
  return response.data;
};

/**
 * Upload a file to the ML service.
 */
export const uploadFileToML = async (filePath, originalName) => {
  const fs = await import("fs");
  const FormData = (await import("form-data")).default;

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), originalName);

  const response = await mlClient.post("/upload", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return response.data;
};

/**
 * Ask a RAG question about a video.
 */
export const askQuestion = async (videoId, question) => {
  const response = await mlClient.post("/ask", {
    video_id: videoId,
    question,
  });
  return response.data;
};

export default {
  checkHealth,
  startProcessing,
  getJobStatus,
  uploadFileToML,
  askQuestion,
};
