'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { RouteResult } from '@/services/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface MapCanvasProps {
  selectedRoute:  RouteResult | null;
  routes:         RouteResult[];
  showHeatmap:    boolean;
  origin:         { lat: number; lng: number };
  destination:    { lat: number; lng: number };
  onRouteSelect:  (route: RouteResult) => void;
}

// ─── Real community report marker ────────────────────────────────
const ISSUE_ICONS: Record<string,string> = {
  poor_lighting:   '💡',
  unsafe_area:     '⚠️',
  broken_sidewalk: '🚧',
  missing_ramp:    '♿',
  construction:    '🏗️',
  harassment:      '🚨',
  flooding:        '💧',
  obstruction:     '🚫',
};

const ISSUE_COLORS: Record<string,string> = {
  poor_lighting:   '#FFB020',
  unsafe_area:     '#FF3B3B',
  broken_sidewalk: '#FF3B3B',
  missing_ramp:    '#00FF9C',
  construction:    '#FFB020',
  harassment:      '#FF3B3B',
  flooding:        '#00E5FF',
  obstruction:     '#FF3B3B',
};

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
  const [reports, setReports] = useState<any[]>([]);
  const [hoveredReport, setHoveredReport] = useState<any>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.clientWidth || 800, h: containerRef.current.clientHeight || 600 });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ✅ Fetch real community reports from Supabase
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res  = await fetch(`${API}/reports`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.reports || []);
        // Only show reports that have lat/lng
        setReports(list.filter((r: any) => r.lat && r.lng));
      } catch {}
    };
    fetchReports();
  }, []);

  const W = dims.w;
  const H = dims.h;

  const toSVG = (lat: number, lng: number) => {
    const pad    = 0.05;
    const latMin = Math.min(origin.lat, destination.lat) - pad;
    const latMax = Math.max(origin.lat, destination.lat) + pad;
    const lngMin = Math.min(origin.lng, destination.lng) - pad;
    const lngMax = Math.max(origin.lng, destination.lng) + pad;
    return {
      x: ((lng - lngMin) / (lngMax - lngMin || 1)) * W,
      y: H - ((lat - latMin) / (latMax - latMin || 1)) * H,
    };
  };

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 10; i++) {
      lines.push(
        <line key={`h${i}`} x1={0} y1={(H / 10) * i} x2={W} y2={(H / 10) * i} stroke="rgba(0,229,255,0.06)" strokeWidth={1} />,
        <line key={`v${i}`} x1={(W / 10) * i} y1={0} x2={(W / 10) * i} y2={H} stroke="rgba(0,229,255,0.06)" strokeWidth={1} />
      );
    }
    return lines;
  }, [W, H]);

  const blockDefs = [
    [0.10,0.10,0.15,0.12],[0.30,0.08,0.18,0.10],[0.55,0.10,0.20,0.13],
    [0.75,0.08,0.18,0.11],[0.10,0.28,0.12,0.15],[0.28,0.25,0.22,0.18],
    [0.55,0.27,0.16,0.14],[0.76,0.26,0.17,0.16],[0.10,0.50,0.14,0.12],
    [0.30,0.48,0.20,0.15],[0.56,0.50,0.18,0.13],[0.78,0.50,0.15,0.14],
    [0.10,0.70,0.13,0.16],[0.29,0.68,0.19,0.17],[0.54,0.69,0.21,0.15],
    [0.77,0.70,0.16,0.15],[0.40,0.35,0.12,0.10],[0.62,0.38,0.10,0.09],
  ];

  const hStreets = [0.22, 0.45, 0.65, 0.82];
  const vStreets = [0.20, 0.42, 0.62, 0.80];

  const heatBlobs = showHeatmap ? [
    { cx:0.25, cy:0.35, r:60, color:'#FF3B3B', op:0.18 },
    { cx:0.65, cy:0.55, r:45, color:'#FFB020', op:0.14 },
    { cx:0.45, cy:0.20, r:35, color:'#FF3B3B', op:0.12 },
    { cx:0.80, cy:0.75, r:50, color:'#FFB020', op:0.16 },
    { cx:0.15, cy:0.70, r:40, color:'#00FF9C', op:0.10 },
    { cx:0.55, cy:0.85, r:55, color:'#00FF9C', op:0.12 },
  ] : [];

  // Route colors — 3 distinct colors
  const ROUTE_COLORS = ['#00FF9C', '#00E5FF', '#FFB020'];

  const originPt = toSVG(origin.lat, origin.lng);
  const destPt   = toSVG(destination.lat, destination.lng);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#05080F] overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" style={{ display:'block' }}>
        <defs>
          <filter id="blur-heat"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="glow-g"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          {routes.map((r, i) => (
            <filter key={`gf-${i}`} id={`gf-${i}`}>
              <feGaussianBlur stdDeviation="6" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          ))}
        </defs>

        <rect width={W} height={H} fill="#05080F" />
        {gridLines}

        {/* City blocks */}
        {blockDefs.map(([rx,ry,rw,rh], i) => (
          <rect key={`blk-${i}`} x={rx*W} y={ry*H} width={rw*W} height={rh*H}
            fill="#0B1020" stroke="rgba(0,229,255,0.08)" strokeWidth={0.5} rx={2} />
        ))}

        {/* Streets */}
        {hStreets.map((y, i) => <line key={`sh${i}`} x1={0} y1={y*H} x2={W} y2={y*H} stroke="rgba(0,229,255,0.10)" strokeWidth={2} />)}
        {vStreets.map((x, i) => <line key={`sv${i}`} x1={x*W} y1={0} x2={x*W} y2={H} stroke="rgba(0,229,255,0.10)" strokeWidth={2} />)}

        {/* Heatmap */}
        {heatBlobs.map((b, i) => (
          <circle key={`heat-${i}`} cx={b.cx*W} cy={b.cy*H} r={b.r}
            fill={b.color} opacity={b.op} filter="url(#blur-heat)" />
        ))}

        {/* ✅ 3 DISTINCT ROUTES with different colors */}
        {routes.map((route, i) => {
          if (!route.coordinates || route.coordinates.length < 2) return null;
          const isSelected = selectedRoute?.id === route.id;
          // Each route gets distinct color
          const color = route.color || ROUTE_COLORS[i % ROUTE_COLORS.length];
          const pts = route.coordinates
            .filter(([lng, lat]) => {
              const p = toSVG(lat, lng);
              return p.x >= -50 && p.x <= W+50 && p.y >= -50 && p.y <= H+50;
            })
            .map(([lng, lat]) => { const p = toSVG(lat, lng); return `${p.x},${p.y}`; })
            .join(' ');
          const midCoord = route.coordinates[Math.floor(route.coordinates.length / 2)];
          const midPt = toSVG(midCoord[1], midCoord[0]);

          return (
            <g key={route.id} onClick={() => onRouteSelect(route)} style={{ cursor:'pointer' }}>
              {/* Glow layer */}
              <polyline points={pts} fill="none" stroke={color}
                strokeWidth={isSelected ? 16 : 10}
                opacity={isSelected ? 0.2 : 0.08}
                strokeLinecap="round" strokeLinejoin="round"
                filter={`url(#gf-${i})`} />
              {/* Main line */}
              <polyline points={pts} fill="none" stroke={color}
                strokeWidth={isSelected ? 5 : 2.5}
                opacity={isSelected ? 1 : 0.5}
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={isSelected ? undefined : '10 5'} />

              {/* Route label badge */}
              <g>
                <rect x={midPt.x-32} y={midPt.y-13} width={64} height={22} rx={11}
                  fill="rgba(11,16,32,0.92)" stroke={color} strokeWidth={1} strokeOpacity={0.7} />
                <text x={midPt.x} y={midPt.y+4} textAnchor="middle"
                  fontSize={10} fontFamily="monospace" fill={color} fontWeight="bold">
                  {isSelected ? `${route.scores.overall.toFixed(0)}★ SELECTED` : `Route ${i+1} · ${route.scores.overall.toFixed(0)}★`}
                </text>
              </g>
            </g>
          );
        })}

        {/* ✅ REAL Community Report Markers from Supabase */}
        {reports.map((report, i) => {
          const pt    = toSVG(report.lat, report.lng);
          const color = ISSUE_COLORS[report.issue_type] || '#FFB020';
          const icon  = ISSUE_ICONS[report.issue_type] || '⚠️';
          return (
            <g key={`report-${report.id || i}`}
              onMouseEnter={() => setHoveredReport(report)}
              onMouseLeave={() => setHoveredReport(null)}
              style={{ cursor:'pointer' }}>
              {/* Pulse ring */}
              <circle cx={pt.x} cy={pt.y} r={14} fill={color} opacity={0.12}>
                <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.15;0.04;0.15" dur="2s" repeatCount="indefinite"/>
              </circle>
              {/* Marker circle */}
              <circle cx={pt.x} cy={pt.y} r={9} fill="rgba(11,16,32,0.9)" stroke={color} strokeWidth={1.5}/>
              {/* Warning icon text */}
              <text x={pt.x} y={pt.y+4} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={color}>!</text>

              {/* Tooltip on hover */}
              {hoveredReport?.id === report.id && (
                <g>
                  <rect x={pt.x-55} y={pt.y-44} width={110} height={32} rx={6}
                    fill="rgba(11,16,32,0.96)" stroke={color} strokeWidth={1} strokeOpacity={0.6}/>
                  <text x={pt.x} y={pt.y-29} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={color} fontWeight="bold">
                    {icon} {report.issue_type?.replace(/_/g,' ').toUpperCase() || 'HAZARD'}
                  </text>
                  <text x={pt.x} y={pt.y-17} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="#8892B0">
                    {report.severity?.toUpperCase() || 'REPORTED'} · {report.votes || 0} votes
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Origin marker */}
        <g filter="url(#glow-g)">
          <circle cx={originPt.x} cy={originPt.y} r={12} fill="#00FF9C" opacity={0.2}/>
          <circle cx={originPt.x} cy={originPt.y} r={7} fill="#00FF9C" stroke="white" strokeWidth={1.5}/>
          <text x={originPt.x} y={originPt.y-16} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="#00FF9C">YOU</text>
        </g>

        {/* Destination marker */}
        <g filter="url(#glow-g)">
          <circle cx={destPt.x} cy={destPt.y} r={12} fill="#FF3B3B" opacity={0.2}/>
          <circle cx={destPt.x} cy={destPt.y} r={7} fill="#FF3B3B" stroke="white" strokeWidth={1.5}/>
          <text x={destPt.x} y={destPt.y-16} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="#FF3B3B">DEST</text>
        </g>

        {/* Scan line */}
        <line x1={0} y1={0} x2={W} y2={0} stroke="rgba(0,229,255,0.10)" strokeWidth={1.5}>
          <animateTransform attributeName="transform" type="translate" from="0,0" to={`0,${H}`} dur="6s" repeatCount="indefinite"/>
        </line>
      </svg>

      {/* ✅ Route Legend */}
      {routes.length > 0 && (
        <div className="absolute top-3 left-3 space-y-1">
          {routes.map((route, i) => {
            const color = route.color || ['#00FF9C','#00E5FF','#FFB020'][i % 3];
            const isSelected = selectedRoute?.id === route.id;
            return (
              <motion.div key={route.id} whileHover={{ scale:1.02 }}
                onClick={() => onRouteSelect(route)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{
                  background: isSelected ? `${color}18` : 'rgba(11,16,32,0.85)',
                  border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isSelected ? `0 0 10px ${color}30` : 'none',
                }}>
                <div className="w-3 h-3 rounded-full" style={{ background:color, boxShadow:`0 0 6px ${color}` }}/>
                <span className="font-mono text-xs" style={{ color: isSelected ? color : '#8892B0' }}>
                  Route {i+1} · {route.scores.overall.toFixed(0)}★
                </span>
                {isSelected && <span className="text-xs font-mono" style={{ color }}>← ACTIVE</span>}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ✅ Community Reports Legend */}
      {reports.length > 0 && (
        <div className="absolute top-3 right-3 px-3 py-2 rounded-lg bg-[#0B1020]/90 border border-[#FFB020]/20">
          <p className="font-mono text-[10px] text-[#FFB020] mb-1">⚠️ LIVE HAZARDS ({reports.length})</p>
          {Object.entries(
            reports.reduce((acc: any, r: any) => {
              acc[r.issue_type] = (acc[r.issue_type] || 0) + 1;
              return acc;
            }, {})
          ).slice(0, 4).map(([type, count]: any) => (
            <div key={type} className="flex items-center gap-1.5 text-[9px] font-mono text-[#8892B0]">
              <span>{ISSUE_ICONS[type] || '⚠️'}</span>
              <span>{type.replace(/_/g,' ')}</span>
              <span className="ml-auto" style={{ color: ISSUE_COLORS[type] || '#FFB020' }}>×{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* HUD */}
      <div className="absolute bottom-3 left-3 font-mono text-[10px] text-[#00E5FF]/40 pointer-events-none">
        <div>LAT {origin.lat.toFixed(4)}</div>
        <div>LNG {origin.lng.toFixed(4)}</div>
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] text-[#00E5FF]/30 pointer-events-none">
        STREETSMART CITY GRID v1.0
      </div>

      {/* Mapbox notice */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B1020]/90 border border-[#FFB020]/30 text-[#FFB020] text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-pulse" />
          Demo Map · Add Mapbox token for real streets ·
          <a href="https://account.mapbox.com" target="_blank" rel="noopener noreferrer" className="underline text-[#00E5FF] ml-1">
            Get free token →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Mapbox Map ───────────────────────────────────────────────────
function MapboxMap({ selectedRoute, routes, showHeatmap, origin, destination, onRouteSelect }: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);
  const reportMarkersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError,  setMapError]  = useState(false);
  const [reports,   setReports]   = useState<any[]>([]);

  const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  // ✅ Fetch real reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res  = await fetch(`${API}/reports`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.reports || []);
        setReports(list.filter((r: any) => r.lat && r.lng));
      } catch {}
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        if (cancelled) return;
        mapboxgl.accessToken = TOKEN;
        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style:     'mapbox://styles/mapbox/dark-v11',
          center:    [origin.lng, origin.lat],
          zoom:      13, pitch: 45, bearing: -15, antialias: true,
        });
        map.on('load', () => {
          if (cancelled) return;
          const layers     = map.getStyle().layers ?? [];
          const labelLayer = layers.find((l: any) => l.type==='symbol' && l.layout?.['text-field'])?.id;
          map.addLayer({
            id:'buildings-3d', source:'composite', 'source-layer':'building',
            filter:['==','extrude','true'], type:'fill-extrusion', minzoom:12,
            paint:{
              'fill-extrusion-color':   '#0B1020',
              'fill-extrusion-height':  ['interpolate',['linear'],['zoom'],12,0,15,['get','height']],
              'fill-extrusion-base':    ['interpolate',['linear'],['zoom'],12,0,15,['get','min_height']],
              'fill-extrusion-opacity': 0.85,
            },
          }, labelLayer);
          map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
          setMapLoaded(true);
        });
        map.on('error', () => setMapError(true));
        mapRef.current = map;
      } catch { setMapError(true); }
    })();
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Origin + Destination markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      markersRef.current.forEach(m => m.remove());
      const mkEl = (color: string, label: string) => {
        const el = document.createElement('div');
        el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 12px ${color};cursor:pointer;`;
        el.title = label;
        return el;
      };
      markersRef.current = [
        new mapboxgl.Marker({ element:mkEl('#00FF9C','Your Location') }).setLngLat([origin.lng, origin.lat]).addTo(mapRef.current),
        new mapboxgl.Marker({ element:mkEl('#FF3B3B','Destination') }).setLngLat([destination.lng, destination.lat]).addTo(mapRef.current),
      ];
    })();
  }, [mapLoaded, origin, destination]);

  // ✅ Real report markers on Mapbox
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || reports.length === 0) return;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      reportMarkersRef.current.forEach(m => m.remove());
      reportMarkersRef.current = [];
      reports.forEach((report: any) => {
        const color = ISSUE_COLORS[report.issue_type] || '#FFB020';
        const icon  = ISSUE_ICONS[report.issue_type] || '⚠️';
        const el    = document.createElement('div');
        el.innerHTML = `<div style="font-size:16px;cursor:pointer;filter:drop-shadow(0 0 4px ${color})" title="${report.issue_type?.replace(/_/g,' ')}: ${report.description || ''}">${icon}</div>`;

        const popup = new mapboxgl.Popup({ offset:20, closeButton:false })
          .setHTML(`
            <div style="background:#0B1020;border:1px solid ${color}40;padding:8px 12px;border-radius:8px;font-family:monospace;font-size:11px;color:#E6F1FF;min-width:160px">
              <div style="color:${color};font-weight:bold;margin-bottom:4px">${icon} ${report.issue_type?.replace(/_/g,' ').toUpperCase() || 'HAZARD'}</div>
              <div style="color:#8892B0;margin-bottom:2px">Severity: ${report.severity?.toUpperCase() || 'REPORTED'}</div>
              <div style="color:#8892B0;margin-bottom:2px">Votes: ${report.votes || 0}</div>
              ${report.description ? `<div style="color:#CCD6F6;margin-top:4px;font-size:10px">"${report.description.substring(0,60)}..."</div>` : ''}
            </div>
          `);

        const marker = new mapboxgl.Marker({ element:el })
          .setLngLat([report.lng, report.lat])
          .setPopup(popup)
          .addTo(mapRef.current);
        reportMarkersRef.current.push(marker);
      });
    })();
  }, [mapLoaded, reports]);

  // ✅ 3 distinct routes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || routes.length === 0) return;
    const map = mapRef.current;
    for (let i = 0; i < 10; i++) {
      [`rt-${i}`,`rt-${i}-glow`].forEach(id => { try { map.removeLayer(id); } catch {} });
      try { map.removeSource(`rs-${i}`); } catch {}
    }
    const ROUTE_COLORS = ['#00FF9C','#00E5FF','#FFB020'];
    routes.forEach((route, i) => {
      const isSelected = selectedRoute?.id === route.id;
      const color      = route.color || ROUTE_COLORS[i % ROUTE_COLORS.length];
      map.addSource(`rs-${i}`, {
        type:'geojson',
        data:{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:route.coordinates } },
      });
      map.addLayer({ id:`rt-${i}-glow`, type:'line', source:`rs-${i}`,
        layout:{ 'line-join':'round','line-cap':'round' },
        paint:{ 'line-color':color, 'line-width':isSelected?16:10, 'line-opacity':isSelected?0.2:0.08, 'line-blur':8 },
      });
      map.addLayer({ id:`rt-${i}`, type:'line', source:`rs-${i}`,
        layout:{ 'line-join':'round','line-cap':'round' },
        paint:{ 'line-color':color, 'line-width':isSelected?5:2.5, 'line-opacity':isSelected?1:0.5,
          'line-dasharray': isSelected ? undefined : [2,1] },
      });
      map.on('click',      `rt-${i}`, () => onRouteSelect(route));
      map.on('mouseenter', `rt-${i}`, () => { map.getCanvas().style.cursor='pointer'; });
      map.on('mouseleave', `rt-${i}`, () => { map.getCanvas().style.cursor=''; });
    });
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      const all = routes.flatMap(r => r.coordinates);
      if (!all.length) return;
      const bounds = all.reduce((b: any,c: any) => b.extend(c), new mapboxgl.LngLatBounds(all[0] as any,all[0] as any));
      map.fitBounds(bounds, { padding:80, duration:1400, pitch:45 });
    })();
  }, [mapLoaded, routes, selectedRoute, onRouteSelect]);

  // Heatmap
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    try { map.removeLayer('heatmap'); } catch {}
    try { map.removeSource('heatmap-src'); } catch {}
    if (!showHeatmap) return;
    const features = Array.from({ length:200 }, () => ({
      type:'Feature' as const, properties:{ intensity:Math.random() },
      geometry:{ type:'Point' as const, coordinates:[origin.lng+(Math.random()-.5)*.05, origin.lat+(Math.random()-.5)*.05] },
    }));
    map.addSource('heatmap-src', { type:'geojson', data:{ type:'FeatureCollection', features } });
    map.addLayer({
      id:'heatmap', type:'heatmap', source:'heatmap-src',
      paint:{
        'heatmap-weight':    ['interpolate',['linear'],['get','intensity'],0,0,1,1],
        'heatmap-intensity': 1.5,
        'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(0,255,156,0)',0.3,'rgba(0,229,255,0.6)',0.6,'rgba(255,176,32,0.7)',1,'rgba(255,59,59,0.9)'],
        'heatmap-radius':  30,
        'heatmap-opacity': 0.7,
      },
    });
  }, [mapLoaded, showHeatmap, origin]);

  if (mapError) return <FallbackMap selectedRoute={selectedRoute} routes={routes} showHeatmap={showHeatmap} origin={origin} destination={destination} onRouteSelect={onRouteSelect} />;
  return <div ref={mapContainer} className="w-full h-full" />;
}

export default function MapCanvas(props: MapCanvasProps) {
  const [ready,     setReady]     = useState(false);
  const [useMapbox, setUseMapbox] = useState(false);
  useEffect(() => {
    setUseMapbox((process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '').startsWith('pk.'));
    setReady(true);
  }, []);
  if (!ready) return (
    <div className="w-full h-full bg-[#05080F] flex items-center justify-center">
      <div className="w-8 h-8 border border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!useMapbox) return <FallbackMap {...props} />;
  return <MapboxMap {...props} />;
}