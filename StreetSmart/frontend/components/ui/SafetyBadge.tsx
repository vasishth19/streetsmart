'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface SafetyBadgeProps {
  score: number;
  riskLevel: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function SafetyBadge({
  score,
  riskLevel,
  size = 'sm',
  showIcon = true,
}: SafetyBadgeProps) {
  const getColor = () => {
    if (riskLevel === 'LOW' || score >= 75) return '#00FF9C';
    if (riskLevel === 'MEDIUM' || score >= 50) return '#FFB020';
    return '#FF3B3B';
  };

  const color = getColor();

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = { sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-4 h-4' };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded font-mono font-semibold ${sizeClasses[size]}`}
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 8px ${color}20`,
      }}
    >
      {showIcon && <Shield className={iconSizes[size]} />}
      <span>{score.toFixed(0)}</span>
      <span className="opacity-70">{riskLevel}</span>
    </motion.div>
  );
}