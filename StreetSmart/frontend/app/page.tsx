'use client';

import PWAInstallBanner from '@/components/ui/PWAInstallBanner';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Shield, Navigation, Accessibility,
  Volume2, ChevronRight, Map,
  BarChart3, AlertTriangle,
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import NeonCard    from '@/components/ui/NeonCard';

// ── Dynamic Three.js import — SSR disabled, with CSS fallback ─────
const CityScene = dynamic(() => import('@/components/three/CityScene'), {
  ssr:     false,
  loading: () => <SceneLoader />,
});

function SceneLoader() {
  return (
    <div className="w-full h-full bg-[#05080F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#00E5FF] font-mono text-xs tracking-widest animate-pulse">
          LOADING CITY SIMULATION...
        </p>
      </div>
    </div>
  );
}

// ─── Static data ──────────────────────────────────────────────────
const FEATURES = [
  {
    icon:        Shield,
    title:       'Safety-First Routing',
    description: 'Routes optimized using real-time crime data, lighting scores, and CCTV coverage maps.',
    color:       '#00FF9C',
  },
  {
    icon:        Accessibility,
    title:       'Universal Accessibility',
    description: 'Wheelchair ramps, smooth surfaces, no stairs — every body navigates with confidence.',
    color:       '#00E5FF',
  },
  {
    icon:        Volume2,
    title:       'Audio Navigation',
    description: 'Turn-by-turn voice guidance optimized for visually impaired users with SSML support.',
    color:       '#B388FF',
  },
  {
    icon:        BarChart3,
    title:       'Smart City Analytics',
    description: 'Live safety heatmaps, crowd prediction, and infrastructure intelligence dashboards.',
    color:       '#FFB020',
  },
];

const PROFILES = [
  { label: 'Women',           icon: '👩',  color: '#FF69B4', desc: 'Safe, lit, monitored routes'  },
  { label: 'Elderly',         icon: '🧓',  color: '#FFB020', desc: 'No stairs, rest stops'         },
  { label: 'Wheelchair',      icon: '♿',  color: '#00FF9C', desc: 'Full accessibility routing'    },
  { label: 'Visually Impaired', icon: '👁️', color: '#B388FF', desc: 'Audio-first navigation'       },
];

const STATS = [
  { value: '98.2%', label: 'Safety Rate',    color: '#00FF9C' },
  { value: '12',    label: 'Cities Covered', color: '#00E5FF' },
  { value: '2.7K',  label: 'Routes Today',   color: '#FFB020' },
  { value: '4.9★',  label: 'User Rating',    color: '#B388FF' },
];

const SCORING_FACTORS = [
  { label: 'Safety',        weight: '35%', color: '#FF3B3B' },
  { label: 'Lighting',      weight: '25%', color: '#FFE082' },
  { label: 'Crowd',         weight: '20%', color: '#00E5FF' },
  { label: 'Accessibility', weight: '20%', color: '#00FF9C' },
];

