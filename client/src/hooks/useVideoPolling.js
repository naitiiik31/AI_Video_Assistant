import { useState, useEffect, useRef } from 'react';
import { getVideoStatus } from '../services/api';

/**
 * Custom hook to poll video processing status.
 * Polls every 3 seconds while status is 'processing'.
 * Stops when status is 'completed' or 'failed'.
 */
export function useVideoPolling(videoId, initialStatus = 'processing') {
  const [status, setStatus] = useState(initialStatus);
  const [stage, setStage] = useState('pending');
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!videoId || status === 'completed' || status === 'failed') {
      return;
    }

    const poll = async () => {
      try {
        const res = await getVideoStatus(videoId);
        const data = res.data.data;

        setStatus(data.status);
        setStage(data.stage);
        setTitle(data.title || '');

        if (data.status === 'failed') {
          setError(data.error || 'Processing failed');
        }

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Don't stop polling on transient errors
      }
    };

    // Initial poll
    poll();

    // Poll every 3 seconds
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, status]);

  return { status, stage, error, title };
}
