// src/constants/difficultyOptions.js
import { Target } from 'lucide-react';

const difficultyOptions = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Basic recall and simple comprehension questions',
    icon: <Target size={16} color='#10B981' />,
  },
  {
    value: 'medium',
    label: 'Normal',
    description: 'Balanced mix of comprehension and application questions',
    icon: <Target size={16} color='#F59E0B' />,
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Advanced analysis and critical thinking questions',
    icon: <Target size={16} color='#EF4444' />,
  },
];

export default difficultyOptions;
