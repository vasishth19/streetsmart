'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Shield, Zap, ChevronRight } from 'lucide-react';
import NeonCard from './NeonCard';
import SafetyBadge from './SafetyBadge';
import type { RouteResult } from '@/services/api';

interface RouteCardProps {
  route: RouteResult;
  isSelected: boolean;
  onSelect: () => void;
  rank: number;
}

const SCORE_BAR_COLOR = (score: number) => {
  if (score >= 75) return '#00FF9C';
  if (score >= 50) return '#FFB020';
  return '#FF3B3B';
};

export default function RouteCard({ route, isSelected, onSelect, rank }: RouteCardProps) {
  const scores = route.scores;

  const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#8892B0] font-mono w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-[#0B1020] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
      <span className="text-[10px] font-mono w-8 text-right" style={{ color }}>
        {value.toFixed(0)}
      </span>
    </div>
  );

  return (
    <NeonCard
      color={route.color}
      active={isSelected}
      onClick={onSelect}
      className="relative"
    >
      {/* Rank badge */}
      <div
        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono"
        style={{
          background: `${route.color}20`,
          border: `1px solid ${route.color}40`,
          color: route.color,
        }}
      >
        #{rank}
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 pr-6">
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: `${route.color}15`, border: `1px solid ${route.color}30` }}
        >
          <Shield className="w-4 h-4" style={{ color: route.color }} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-[#E6F1FF] truncate">{route.name}</div>
          <div className="text-xs text-[#8892B0] mt-0.5 line-clamp-1">{route.description}</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-[#8892B0]">
          <MapPin className="w-3 h-3" />
          <span className="font-mono">{route.distance_km.toFixed(1)}km</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#8892B0]">
          <Clock className="w-3 h-3" />
          <span className="font-mono">{route.duration_min.toFixed(0)}min</span>
        </div>
        <div className="ml-auto">
          <SafetyBadge score={scores.overall} riskLevel={scores.risk_level} />
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-1.5 mb-3">
        <ScoreBar label="Safety" value={scores.safety} color={SCORE_BAR_COLOR(scores.safety)} />
        <ScoreBar label="Lighting" value={scores.lighting} color={SCORE_BAR_COLOR(scores.lighting)} />
        <ScoreBar label="Crowd" value={scores.crowd} color={SCORE_BAR_COLOR(scores.crowd)} />
        <ScoreBar label="Access" value={scores.accessibility} color={SCORE_BAR_COLOR(scores.accessibility)} />
      </div>

      {/* Highlights */}
      {route.highlights.length > 0 && (
        <div className="text-[10px] text-[#8892B0] line-clamp-1 mb-2">
          {route.highlights[0]}
        </div>
      )}

      {/* Warnings */}
      {route.warnings.length > 0 && (
        <div className="text-[10px] text-[#FFB020] line-clamp-1">
          {route.warnings[0]}
        </div>
      )}

      {/* Select indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-3 right-3"
        >
          <Zap className="w-3.5 h-3.5" style={{ color: route.color }} />
        </motion.div>
      )}
    </NeonCard>
  );
}