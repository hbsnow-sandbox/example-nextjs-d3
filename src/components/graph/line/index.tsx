"use client";

import { useMemo } from "react";
import * as d3 from "d3";

export function LineGraph({
  width,
  height,
  margin = { top: 16, right: 16, bottom: 32, left: 48 },
  data,
}: {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: { name: string | number; value: number }[];
}) {
  const plotPosition = useMemo(() => {
    return {
      origin: {
        x: margin.left,
        y: height - margin.bottom,
      },
      x: {
        x: width - margin.right,
        y: height - margin.bottom,
      },
      y: {
        x: margin.left,
        y: margin.top,
      },
    } as const satisfies Record<string, { x: number; y: number }>;
  }, [width, height, margin]);

  // X軸
  const xData = useMemo(() => {
    return data.map((d) => d.name);
  }, [data]);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, xData.length - 1])
      .range([plotPosition.origin.x, plotPosition.x.x])
      .nice();
  }, [plotPosition.origin.x, plotPosition.x.x, xData.length]);

  // Y軸
  const yData = useMemo(() => {
    return data.map((d) => d.value);
  }, [data]);
  const yScale = useMemo(() => {
    const min = d3.min(yData) ?? 0;
    const max = d3.max(yData) ?? 0;
    return d3
      .scaleLinear()
      .domain([min, max])
      .range([plotPosition.origin.y, plotPosition.y.y])
      .nice();
  }, [plotPosition.origin.y, plotPosition.y.y, yData]);
  const yTicks = useMemo(() => {
    const ticks = yScale.ticks();
    const scale = d3
      .scaleLinear()
      .domain([ticks.at(0) ?? 0, ticks.at(-1) ?? 0])
      .range([plotPosition.origin.y, plotPosition.y.y])
      .nice();
    return ticks.map((tick) => ({
      value: tick,
      y: scale(tick),
    }));
  }, [plotPosition.origin.y, plotPosition.y.y, yScale]);

  // データポイント
  const points = useMemo(() => {
    return data.map((d, i) => ({
      name: d.name,
      value: d.value,
      x: xScale(i),
      y: yScale(d.value),
    }));
  }, [data, xScale, yScale]);
  const lineSegments = useMemo(() => {
    return points.slice(0, -1).map((point, i) => ({
      x1: point.x,
      y1: point.y,
      x2: points[i + 1].x,
      y2: points[i + 1].y,
    }));
  }, [points]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {/* Axis */}
      <line
        x1={plotPosition.origin.x}
        y1={plotPosition.origin.y}
        x2={plotPosition.x.x}
        y2={plotPosition.x.y}
        stroke="currentColor"
      />
      <line
        x1={plotPosition.origin.x}
        y1={plotPosition.origin.y}
        x2={plotPosition.y.x}
        y2={plotPosition.y.y}
        stroke="currentColor"
      />
      {points.map(({ x, name }, i) => (
        <text
          key={i}
          style={{
            fontSize: "16px",
            textAnchor: "middle",
            dominantBaseline: "hanging",
          }}
          x={x}
          y={plotPosition.origin.y}
          dy={12}
        >
          {name}
        </text>
      ))}
      {yTicks.map(({ y, value }, i) => (
        <text
          key={i}
          style={{
            fontSize: "16px",
            textAnchor: "end",
            dominantBaseline: "middle",
          }}
          x={plotPosition.origin.x}
          y={y}
          dx={-8}
        >
          {value}
        </text>
      ))}
      {yTicks.map(({ y }, i) => (
        <line
          key={i}
          x1={plotPosition.origin.x}
          y1={y}
          x2={plotPosition.x.x}
          y2={y}
          stroke="currentColor"
          opacity={0.2}
        />
      ))}

      {/* Plot */}
      {lineSegments.map((segment, i) => (
        <line
          key={`line-${i}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
      {points.map((point) => (
        <circle
          key={point.name}
          cx={point.x}
          cy={point.y}
          r="2"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
