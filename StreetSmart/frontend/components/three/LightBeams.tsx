'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightBeamProps {
  position: [number, number, number];
  color: string;
  height?: number;
}

export function LightBeam({ position, color, height = 15 }: LightBeamProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + 0.05 * Math.sin(state.clock.elapsedTime * 2 + position[0]);
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.5, height, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function LightBeams() {
  const beams = useMemo(() => [
    { position: [-10, 7, -10] as [number, number, number], color: '#00FF9C' },
    { position: [10, 5, 10] as [number, number, number], color: '#00E5FF' },
    { position: [-5, 8, 8] as [number, number, number], color: '#B388FF' },
    { position: [8, 6, -8] as [number, number, number], color: '#FFB020' },
    { position: [0, 10, 0] as [number, number, number], color: '#FF3B3B' },
  ], []);

  return (
    <>
      {beams.map((beam, i) => (
        <LightBeam key={i} {...beam} />
      ))}
    </>
  );
}