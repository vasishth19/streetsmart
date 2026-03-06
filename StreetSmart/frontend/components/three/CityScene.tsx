'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// ─── Simple Building ──────────────────────────────────────────────
function Building({
  position,
  height,
  width,
  depth,
  color,
}: {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
}) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.08}
        metalness={0.4}
        roughness={0.6}
      />
    </mesh>
  );
}

// ─── Grid Floor ───────────────────────────────────────────────────
function CityGrid() {
  return (
    <gridHelper
      args={[60, 30, '#00E5FF', '#0B1020']}
      position={[0, -0.05, 0]}
    />
  );
}

// ─── Minimal Particles ───────────────────────────────────────────
function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = Math.random() * 15;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#00E5FF"
        size={0.06}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Auto-rotating camera ────────────────────────────────────────
function AutoCamera() {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.04;
    state.camera.position.x = Math.sin(t) * 3;
    state.camera.position.z = 28 + Math.cos(t) * 2;
    state.camera.lookAt(0, 4, 0);
  });
  return null;
}

// ─── Scene content ────────────────────────────────────────────────
function SceneContent() {
  const buildings = useMemo(() => {
    const list = [];
    const colors = ['#0D1A2E', '#0B1828', '#091422', '#0F1F35'];
    // Reduced count for performance
    for (let x = -18; x <= 18; x += 5) {
      for (let z = -18; z <= 18; z += 5) {
        if (Math.random() > 0.35) {
          list.push({
            id:     `${x}-${z}`,
            pos:    [x + (Math.random()-0.5)*2, 0, z + (Math.random()-0.5)*2] as [number,number,number],
            height: 2 + Math.random() * 10,
            width:  1.2 + Math.random() * 1.2,
            depth:  1.2 + Math.random() * 1.2,
            color:  colors[Math.floor(Math.random() * colors.length)],
          });
        }
      }
    }
    return list;
  }, []);

  return (
    <>
      <ambientLight intensity={0.15} color="#001233" />
      <directionalLight position={[8, 12, 4]} intensity={0.4} color="#00E5FF" />
      <pointLight position={[0, 18, 0]}   intensity={0.6} color="#00FF9C" distance={35} />
      <pointLight position={[-12, 4, -12]} intensity={0.5} color="#FF3B3B" distance={20} />
      <pointLight position={[12, 4, 12]}  intensity={0.5} color="#00E5FF" distance={20} />

      <Stars radius={80} depth={40} count={800} factor={2} saturation={0} fade speed={0.5} />
      <CityGrid />

      {buildings.map(b => (
        <Building key={b.id} position={b.pos}
          height={b.height} width={b.width} depth={b.depth} color={b.color} />
      ))}

      <Particles count={60} />

      <Float speed={1.5} floatIntensity={1.5}>
        <mesh position={[-7, 7, -4]}>
          <sphereGeometry args={[0.25]} />
          <meshStandardMaterial emissive="#00FF9C" emissiveIntensity={4} color="#00FF9C" />
        </mesh>
      </Float>
      <Float speed={2} floatIntensity={2}>
        <mesh position={[9, 5, 7]}>
          <sphereGeometry args={[0.18]} />
          <meshStandardMaterial emissive="#00E5FF" emissiveIntensity={4} color="#00E5FF" />
        </mesh>
      </Float>

      <AutoCamera />
    </>
  );
}

// ─── CSS Fallback (when WebGL fails) ────────────────────────────
function CSSCityFallback() {
  const buildings = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left:   `${4 + (i % 8) * 12}%`,
      height: `${20 + Math.random() * 45}%`,
      width:  `${5 + Math.random() * 4}%`,
      delay:  `${Math.random() * 2}s`,
      color:  i % 4 === 0 ? '#00FF9C' : i % 4 === 1 ? '#00E5FF' : '#0D1A2E',
    })), []
  );

  return (
    <div className="w-full h-full bg-[#05080F] relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated scan line */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent"
        style={{ animation: 'scanMove 4s linear infinite' }}
      />

      {/* CSS Buildings */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-4">
        {buildings.map(b => (
          <motion.div
            key={b.id}
            initial={{ height: 0 }}
            animate={{ height: b.height }}
            transition={{ duration: 1.5, delay: parseFloat(b.delay), ease: 'easeOut' }}
            className="relative flex-shrink-0"
            style={{ width: b.width, backgroundColor: '#0B1020', border: `1px solid ${b.color}15` }}
          >
            {/* Window grid */}
            <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
              {Array.from({ length: 8 }).map((_, wi) => (
                <div key={wi}
                  className="rounded-sm"
                  style={{
                    backgroundColor: Math.random() > 0.5 ? `${b.color}20` : 'transparent',
                    animation: `windowFlicker ${2 + Math.random() * 3}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            {/* Roof glow */}
            <div className="absolute -top-px left-0 right-0 h-px"
              style={{ backgroundColor: b.color, boxShadow: `0 0 8px ${b.color}` }} />
          </motion.div>
        ))}
      </div>

      {/* Floating orbs */}
      {[
        { color: '#00FF9C', x: '20%', y: '30%', size: 8 },
        { color: '#00E5FF', x: '70%', y: '25%', size: 6 },
        { color: '#B388FF', x: '45%', y: '20%', size: 5 },
      ].map((orb, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            backgroundColor: orb.color,
            boxShadow: `0 0 ${orb.size * 3}px ${orb.color}`,
          }}
          animate={{ y: [0, -12, 0], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i}
            className="absolute rounded-full bg-white"
            style={{
              left:   `${Math.random() * 100}%`,
              top:    `${Math.random() * 60}%`,
              width:  `${1 + Math.random()}px`,
              height: `${1 + Math.random()}px`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes scanMove {
          0%   { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        @keyframes windowFlicker {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes twinkle {
          0%,100% { opacity: 0.2; }
          50%      { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Export with WebGL detection ────────────────────────────
export default function CityScene() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [contextLost,    setContextLost]    = useState(false);

  useEffect(() => {
    // Test WebGL support before attempting to render
    try {
      const canvas  = document.createElement('canvas');
      const gl      = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
      // Check if context is already lost
      if ((gl as WebGLRenderingContext).isContextLost()) {
        setWebglSupported(false);
        return;
      }
      setWebglSupported(true);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Still checking
  if (webglSupported === null) return null;

  // WebGL not available → CSS fallback
  if (!webglSupported || contextLost) {
    return <CSSCityFallback />;
  }

  return (
    <Canvas
      camera={{ position: [0, 12, 28], fov: 55 }}
      gl={{
        antialias:        false,   // cheaper
        alpha:            true,
        powerPreference:  'default',
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }}
      dpr={Math.min(window.devicePixelRatio, 1.5)}  // cap pixel ratio
      frameloop="demand"   // only render when needed
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          console.warn('WebGL context lost – switching to CSS fallback');
          setContextLost(true);
        });
      }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#05080F']} />
      <fog attach="fog" args={['#05080F', 25, 65]} />
      <SceneContent />
    </Canvas>
  );
}