import { Loader2, CheckCircle, AlertCircle, Eye } from 'lucide-react';
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
          text: 'Loading ASL Models...',
          className: 'text-yellow-500 animate-spin',
          bgClassName: 'bg-yellow-500/10 border-yellow-500/20'
        };
      case 'READY':
        return {
          icon: CheckCircle,
          text: 'Ready for Recognition',
          className: 'text-teal',
          bgClassName: 'bg-teal/10 border-teal/20'
        };
      case 'RECOGNIZING':
        return {
          icon: Eye,
          text: 'Recognizing ASL...',
          className: 'text-teal animate-pulse',
          bgClassName: 'bg-teal/10 border-teal/20'
        };
      case 'ERROR':
        return {
          icon: AlertCircle,
          text: 'Model Loading Error',
          className: 'text-destructive',
          bgClassName: 'bg-destructive/10 border-destructive/20'
        };
      default:
        return {
          icon: Loader2,
          text: 'Loading...',
          className: 'text-muted-foreground',
          bgClassName: 'bg-muted/10 border-border'
        };
    }
  };

  const { icon: Icon, text, className, bgClassName } = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-sm font-medium mt-2 ${bgClassName}`}>
      <Icon className={`w-4 h-4 ${className}`} />
      <span className="text-foreground">{text}</span>
    </div>
  );
};