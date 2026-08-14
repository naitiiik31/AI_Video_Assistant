import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

// Clerk token injection — set by App.jsx
let getTokenFn = null;

export const setGetToken = (fn) => {
  getTokenFn = fn;
};

api.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Token retrieval failed — let the request go through
      // Clerk middleware on backend will return 401
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign-in if unauthorized
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// ── Video APIs ──────────────────────────────────────────────────────

export const getStats = () => api.get('/videos/stats');

export const getVideos = (page = 1, limit = 20) =>
  api.get(`/videos?page=${page}&limit=${limit}`);

export const getVideo = (id) => api.get(`/videos/${id}`);

export const getVideoStatus = (id) => api.get(`/videos/${id}/status`);

export const deleteVideo = (id) => api.delete(`/videos/${id}`);

export const analyzeYouTube = (sourceUrl, language) =>
  api.post('/videos/analyze', { sourceUrl, language });

export const analyzeFile = (file, language) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  return api.post('/videos/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 min for large files
  });
};

export const downloadContent = (videoId, type) =>
  api.get(`/videos/${videoId}/download/${type}`, { responseType: 'blob' });

// ── Chat APIs ───────────────────────────────────────────────────────

export const sendChatMessage = (videoId, question) =>
  api.post(`/videos/${videoId}/chat`, { question });

export const getChatHistory = (videoId) =>
  api.get(`/videos/${videoId}/chat`);

export const clearChat = (videoId) =>
  api.delete(`/videos/${videoId}/chat`);

export default api;
