import mapboxgl from 'mapbox-gl';

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// NEON NOIR map style configuration
export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

export const MAP_DEFAULTS = {
  zoom: 13,
  pitch: 45,
  bearing: -15,
  center: [-74.0060, 40.7128] as [number, number],
};

// Custom map layers for StreetSmart
export const SAFETY_HEATMAP_LAYER: mapboxgl.HeatmapLayer = {
  id: 'safety-heatmap',
  type: 'heatmap',
  source: 'safety-heatmap-source',
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
    'heatmap-intensity': 1.5,
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(0,255,156,0)',
      0.3, 'rgba(0,229,255,0.6)',
      0.6, 'rgba(255,176,32,0.7)',
      1, 'rgba(255,59,59,0.9)',
    ],
    'heatmap-radius': 30,
    'heatmap-opacity': 0.65,
  },
};

export function getRouteLineStyle(
  color: string,
  isSelected: boolean
): Partial<mapboxgl.LinePaint> {
  return {
    'line-color': color,
    'line-width': isSelected ? 5 : 2.5,
    'line-opacity': isSelected ? 1 : 0.45,
  };
}

export function createMarkerElement(
  color: string,
  type: 'origin' | 'destination' | 'incident'
): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${color};
    border: 2px solid white;
    box-shadow: 0 0 12px ${color}, 0 0 24px ${color}60;
  `;

  if (type === 'destination') {
    el.style.borderRadius = '2px';
    el.style.transform = 'rotate(45deg)';
  }

  return el;
}