import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';

const ACCEPTED_FORMATS = {
  'video/mp4': ['.mp4'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/x-m4a': ['.m4a'],
  'video/webm': ['.webm'],
};

export default function FileUpload({ file, onFileSelect, onClear }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FORMATS,
      maxFiles: 1,
      maxSize: 500 * 1024 * 1024, // 500MB
    });

  if (file) {
    return (
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
          <File className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-[var(--text-primary)]">
            {file.name}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
        <button
          onClick={onClear}
          className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          glass-card p-8 text-center cursor-pointer
          border-2 border-dashed transition-all duration-300
          ${isDragActive
            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
            : 'border-[var(--glass-border)] hover:border-[var(--accent-primary)]/50'
          }
        `}
      >
        <input {...getInputProps()} id="file-upload-input" />
        <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
          {isDragActive ? 'Drop your file here' : 'Drag & drop your video or audio file'}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Supports MP4, MP3, WAV, M4A, WebM — Max 500MB
        </p>
        <button
          type="button"
          className="mt-4 btn-secondary text-sm px-4 py-2"
        >
          Browse Files
        </button>
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-2 text-sm text-red-500">
          {fileRejections[0]?.errors[0]?.message || 'This file format is not supported.'}
        </p>
      )}
    </div>
  );
}
