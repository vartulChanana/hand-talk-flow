
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
          text: 'Loading AI Models...',
          className: 'text-yellow-400 animate-spin',
          bgClassName: 'bg-yellow-400/10 border-yellow-400/30 shadow-yellow-400/20',
          glowClassName: 'shadow-lg'
        };
      case 'READY':
        return {
          icon: CheckCircle,
          text: 'Ready for Recognition',
          className: 'text-green-400',
          bgClassName: 'bg-green-400/10 border-green-400/30 shadow-green-400/20',
          glowClassName: 'shadow-lg'
        };
      case 'RECOGNIZING':
        return {
          icon: Sparkles,
          text: 'Recognizing ASL...',
          className: 'text-purple-400 animate-pulse',
          bgClassName: 'bg-purple-400/10 border-purple-400/30 shadow-purple-400/20',
          glowClassName: 'shadow-lg'
        };
      case 'ERROR':
        return {
          icon: AlertCircle,
          text: 'Model Loading Error',
          className: 'text-red-400',
          bgClassName: 'bg-red-400/10 border-red-400/30 shadow-red-400/20',
          glowClassName: 'shadow-lg'
        };
      default:
        return {
          icon: Loader2,
          text: 'Loading...',
          className: 'text-slate-400',
          bgClassName: 'bg-slate-400/10 border-slate-600/30',
          glowClassName: ''
        };
    }
  };

  const { icon: Icon, text, className, bgClassName, glowClassName } = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-sm text-sm font-semibold ${bgClassName} ${glowClassName}`}>
      <Icon className={`w-5 h-5 ${className}`} />
      <span className="text-white">{text}</span>
    </div>
  );
};
