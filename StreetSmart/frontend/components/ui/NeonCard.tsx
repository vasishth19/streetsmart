'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface NeonCardProps {
  children: ReactNode;
  color?: string;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export default function NeonCard({
  children,
  color = '#00E5FF',
  className,
  hover = true,
  onClick,
  active = false,
}: NeonCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={clsx(
        'rounded-xl p-4 transition-all duration-200',
        'bg-[#0B1020]/80 backdrop-blur-sm',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        border: `1px solid ${active ? color : `${color}20`}`,
        boxShadow: active
          ? `0 0 20px ${color}20, inset 0 0 20px ${color}05`
          : `0 4px 20px rgba(0,0,0,0.3)`,
      }}
      onMouseEnter={e => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.border = `1px solid ${color}50`;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}15, 0 4px 20px rgba(0,0,0,0.4)`;
        }
      }}
      onMouseLeave={e => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.border = `1px solid ${active ? color : `${color}20`}`;
          (e.currentTarget as HTMLElement).style.boxShadow = active
            ? `0 0 20px ${color}20, inset 0 0 20px ${color}05`
            : `0 4px 20px rgba(0,0,0,0.3)`;
        }
      }}
    >
      {children}
    </motion.div>
  );
}