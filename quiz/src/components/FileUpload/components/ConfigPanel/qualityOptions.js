// src/constants/qualityOptions.js
import { Zap, Clock, Crown } from 'lucide-react';

const qualityOptions = [
  {
    value: 'quick',
    label: 'Quick',
    description: 'Fast generation with basic quality checks',
    icon: <Zap size={16} color='#8B5CF6' />,
    estimatedTime: '~30s',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Balanced quality and speed with good validation',
    icon: <Clock size={16} color='#3B82F6' />,
    estimatedTime: '~1-2min',
  },
  {
    value: 'premium',
    label: 'Premium',
    description: 'Highest quality with multiple validation passes',
    icon: <Crown size={16} color='#F59E0B' />,
    estimatedTime: '~2-4min',
  },
];

export default qualityOptions;