// ─── Page component ───────────────────────────────────────────────
export default function LandingPage() {
  const [loaded,        setLoaded]        = useState(false);
  const [activeProfile, setActiveProfile] = useState(0);

  // Trigger entrance animations after hydration
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Auto-cycle profile badges
  useEffect(() => {
    const id = setInterval(
      () => setActiveProfile((p) => (p + 1) % PROFILES.length),
      3000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#05080F] overflow-hidden">

      {/* ── Background effects ─────────────────────────────────── */}
      <div className="fixed inset-0 grid-overlay opacity-50 pointer-events-none z-0" />
      <div className="fixed inset-0 scanlines   pointer-events-none z-0" />

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col">

        {/* 3D City Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<SceneLoader />}>
            <CityScene />
          </Suspense>
        </div>

        {/* Gradient fade to content below */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080F]/20 via-transparent to-[#05080F] z-10 pointer-events-none" />

        {/* ── Nav bar ─────────────────────────────────────────── */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00FF9C]/10 border border-[#00FF9C]/40 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#00FF9C]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#E6F1FF]">
              Street<span className="text-[#00FF9C]">Smart</span>
            </span>
            <span className="font-mono text-xs text-[#8892B0] hidden sm:block">v1.0</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <Link href="/map">
              <GlowButton color="cyan" size="sm">
                Launch Navigator
              </GlowButton>
            </Link>
            <Link href="/dashboard">
              <button className="hidden sm:block text-sm text-[#8892B0] hover:text-[#00E5FF] transition-colors px-4 py-2">
                Dashboard
              </button>
            </Link>
          </motion.div>
        </nav>

        {/* ── Hero content ─────────────────────────────────────── */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 pb-24">
          <AnimatePresence>
            {loaded && (
              <>
                {/* Online badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs font-mono text-[#00FF9C] border border-[#00FF9C]/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] animate-pulse" />
                  SMART CITY NAVIGATION SYSTEM · ONLINE
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none tracking-tight"
                >
                  Navigate{' '}
                  <span className="neon-text-green">Safer.</span>
                  <br />
                  Navigate{' '}
                  <span className="neon-text-cyan">Smarter.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-2xl text-lg md:text-xl text-[#8892B0] mb-10 leading-relaxed"
                >
                  The first navigation platform that optimizes for{' '}
                  <span className="text-[#00FF9C]">safety</span>,{' '}
                  <span className="text-[#00E5FF]">accessibility</span>, and{' '}
                  <span className="text-[#B388FF]">inclusivity</span>{' '}
                  — not speed. Built for the cities of tomorrow.
                </motion.p>

                {/* Profile badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="flex flex-wrap gap-2 justify-center mb-6"
                >
                  {PROFILES.map((profile, i) => (
                    <motion.button
                      key={profile.label}
                      onClick={() => setActiveProfile(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border"
                      style={
                        activeProfile === i
                          ? {
                              borderColor: `${profile.color}50`,
                              background:  `${profile.color}12`,
                              color:        profile.color,
                            }
                          : {
                              borderColor: 'rgba(136,146,176,0.2)',
                              color:       '#8892B0',
                            }
                      }
                    >
                      <span>{profile.icon}</span>
                      <span>{profile.label}</span>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Profile description */}
                <motion.p
                  key={activeProfile}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-[#8892B0] mb-10 font-mono h-5"
                >
                  {PROFILES[activeProfile].desc}
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  className="flex flex-col sm:flex-row gap-4 items-center"
                >
                  <Link href="/map">
                    <GlowButton color="green" size="lg" className="min-w-48">
                      <Navigation className="w-4 h-4 mr-2" />
                      Start Navigating
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </GlowButton>
                  </Link>
                  <Link href="/dashboard">
                    <GlowButton color="cyan" size="lg" variant="outline" className="min-w-48">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </GlowButton>
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* ── Stats bar ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="relative z-20 border-t border-[#00E5FF]/10 bg-[#05080F]/80 backdrop-blur-lg"
        >
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{
                    color:      stat.color,
                    textShadow: `0 0 20px ${stat.color}40`,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-[#8892B0] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block font-mono text-xs text-[#00E5FF] px-3 py-1 rounded border border-[#00E5FF]/20 mb-4">
              CORE CAPABILITIES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for Every <span className="neon-text-green">Body</span>
            </h2>
            <p className="text-[#8892B0] text-lg max-w-2xl mx-auto">
              Smart City infrastructure-grade navigation intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <NeonCard color={feature.color} className="h-full">
                  <div className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${feature.color}15`,
                        border:     `1px solid ${feature.color}30`,
                      }}
                    >
                      <feature.icon
                        className="w-5 h-5"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#E6F1FF] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#8892B0] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </NeonCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SCORING FORMULA SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 md:p-12 text-center"
          >
            <div className="inline-block font-mono text-xs text-[#FFB020] px-3 py-1 rounded border border-[#FFB020]/20 mb-6">
              ROUTE SCORING ENGINE
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Intelligent{' '}
              <span className="neon-text-cyan">Multi-Factor</span> Scoring
            </h2>

            {/* Formula code block */}
            <div className="font-mono text-sm md:text-base bg-[#05080F] rounded-lg p-6 text-left mb-8 border border-[#00E5FF]/10">
              <div className="text-[#8892B0] mb-3">// Route Score Computation</div>
              <div className="text-[#E6F1FF]">
                <span className="text-[#B388FF]">score</span>
                {' = '}
                <span className="text-[#FFB020]">0.35</span>
                {' × '}
                <span className="text-[#FF3B3B]">safety</span>
              </div>
              <div className="text-[#E6F1FF] mt-1 ml-8">
                {'+ '}
                <span className="text-[#FFB020]">0.25</span>
                {' × '}
                <span className="text-[#FFE082]">lighting</span>
              </div>
              <div className="text-[#E6F1FF] mt-1 ml-8">
                {'+ '}
                <span className="text-[#FFB020]">0.20</span>
                {' × '}
                <span className="text-[#00E5FF]">crowd</span>
              </div>
              <div className="text-[#E6F1FF] mt-1 ml-8">
                {'+ '}
                <span className="text-[#FFB020]">0.20</span>
                {' × '}
                <span className="text-[#00FF9C]">accessibility</span>
              </div>
            </div>

            {/* Weight cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SCORING_FACTORS.map((factor) => (
                <div key={factor.label} className="hud-stat text-center">
                  <div
                    className="text-2xl font-bold font-mono"
                    style={{ color: factor.color }}
                  >
                    {factor.weight}
                  </div>
                  <div className="text-xs text-[#8892B0] mt-1">{factor.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Navigate{' '}
            <span className="neon-text-green">Safely</span>?
          </h2>
          <p className="text-[#8892B0] text-lg mb-10 max-w-xl mx-auto">
            Join thousands of users who prioritize safety over speed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map">
              <GlowButton color="green" size="lg">
                <Map className="w-4 h-4 mr-2" />
                Open Navigator
              </GlowButton>
            </Link>
            <Link href="/report">
              <GlowButton color="amber" size="lg" variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report an Issue
              </GlowButton>
            </Link>
          </div>
        </motion.div>
      </section>

     {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[#00E5FF]/10 py-8 px-6 text-center">
        <p className="text-[#8892B0] text-sm font-mono">
          StreetSmart v1.0 · Smart City Navigation · Built for Inclusivity
        </p>
        <p className="text-[#4A5568] text-xs font-mono mt-2">
          Built by <span className="text-[#00FF9C]">Vansh Chaturvedi</span> · Assmi Singh · Anshika Dixit · Prakhar Dubey · 2025
        </p>
      </footer>

    </main>
  );
}