'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Star, Send, TrendingUp, Users,
  Shield, Zap, MapPin, AlertTriangle, Activity,
  BarChart3, Radio
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from 'recharts';
import NeonCard from '@/components/ui/NeonCard';
import GlowButton from '@/components/ui/GlowButton';
import { useReviews } from '@/hooks/useReviews';
import { useLiveMetrics } from '@/hooks/useLiveMetrics';
import { useAuth } from '@/hooks/useAuth';

// ─── Shared colors ────────────────────────────────────────────────
const C = {
  green:  '#00FF9C',
  cyan:   '#00E5FF',
  amber:  '#FFB020',
  red:    '#FF3B3B',
  purple: '#B388FF',
};

const PROFILE_COLORS: Record<string, string> = {
  general:           '#00E5FF',
  woman:             '#FF69B4',
  elderly:           '#FFB020',
  wheelchair:        '#00FF9C',
  visually_impaired: '#B388FF',
};

// ─── Star rating input ────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className="w-6 h-6"
            fill={(hover || value) >= s ? C.amber : 'none'}
            stroke={(hover || value) >= s ? C.amber : '#4A5568'}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Live metric card ─────────────────────────────────────────────
function LiveCard({ label, value, icon: Icon, color, suffix = '' }: {
  label: string; value: number; icon: any; color: string; suffix?: string;
}) {
  return (
    <NeonCard color={color} className="h-full">
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono"
          style={{ color }}>
          <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
        </span>
      </div>
      <motion.div
        key={value}
        initial={{ opacity: 0.6, scale: 0.96 }}
        animate={{ opacity: 1,   scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold font-mono"
        style={{ color }}
      >
        {value.toLocaleString()}{suffix}
      </motion.div>
      <div className="text-xs text-[#8892B0] mt-1">{label}</div>
    </NeonCard>
  );
}

// ─── Mock analytics data ──────────────────────────────────────────
const hourly = Array.from({ length: 24 }, (_, h) => ({
  hour:   h,
  safety: parseFloat(Math.min(98, Math.max(40, 55 + 30 * Math.sin((h-3)*0.38) + (Math.random()*6-3))).toFixed(1)),
}));

const profiles = [
  { profile: 'general',           count: 1240, percentage: 45.2 },
  { profile: 'woman',             count:  890, percentage: 32.4 },
  { profile: 'elderly',           count:  320, percentage: 11.7 },
  { profile: 'wheelchair',        count:  185, percentage:  6.7 },
  { profile: 'visually_impaired', count:  109, percentage:  4.0 },
];

const dailyRoutes = [
  { day: 'Mon', routes: 412 },
  { day: 'Tue', routes: 388 },
  { day: 'Wed', routes: 445 },
  { day: 'Thu', routes: 502 },
  { day: 'Fri', routes: 478 },
  { day: 'Sat', routes: 310 },
  { day: 'Sun', routes: 209 },
];

const radarData = [
  { subject: 'Safety',        A: 85 },
  { subject: 'Lighting',      A: 72 },
  { subject: 'Accessibility', A: 78 },
  { subject: 'Crowd',         A: 65 },
  { subject: 'Response',      A: 90 },
];

const issues = [
  { type: 'poor_lighting',   count: 89, resolved: 34 },
  { type: 'broken_sidewalk', count: 67, resolved: 45 },
  { type: 'unsafe_area',     count: 52, resolved: 12 },
  { type: 'missing_ramp',    count: 38, resolved: 28 },
  { type: 'construction',    count: 29, resolved: 19 },
];

// ─── Dashboard page ───────────────────────────────────────────────
export default function DashboardPage() {
  const { metrics, connected }                   = useLiveMetrics(4000);
  const { reviews, loading: revLoading,
          submitting, avgRating, submitReview }  = useReviews();
  const { user, token }                          = useAuth();

  const [newRating,  setNewRating]  = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitted,  setSubmitted]  = useState(false);

  const handleSubmitReview = async () => {
    if (!newComment.trim()) return;
    await submitReview(newRating, newComment, token ?? undefined);
    setNewComment('');
    setNewRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#05080F] grid-overlay">
      <div className="scanlines pointer-events-none fixed inset-0 z-0" />

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[#00E5FF]/10 bg-[#05080F]/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#8892B0] hover:text-[#00E5FF] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-[#E6F1FF]">
                Smart City <span className="text-[#00E5FF]">Analytics</span>
              </h1>
              <p className="text-xs text-[#8892B0] font-mono">Real-time infrastructure intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              connected
                ? 'text-[#00FF9C] border-[#00FF9C]/30 bg-[#00FF9C]/10'
                : 'text-[#FFB020] border-[#FFB020]/30 bg-[#FFB020]/10'
            }`}>
              {connected ? '● LIVE' : '○ DEMO'}
            </span>
            {user && (
              <span className="text-xs text-[#8892B0] font-mono hidden sm:block">
                {user.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Live Metrics ─────────────────────────────────────── */}
        <div>
          <p className="text-xs font-mono text-[#8892B0] mb-3 tracking-wider flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00FF9C] animate-pulse" />
            LIVE SYSTEM METRICS — updates every 4s
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <LiveCard label="Active Users"     value={metrics.active_users}      icon={Users}     color={C.cyan}   />
            <LiveCard label="Routes Today"     value={metrics.routes_generated}  icon={MapPin}    color={C.green}  />
            <LiveCard label="Safety Reports"   value={metrics.safety_reports}    icon={Shield}    color={C.amber}  />
            <LiveCard label="Reviews"          value={metrics.reviews_submitted} icon={Star}      color={C.purple} />
            <LiveCard label="Routes/min"       value={metrics.routes_per_minute} icon={Zap}       color={C.red}    suffix="/m" />
            <LiveCard label="Cities Online"    value={metrics.online_cities}     icon={BarChart3} color={C.cyan}   />
          </div>
        </div>

        {/* ── Charts Row 1 ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }}>
            <NeonCard color={C.cyan}>
              <h3 className="text-sm font-semibold text-[#E6F1FF] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
                Safety Score by Hour
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.05)" />
                  <XAxis dataKey="hour" tick={{ fill:'#8892B0', fontSize:10, fontFamily:'monospace' }} tickFormatter={(v:number)=>`${v}h`} />
                  <YAxis tick={{ fill:'#8892B0', fontSize:10, fontFamily:'monospace' }} domain={[40,100]} />
                  <Tooltip contentStyle={{ background:'rgba(11,16,32,0.95)', border:'1px solid rgba(0,229,255,0.2)', borderRadius:'8px', color:'#E6F1FF', fontSize:'12px' }}
                    formatter={(v:number)=>[`${v.toFixed(1)}`,'Safety']} />
                  <Line type="monotone" dataKey="safety" stroke={C.cyan} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </NeonCard>
          </motion.div>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }}>
            <NeonCard color={C.green}>
              <h3 className="text-sm font-semibold text-[#E6F1FF] mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00FF9C]" />
                User Profile Distribution
              </h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={profiles} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="count">
                      {profiles.map((e,i) => <Cell key={i} fill={PROFILE_COLORS[e.profile]??C.cyan} stroke="transparent" />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'rgba(11,16,32,0.95)', border:'1px solid rgba(0,255,156,0.2)', borderRadius:'8px', color:'#E6F1FF', fontSize:'12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {profiles.map((item) => (
                    <div key={item.profile} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: PROFILE_COLORS[item.profile]??C.cyan }} />
                        <span className="text-xs text-[#8892B0] capitalize">{item.profile.replace(/_/g,' ')}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: PROFILE_COLORS[item.profile]??C.cyan }}>{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </NeonCard>
          </motion.div>
        </div>

        {/* ── Charts Row 2 ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <NeonCard color={C.amber}>
              <h3 className="text-sm font-semibold text-[#E6F1FF] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FFB020]" />
                Routes Generated This Week
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyRoutes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,176,32,0.05)" />
                  <XAxis dataKey="day" tick={{ fill:'#8892B0', fontSize:10, fontFamily:'monospace' }} />
                  <YAxis tick={{ fill:'#8892B0', fontSize:10, fontFamily:'monospace' }} />
                  <Tooltip contentStyle={{ background:'rgba(11,16,32,0.95)', border:'1px solid rgba(255,176,32,0.2)', borderRadius:'8px', color:'#E6F1FF', fontSize:'12px' }} />
                  <Bar dataKey="routes" fill={C.amber} radius={[4,4,0,0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </NeonCard>
          </motion.div>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.5 }}>
            <NeonCard color={C.purple}>
              <h3 className="text-sm font-semibold text-[#E6F1FF] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#B388FF]" />
                City Safety Radar
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(179,136,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill:'#8892B0', fontSize:10 }} />
                  <Radar name="Score" dataKey="A" stroke={C.purple} fill={C.purple} fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </NeonCard>
          </motion.div>
        </div>

        {/* ── Issues table ─────────────────────────────────────── */}
        <NeonCard color={C.red}>
          <h3 className="text-sm font-semibold text-[#E6F1FF] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF3B3B]" />
            Top Community Reported Issues
          </h3>
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="font-mono text-xs text-[#4A5568] w-4">{i+1}</span>
                <span className="text-sm text-[#E6F1FF] flex-1 capitalize">{issue.type.replace(/_/g,' ')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#0B1020] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width:`${(issue.count/(issues[0]?.count||1))*100}%`, background:C.red, boxShadow:`0 0 8px ${C.red}40` }} />
                  </div>
                  <span className="font-mono text-xs text-[#FF3B3B] w-8 text-right">{issue.count}</span>
                  <span className="font-mono text-xs text-[#00FF9C] w-8 text-right">{issue.resolved}✓</span>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

        {/* ── Cities grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { city:'New York',     score:76, routes:892 },
            { city:'Los Angeles',  score:71, routes:643 },
            { city:'Chicago',      score:68, routes:421 },
            { city:'Houston',      score:74, routes:318 },
            { city:'Phoenix',      score:79, routes:267 },
            { city:'Philadelphia', score:65, routes:203 },
          ].map((c) => (
            <NeonCard key={c.city} color={C.cyan} className="text-center">
              <div className="font-semibold text-[#E6F1FF] mb-1">{c.city}</div>
              <div className="text-2xl font-bold font-mono" style={{ color: c.score>=75?C.green:c.score>=65?C.amber:C.red }}>
                {c.score}
              </div>
              <div className="text-xs text-[#8892B0]">Safety Score</div>
              <div className="text-xs text-[#4A5568] mt-1 font-mono">{c.routes} routes/day</div>
            </NeonCard>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            FEATURE 5 — USER REVIEWS
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Review summary */}
          <NeonCard color={C.amber}>
            <h3 className="text-sm font-semibold text-[#E6F1FF] mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-[#FFB020]" fill={C.amber} />
              Platform Reviews
            </h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold font-mono text-[#FFB020]">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5"
                      fill={avgRating >= s ? C.amber : 'none'}
                      stroke={avgRating >= s ? C.amber : '#4A5568'} />
                  ))}
                </div>
                <div className="text-xs text-[#8892B0] mt-1">{reviews.length} reviews</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8892B0] w-3">{star}</span>
                      <Star className="w-2.5 h-2.5 text-[#FFB020]" fill={C.amber} />
                      <div className="flex-1 h-1.5 bg-[#0B1020] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: C.amber }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[#4A5568] w-5">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Latest reviews */}
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {revLoading
                ? <div className="text-center text-xs text-[#8892B0] py-4 font-mono animate-pulse">Loading reviews...</div>
                : reviews.slice(0, 5).map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg bg-[#0B1020] border border-[#1a2a4a]"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-[#E6F1FF]">{rev.user_name}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className="w-2.5 h-2.5"
                            fill={rev.rating >= s ? C.amber : 'none'}
                            stroke={rev.rating >= s ? C.amber : '#4A5568'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#8892B0] leading-relaxed">{rev.comment}</p>
                    <p className="text-[10px] text-[#4A5568] mt-1 font-mono">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))
              }
            </div>
          </NeonCard>

          {/* Submit review */}
          <NeonCard color={C.green}>
            <h3 className="text-sm font-semibold text-[#E6F1FF] mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#00FF9C]" />
              Leave a Review
            </h3>

            <AnimatePresence>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-3"
                >
                  <div className="text-4xl">🎉</div>
                  <p className="text-[#00FF9C] font-mono font-bold">Thank you!</p>
                  <p className="text-[#8892B0] text-sm text-center">Your review helps make cities safer.</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#8892B0] mb-2">YOUR RATING</label>
                    <StarInput value={newRating} onChange={setNewRating} />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8892B0] mb-2">YOUR COMMENT</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="What do you think of StreetSmart? How has it helped you?"
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#0B1020] border border-[#1a2a4a] text-[#E6F1FF] placeholder-[#4A5568] text-sm font-mono outline-none focus:border-[#00FF9C]/50 transition-colors resize-none"
                    />
                  </div>

                  {!user && (
                    <p className="text-xs text-[#8892B0] font-mono">
                      Posting as guest ·{' '}
                      <Link href="/login" className="text-[#00E5FF] underline">Sign in</Link>
                      {' '}to save your review
                    </p>
                  )}

                  <GlowButton
                    color="green"
                    size="md"
                    className="w-full"
                    onClick={handleSubmitReview}
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin border-[#05080F]" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-3.5 h-3.5" />
                        Submit Review
                      </span>
                    )}
                  </GlowButton>
                </motion.div>
              )}
            </AnimatePresence>
          </NeonCard>
        </div>

      </div>
    </div>
  );
}