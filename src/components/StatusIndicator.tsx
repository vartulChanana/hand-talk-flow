
import { Loader2, CheckCircle, AlertCircle, Eye, Sparkles } from 'lucide-react';
import { AppStatus } from '@/pages/Index';

interface StatusIndicatorProps {
  status: AppStatus;
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'LOADING':
        return {
          icon: Loader2,
          text: 'LOADING AI MODELS',
          className: 'animate-spin'
        };
      case 'READY':
        return {
          icon: CheckCircle,
          text: 'READY FOR RECOGNITION',
          className: ''
        };
      case 'RECOGNIZING':
        return {
          icon: Sparkles,
          text: 'RECOGNIZING ASL',
          className: 'animate-pulse'
        };
      case 'ERROR':
        return {
          icon: AlertCircle,
          text: 'MODEL LOADING ERROR',
          className: ''
        };
      default:
        return {
          icon: Loader2,
          text: 'LOADING',
          className: ''
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <div className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 rounded text-sm font-semibold tracking-widest uppercase">
      <Icon className={`w-5 h-5 ${className}`} />
      <span>{text}</span>
    </div>
  );
};
