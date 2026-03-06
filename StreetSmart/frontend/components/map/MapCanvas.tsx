'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { RouteResult } from '@/services/api';

interface MapCanvasProps {
  selectedRoute:  RouteResult | null;
  routes:         RouteResult[];
  showHeatmap:    boolean;
  origin:         { lat: number; lng: number };
  destination:    { lat: number; lng: number };
  onRouteSelect:  (route: RouteResult) => void;
}

// ─── SVG Fallback Map ─────────────────────────────────────────────
function FallbackMap({
  routes,
  selectedRoute,
  origin,
  destination,
  showHeatmap,
  onRouteSelect,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.clientWidth  || 800,
          h: containerRef.current.clientHeight || 600,
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const W = dims.w;
  const H = dims.h;

  // lat/lng → SVG pixel coords
  const toSVG = (lat: number, lng: number) => {
    const pad    = 0.02;
    const latMin = Math.min(origin.lat, destination.lat) - pad;
    const latMax = Math.max(origin.lat, destination.lat) + pad;
    const lngMin = Math.min(origin.lng, destination.lng) - pad;
    const lngMax = Math.max(origin.lng, destination.lng) + pad;
    return {
      x: ((lng - lngMin) / (lngMax - lngMin)) * W,
      y: H - ((lat - latMin) / (latMax - latMin)) * H,
    };
  };

  // Grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 10; i++) {
      lines.push(
        <line key={`h${i}`} x1={0} y1={(H / 10) * i} x2={W} y2={(H / 10) * i}
          stroke="rgba(0,229,255,0.06)" strokeWidth={1} />,
        <line key={`v${i}`} x1={(W / 10) * i} y1={0} x2={(W / 10) * i} y2={H}
          stroke="rgba(0,229,255,0.06)" strokeWidth={1} />
      );
    }
    return lines;
  }, [W, H]);

  // City blocks
  const blockDefs = [
    [0.10,0.10,0.15,0.12],[0.30,0.08,0.18,0.10],[0.55,0.10,0.20,0.13],
    [0.75,0.08,0.18,0.11],[0.10,0.28,0.12,0.15],[0.28,0.25,0.22,0.18],
    [0.55,0.27,0.16,0.14],[0.76,0.26,0.17,0.16],[0.10,0.50,0.14,0.12],
    [0.30,0.48,0.20,0.15],[0.56,0.50,0.18,0.13],[0.78,0.50,0.15,0.14],
    [0.10,0.70,0.13,0.16],[0.29,0.68,0.19,0.17],[0.54,0.69,0.21,0.15],
    [0.77,0.70,0.16,0.15],[0.40,0.35,0.12,0.10],[0.62,0.38,0.10,0.09],
  ];

  // Street lines
  const hStreets = [0.22, 0.45, 0.65, 0.82];
  const vStreets = [0.20, 0.42, 0.62, 0.80];

  // Heatmap blobs
  const heatBlobs = showHeatmap
    ? [
        { cx: 0.25, cy: 0.35, r: 60, color: '#FF3B3B', op: 0.18 },
        { cx: 0.65, cy: 0.55, r: 45, color: '#FFB020', op: 0.14 },
        { cx: 0.45, cy: 0.20, r: 35, color: '#FF3B3B', op: 0.12 },
        { cx: 0.80, cy: 0.75, r: 50, color: '#FFB020', op: 0.16 },
        { cx: 0.15, cy: 0.70, r: 40, color: '#00FF9C', op: 0.10 },
        { cx: 0.55, cy: 0.85, r: 55, color: '#00FF9C', op: 0.12 },
      ]
    : [];

  const originPt = toSVG(origin.lat, origin.lng);
  const destPt   = toSVG(destination.lat, destination.lng);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#05080F] overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0"
        style={{ display: 'block' }}
      >
        {/* Defs */}
        <defs>
          <filter id="blur-heat">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="glow-origin">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-dest">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {routes.map((r) => (
            <filter key={`gf-${r.id}`} id={`gf-${r.id}`}>
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#05080F" />

        {/* Grid */}
        {gridLines}

        {/* City blocks */}
        {blockDefs.map(([rx, ry, rw, rh], i) => (
          <rect
            key={`blk-${i}`}
            x={rx * W} y={ry * H}
            width={rw * W} height={rh * H}
            fill="#0B1020"
            stroke="rgba(0,229,255,0.08)"
            strokeWidth={0.5}
            rx={2}
          />
        ))}

        {/* Streets */}
        {hStreets.map((y, i) => (
          <line key={`sh${i}`} x1={0} y1={y * H} x2={W} y2={y * H}
            stroke="rgba(0,229,255,0.10)" strokeWidth={2} />
        ))}
        {vStreets.map((x, i) => (
          <line key={`sv${i}`} x1={x * W} y1={0} x2={x * W} y2={H}
            stroke="rgba(0,229,255,0.10)" strokeWidth={2} />
        ))}

        {/* Heatmap */}
        {heatBlobs.map((b, i) => (
          <circle key={`heat-${i}`}
            cx={b.cx * W} cy={b.cy * H} r={b.r}
            fill={b.color} opacity={b.op}
            filter="url(#blur-heat)"
          />
        ))}

        {/* Routes */}
        {routes.map((route) => {
          if (!route.coordinates || route.coordinates.length < 2) return null;
          const isSelected = selectedRoute?.id === route.id;
          const pts = route.coordinates
            .map(([lng, lat]) => {
              const p = toSVG(lat, lng);
              return `${p.x},${p.y}`;
            })
            .join(' ');

          // Mid-point label for selected route
          const midCoord = route.coordinates[Math.floor(route.coordinates.length / 2)];
          const midPt    = toSVG(midCoord[1], midCoord[0]);

          return (
            <g key={route.id} onClick={() => onRouteSelect(route)}
              style={{ cursor: 'pointer' }}>
              {/* Glow */}
              <polyline
                points={pts} fill="none"
                stroke={route.color}
                strokeWidth={isSelected ? 14 : 8}
                opacity={isSelected ? 0.15 : 0.06}
                strokeLinecap="round" strokeLinejoin="round"
                filter={`url(#gf-${route.id})`}
              />
              {/* Line */}
              <polyline
                points={pts} fill="none"
                stroke={route.color}
                strokeWidth={isSelected ? 4 : 2}
                opacity={isSelected ? 1 : 0.45}
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={isSelected ? undefined : '8 4'}
              />
              {/* Score badge on selected */}
              {isSelected && (
                <g>
                  <rect
                    x={midPt.x - 28} y={midPt.y - 14}
                    width={56} height={22} rx={11}
                    fill="rgba(11,16,32,0.92)"
                    stroke={route.color} strokeWidth={1} strokeOpacity={0.6}
                  />
                  <text
                    x={midPt.x} y={midPt.y + 4}
                    textAnchor="middle" fontSize={11}
                    fontFamily="monospace"
                    fill={route.color} fontWeight="bold"
                  >
                    {route.scores.overall.toFixed(0)} ★
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Origin marker */}
        <g filter="url(#glow-origin)">
          <circle cx={originPt.x} cy={originPt.y} r={10}
            fill="#00FF9C" opacity={0.2} />
          <circle cx={originPt.x} cy={originPt.y} r={6}
            fill="#00FF9C" stroke="white" strokeWidth={1.5} />
          <text x={originPt.x} y={originPt.y - 14}
            textAnchor="middle" fontSize={9}
            fontFamily="monospace" fill="#00FF9C">
            ORIGIN
          </text>
        </g>

        {/* Destination marker */}
        <g filter="url(#glow-dest)">
          <circle cx={destPt.x} cy={destPt.y} r={10}
            fill="#FF3B3B" opacity={0.2} />
          <circle cx={destPt.x} cy={destPt.y} r={6}
            fill="#FF3B3B" stroke="white" strokeWidth={1.5} />
          <text x={destPt.x} y={destPt.y - 14}
            textAnchor="middle" fontSize={9}
            fontFamily="monospace" fill="#FF3B3B">
            DEST
          </text>
        </g>

        {/* Animated scan line */}
        <line x1={0} y1={0} x2={W} y2={0}
          stroke="rgba(0,229,255,0.12)" strokeWidth={1.5}>
          <animateTransform
            attributeName="transform" type="translate"
            from={`0,0`} to={`0,${H}`}
            dur="6s" repeatCount="indefinite"
          />
        </line>
      </svg>

      {/* HUD corners */}
      <div className="absolute top-3 left-3 font-mono text-[10px] text-[#00E5FF]/40 pointer-events-none select-none">
        <div>LAT {origin.lat.toFixed(4)}N</div>
        <div>LNG {Math.abs(origin.lng).toFixed(4)}W</div>
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] text-[#00E5FF]/30 pointer-events-none select-none">
        STREETSMART CITY GRID v1.0
      </div>

      {/* Token notice */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B1020]/90 border border-[#FFB020]/30 text-[#FFB020] text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-pulse" />
          Demo Map · Add Mapbox token for real map ·
          <a href="https://account.mapbox.com" target="_blank" rel="noopener noreferrer"
            className="underline text-[#00E5FF] ml-1">
            Get free token →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Mapbox Map ───────────────────────────────────────────────────
function MapboxMap({
  selectedRoute,
  routes,
  showHeatmap,
  origin,
  destination,
  onRouteSelect,
}: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);
  const [mapLoaded,  setMapLoaded]  = useState(false);
  const [mapError,   setMapError]   = useState(false);

  const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  // Init map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        if (cancelled) return;

        mapboxgl.accessToken = TOKEN;

        const map = new mapboxgl.Map({
          container:  mapContainer.current!,
          style:      'mapbox://styles/mapbox/dark-v11',
          center:     [origin.lng, origin.lat],
          zoom:       13,
          pitch:      45,
          bearing:    -15,
          antialias:  true,
        });

        map.on('load', () => {
          if (cancelled) return;
          // 3D buildings
          const layers      = map.getStyle().layers ?? [];
          const labelLayer  = layers.find(
            (l: any) => l.type === 'symbol' && l.layout?.['text-field']
          )?.id;

          map.addLayer(
            {
              id:           'buildings-3d',
              source:       'composite',
              'source-layer': 'building',
              filter:       ['==', 'extrude', 'true'],
              type:         'fill-extrusion',
              minzoom:      12,
              paint: {
                'fill-extrusion-color':   '#0B1020',
                'fill-extrusion-height':  ['interpolate', ['linear'], ['zoom'], 12, 0, 15, ['get', 'height']],
                'fill-extrusion-base':    ['interpolate', ['linear'], ['zoom'], 12, 0, 15, ['get', 'min_height']],
                'fill-extrusion-opacity': 0.85,
              },
            },
            labelLayer
          );

          map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
          setMapLoaded(true);
        });

        map.on('error', () => setMapError(true));
        mapRef.current = map;
      } catch {
        setMapError(true);
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const mkEl = (color: string) => {
        const el = document.createElement('div');
        el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 10px ${color};`;
        return el;
      };

      markersRef.current = [
        new mapboxgl.Marker({ element: mkEl('#00FF9C') }).setLngLat([origin.lng,      origin.lat]).addTo(mapRef.current),
        new mapboxgl.Marker({ element: mkEl('#FF3B3B') }).setLngLat([destination.lng, destination.lat]).addTo(mapRef.current),
      ];
    })();
  }, [mapLoaded, origin, destination]);

  // Routes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || routes.length === 0) return;
    const map = mapRef.current;

    // Cleanup
    for (let i = 0; i < 10; i++) {
      [`rt-${i}`, `rt-${i}-glow`].forEach((id) => { try { map.removeLayer(id); } catch {} });
      try { map.removeSource(`rs-${i}`); } catch {}
    }

    routes.forEach((route, i) => {
      const isSelected = selectedRoute?.id === route.id;
      const color      = route.color ?? '#00E5FF';

      map.addSource(`rs-${i}`, {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.coordinates } },
      });
      map.addLayer({ id: `rt-${i}-glow`, type: 'line', source: `rs-${i}`,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint:  { 'line-color': color, 'line-width': isSelected ? 14 : 8, 'line-opacity': isSelected ? 0.2 : 0.08, 'line-blur': 8 },
      });
      map.addLayer({ id: `rt-${i}`, type: 'line', source: `rs-${i}`,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint:  { 'line-color': color, 'line-width': isSelected ? 5 : 2.5, 'line-opacity': isSelected ? 1 : 0.5 },
      });

      map.on('click',      `rt-${i}`, () => onRouteSelect(route));
      map.on('mouseenter', `rt-${i}`, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', `rt-${i}`, () => { map.getCanvas().style.cursor = ''; });
    });

    // Fit bounds
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      const all      = routes.flatMap((r) => r.coordinates);
      if (all.length === 0) return;
      const bounds = all.reduce(
        (b: any, c: any) => b.extend(c as any),
        new mapboxgl.LngLatBounds(all[0] as any, all[0] as any)
      );
      map.fitBounds(bounds, { padding: 80, duration: 1400, pitch: 45 });
    })();
  }, [mapLoaded, routes, selectedRoute, onRouteSelect]);

  // Heatmap
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    try { map.removeLayer('heatmap'); } catch {}
    try { map.removeSource('heatmap-src'); } catch {}

    if (!showHeatmap) return;

    const features = Array.from({ length: 200 }, () => ({
      type: 'Feature' as const,
      properties: { intensity: Math.random() },
      geometry: {
        type: 'Point' as const,
        coordinates: [
          origin.lng + (Math.random() - 0.5) * 0.05,
          origin.lat + (Math.random() - 0.5) * 0.05,
        ],
      },
    }));

    map.addSource('heatmap-src', { type: 'geojson', data: { type: 'FeatureCollection', features } });
    map.addLayer({
      id: 'heatmap', type: 'heatmap', source: 'heatmap-src',
      paint: {
        'heatmap-weight':     ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
        'heatmap-intensity':  1.5,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,255,156,0)', 0.3, 'rgba(0,229,255,0.6)',
          0.6, 'rgba(255,176,32,0.7)', 1, 'rgba(255,59,59,0.9)',
        ],
        'heatmap-radius':   30,
        'heatmap-opacity':  0.7,
      },
    });
  }, [mapLoaded, showHeatmap, origin]);

  if (mapError) {
    return (
      <FallbackMap
        selectedRoute={selectedRoute} routes={routes}
        showHeatmap={showHeatmap} origin={origin}
        destination={destination} onRouteSelect={onRouteSelect}
      />
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}

// ─── Main export — decides which map to render ────────────────────
export default function MapCanvas(props: MapCanvasProps) {
  const [ready,      setReady]      = useState(false);
  const [useMapbox,  setUseMapbox]  = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
    setUseMapbox(token.startsWith('pk.'));
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="w-full h-full bg-[#05080F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#00E5FF] font-mono text-xs tracking-widest">INITIALIZING MAP...</p>
        </div>
      </div>
    );
  }

  if (!useMapbox) {
    return <FallbackMap {...props} />;
  }

  return <MapboxMap {...props} />;
}