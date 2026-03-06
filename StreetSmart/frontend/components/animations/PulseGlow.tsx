'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PulseGlowProps {
  children: ReactNode;
  color?: string;
  duration?: number;
  className?: string;
  active?: boolean;
}

export default function PulseGlow({
  children,
  color = '#00FF9C',
  duration = 2,
  className = '',
  active = true,
}: PulseGlowProps) {
  return (
    <motion.div
      animate={active ? {
        boxShadow: [
          `0 0 5px ${color}40, 0 0 15px ${color}20`,
          `0 0 15px ${color}60, 0 0 30px ${color}30`,
          `0 0 5px ${color}40, 0 0 15px ${color}20`,
        ],
      } : {}}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function NeonDot({ color = '#00FF9C', size = 8 }: { color?: string; size?: number }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [1, 0.7, 1],
        boxShadow: [
          `0 0 ${size}px ${color}`,
          `0 0 ${size * 2}px ${color}, 0 0 ${size * 3}px ${color}40`,
          `0 0 ${size}px ${color}`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
      }}
    />
  );
}

export function ScanLine({ color = '#00E5FF' }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ top: ['-5%', '105%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-px opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </div>
  );
}