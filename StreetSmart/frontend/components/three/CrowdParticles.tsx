'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CrowdParticlesProps {
  count?: number;
  spread?: number;
  color?: string;
  speed?: number;
}

export default function CrowdParticles({
  count = 100,
  spread = 20,
  color = '#00E5FF',
  speed = 0.5,
}: CrowdParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;

      vel[i * 3] = (Math.random() - 0.5) * speed * 0.1;
      vel[i * 3 + 1] = 0;
      vel[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.1;
    }

    return { positions: pos, velocities: vel };
  }, [count, spread, speed]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      // Boundary wrap
      const halfSpread = spread / 2;
      if (Math.abs(pos[i * 3]) > halfSpread) velocities[i * 3] *= -1;
      if (Math.abs(pos[i * 3 + 2]) > halfSpread) velocities[i * 3 + 2] *= -1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.12}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}