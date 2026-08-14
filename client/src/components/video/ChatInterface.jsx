import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Trash2, Bot } from 'lucide-react';
import { sendChatMessage, getChatHistory, clearChat } from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ videoId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [videoId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await getChatHistory(videoId);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');

    // Optimistic user message
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question, createdAt: new Date().toISOString() },
    ]);

    setLoading(true);
    try {
      const res = await sendChatMessage(videoId, question);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.data.answer,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to get a response. Please try again.');
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    try {
      await clearChat(videoId);
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (err) {
      toast.error('Failed to clear chat');
    }
  };

  if (initialLoading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-96">
        <Loader className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[var(--accent-primary)]" />
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            AI Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <Bot className="w-12 h-12 text-[var(--text-muted)] mb-3" />
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              Ask the AI Assistant
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
              I've analyzed the entire transcript. Ask me anything about the video!
            </p>
            <div className="mt-4 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-4 py-2 rounded-lg border border-dashed border-[var(--glass-border)]">
              e.g., "What were the main decisions?" or "Summarize the technical discussion."
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
          >
            {msg.role === 'assistant' && (
              <div className="text-xs font-bold text-[var(--accent-secondary)] uppercase tracking-wider mb-1.5">
                AI Assistant
              </div>
            )}
            <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-2 text-right">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-ai">
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader className="w-4 h-4 animate-spin" />
              AI is thinking...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-[var(--glass-border)]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this video..."
          className="input-field flex-1"
          disabled={loading}
          id="chat-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary p-3 !rounded-xl"
          id="chat-send-button"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
