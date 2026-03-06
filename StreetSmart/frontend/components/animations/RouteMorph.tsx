'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface RouteMorphProps {
  routeId: string;
  children: ReactNode;
}

export default function RouteMorph({ routeId, children }: RouteMorphProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeId}
        initial={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function RouteListItem({ children, index }: { children: ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{
        duration: 0.3,
        delay: index * 0.08,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}