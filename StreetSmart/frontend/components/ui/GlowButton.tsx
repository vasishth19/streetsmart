'use client';

import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: 'green' | 'cyan' | 'red' | 'amber' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  className?: string;
}

const COLOR_MAP = {
  green: {
    solid: 'bg-[#00FF9C]/15 border-[#00FF9C]/50 text-[#00FF9C] hover:bg-[#00FF9C]/25 hover:shadow-[0_0_20px_rgba(0,255,156,0.4)]',
    outline: 'bg-transparent border-[#00FF9C]/40 text-[#00FF9C] hover:bg-[#00FF9C]/10 hover:shadow-[0_0_15px_rgba(0,255,156,0.3)]',
    ghost: 'bg-transparent border-transparent text-[#00FF9C] hover:bg-[#00FF9C]/10',
  },
  cyan: {
    solid: 'bg-[#00E5FF]/15 border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/25 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]',
    outline: 'bg-transparent border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/10 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)]',
    ghost: 'bg-transparent border-transparent text-[#00E5FF] hover:bg-[#00E5FF]/10',
  },
  red: {
    solid: 'bg-[#FF3B3B]/15 border-[#FF3B3B]/50 text-[#FF3B3B] hover:bg-[#FF3B3B]/25 hover:shadow-[0_0_20px_rgba(255,59,59,0.4)]',
    outline: 'bg-transparent border-[#FF3B3B]/40 text-[#FF3B3B] hover:bg-[#FF3B3B]/10 hover:shadow-[0_0_15px_rgba(255,59,59,0.3)]',
    ghost: 'bg-transparent border-transparent text-[#FF3B3B] hover:bg-[#FF3B3B]/10',
  },
  amber: {
    solid: 'bg-[#FFB020]/15 border-[#FFB020]/50 text-[#FFB020] hover:bg-[#FFB020]/25 hover:shadow-[0_0_20px_rgba(255,176,32,0.4)]',
    outline: 'bg-transparent border-[#FFB020]/40 text-[#FFB020] hover:bg-[#FFB020]/10 hover:shadow-[0_0_15px_rgba(255,176,32,0.3)]',
    ghost: 'bg-transparent border-transparent text-[#FFB020] hover:bg-[#FFB020]/10',
  },
  purple: {
    solid: 'bg-[#B388FF]/15 border-[#B388FF]/50 text-[#B388FF] hover:bg-[#B388FF]/25 hover:shadow-[0_0_20px_rgba(179,136,255,0.4)]',
    outline: 'bg-transparent border-[#B388FF]/40 text-[#B388FF] hover:bg-[#B388FF]/10 hover:shadow-[0_0_15px_rgba(179,136,255,0.3)]',
    ghost: 'bg-transparent border-transparent text-[#B388FF] hover:bg-[#B388FF]/10',
  },
};

const SIZE_MAP = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2 rounded-lg gap-2',
  lg: 'text-sm px-6 py-3 rounded-xl gap-2',
};

export default function GlowButton({
  children,
  color = 'cyan',
  size = 'md',
  variant = 'solid',
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={clsx(
        'inline-flex items-center justify-center font-medium border transition-all duration-200',
        'font-[Space_Grotesk,sans-serif]',
        COLOR_MAP[color][variant],
        SIZE_MAP[size],
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}