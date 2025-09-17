import {
  FileText,
  Settings,
  Eye,
  RefreshCw,
  Brain,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Get stage-specific icon
export const getStageIcon = (stage) => {
  switch (stage) {
    case 'reading':
      return FileText;
    case 'processing':
      return Settings;
    case 'ocr':
      return Eye;
    case 'analyzing':
      return RefreshCw;
    case 'generating':
      return Brain;
    case 'finalizing':
      return Sparkles;
    case 'complete':
      return Sparkles;
    default:
      return FileText;
  }
};

// Get stage-specific color
export const getStageColor = (stage) => {
  switch (stage) {
    case 'reading':
      return '#3b82f6'; // blue
    case 'processing':
      return '#f59e0b'; // amber
    case 'ocr':
      return '#8b5cf6'; // purple
    case 'analyzing':
      return '#10b981'; // green
    case 'generating':
      return '#6366f1'; // indigo
    case 'finalizing':
      return '#06b6d4'; // cyan
    case 'complete':
      return '#10b981'; // green
    default:
      return '#6366f1'; // fallback
  }
};

// Get file read status info
export const getFileReadStatusInfo = (fileReadStatus, extractedText = '') => {
  switch (fileReadStatus) {
    case 'reading':
      return {
        icon: Clock,
        color: '#f59e0b',
        text: 'Reading file...',
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    case 'ready':
      return {
        icon: CheckCircle,
        color: '#10b981',
        text: `Ready (${extractedText.length} chars)`,
        bgColor: 'rgba(16, 185, 129, 0.1)',
      };
    case 'error':
      return {
        icon: AlertCircle,
        color: '#ef4444',
        text: 'Read failed',
        bgColor: 'rgba(239, 68, 68, 0.1)',
      };
    default:
      return null;
  }
};
