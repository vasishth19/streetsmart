'use client';

import { useEffect, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';

interface Marker3DProps {
  map: mapboxgl.Map;
  lat: number;
  lng: number;
  color: string;
  label: string;
  type: 'origin' | 'destination' | 'waypoint';
}

export function Marker3D({ map, lat, lng, color, label, type }: Marker3DProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.className = 'custom-marker-3d';

    const sizeMap = { origin: 16, destination: 16, waypoint: 10 };
    const size = sizeMap[type];

    el.innerHTML = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}40;
          animation: markerPulse 2s ease-in-out infinite;
        "></div>
        ${type !== 'waypoint' ? `
        <div style="
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(11,16,32,0.9);
          border: 1px solid ${color}40;
          color: ${color};
          font-size: 9px;
          font-family: JetBrains Mono, monospace;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
        ">${label}</div>` : ''}
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes markerPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);

    const { Marker, Popup } = require('mapbox-gl');
    const marker = new Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(
        new Popup({ offset: 25 }).setHTML(`
          <div style="background:#0B1020;color:#E6F1FF;padding:6px 10px;border:1px solid ${color}30;border-radius:6px;font-family:Space Grotesk;font-size:11px;">
            ${label}
          </div>
        `)
      )
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [map, lat, lng, color, label, type]);

  return null;
}