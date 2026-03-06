'use client';

import { useEffect } from 'react';
import type mapboxgl from 'mapbox-gl';
import type { RouteResult } from '@/services/api';

interface RouteLayerProps {
  map: mapboxgl.Map;
  route: RouteResult;
  isSelected: boolean;
  layerIndex: number;
  onClick: () => void;
}

export function RouteLayer({ map, route, isSelected, layerIndex, onClick }: RouteLayerProps) {
  const sourceId = `route-source-${layerIndex}`;
  const layerId = `route-layer-${layerIndex}`;
  const glowId = `route-glow-${layerIndex}`;

  useEffect(() => {
    if (!map) return;

    const color = route.color || '#00E5FF';

    // Cleanup previous layers
    [glowId, layerId].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    // Add new source
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates,
        },
      },
    });

    // Glow layer
    map.addLayer({
      id: glowId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': color,
        'line-width': isSelected ? 14 : 8,
        'line-opacity': isSelected ? 0.2 : 0.08,
        'line-blur': 10,
      },
    });

    // Main route line
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': color,
        'line-width': isSelected ? 5 : 2.5,
        'line-opacity': isSelected ? 1 : 0.4,
        'line-dasharray': isSelected ? undefined : [4, 3],
      },
    });

    map.on('click', layerId, onClick);
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });

    return () => {
      [glowId, layerId].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, route, isSelected, layerIndex]);

  return null;
}