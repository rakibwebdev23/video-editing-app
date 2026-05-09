'use client';
import React from 'react';
import { LayoutType } from '../../../types/editor.types';

interface LayoutRendererProps {
  layout: LayoutType;
  canvasWidth: number;
  canvasHeight: number;
  children?: (zone: number, rect: { x: number; y: number; width: number; height: number }) => React.ReactNode;
  onDrop?: (zone: number, e: React.DragEvent) => void;
}

function getZones(layout: LayoutType, w: number, h: number): { x: number; y: number; width: number; height: number }[] {
  switch (layout) {
    case 'single':
      return [{ x: 0, y: 0, width: w, height: h }];
    case 'horizontal-1-1':
      return [
        { x: 0, y: 0, width: w / 2, height: h },
        { x: w / 2, y: 0, width: w / 2, height: h },
      ];
    case 'horizontal-2-1':
      return [
        { x: 0, y: 0, width: (w * 2) / 3, height: h },
        { x: (w * 2) / 3, y: 0, width: w / 3, height: h },
      ];
    case 'horizontal-1-2':
      return [
        { x: 0, y: 0, width: w / 3, height: h },
        { x: w / 3, y: 0, width: (w * 2) / 3, height: h },
      ];
    case 'vertical-1-2':
      return [
        { x: 0, y: 0, width: w, height: h / 2 },
        { x: 0, y: h / 2, width: w, height: h / 2 },
      ];
    case 'grid-2-2':
      return [
        { x: 0, y: 0, width: w / 2, height: h / 2 },
        { x: w / 2, y: 0, width: w / 2, height: h / 2 },
        { x: 0, y: h / 2, width: w / 2, height: h / 2 },
        { x: w / 2, y: h / 2, width: w / 2, height: h / 2 },
      ];
    default:
      return [{ x: 0, y: 0, width: w, height: h }];
  }
}

export default function LayoutRenderer({ layout, canvasWidth, canvasHeight, children, onDrop }: LayoutRendererProps) {
  const zones = getZones(layout, canvasWidth, canvasHeight);

  return (
    <>
      {zones.map((zone, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: zone.x,
            top: zone.y,
            width: zone.width,
            height: zone.height,
            border: '1px dashed rgba(59,130,246,0.3)',
            boxSizing: 'border-box',
          }}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
          onDragLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          onDrop={e => {
            e.currentTarget.style.background = 'transparent';
            onDrop?.(idx, e);
          }}
        >
          {children?.(idx, zone)}
        </div>
      ))}
    </>
  );
}
