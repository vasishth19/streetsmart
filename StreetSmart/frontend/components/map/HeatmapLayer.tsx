'use client';

import { useEffect } from 'react';
import type mapboxgl from 'mapbox-gl';

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface HeatmapLayerProps {
  map: mapboxgl.Map;
  data: HeatmapPoint[];
  visible: boolean;
}

export function HeatmapLayer({ map, data, visible }: HeatmapLayerProps) {
  const SOURCE_ID = 'safety-heatmap-source';
  const LAYER_ID = 'safety-heatmap-layer';

  useEffect(() => {
    if (!map) return;

    // Cleanup
    if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

    if (!visible || data.length === 0) return;

    const features: GeoJSON.Feature[] = data.map(point => ({
      type: 'Feature',
      properties: { intensity: point.intensity },
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat],
      },
    }));

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features },
    });

    map.addLayer({
      id: LAYER_ID,
      type: 'heatmap',
      source: SOURCE_ID,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 16, 2],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,255,156,0)',
          0.1, 'rgba(0,255,156,0.3)',
          0.3, 'rgba(0,229,255,0.5)',
          0.6, 'rgba(255,176,32,0.7)',
          0.8, 'rgba(255,59,59,0.8)',
          1, 'rgba(255,0,0,1)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 20, 16, 40],
        'heatmap-opacity': 0.7,
      },
    });

    return () => {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, data, visible]);

  return null;
}