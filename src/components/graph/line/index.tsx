"use client";

import { useMemo, useState } from "react";
import * as d3 from "d3";

import { DEFAULT_COLORS } from "../constants";
import { Tooltip } from "../tooltip";

export function LineGraph({
  width,
  height,
  margin = { top: 16, right: 16, bottom: 32, left: 48 },
  data,
  colors = DEFAULT_COLORS,
}: {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: { label: string; data: { name: string | number; value: number }[] }[];
  colors?: string[];
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
    return data[0]?.data.map((d) => d.name) ?? [];
  }, [data]);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, xData.length - 1])
      .range([plotPosition.origin.x, plotPosition.x.x])
      .nice();
  }, [plotPosition.origin.x, plotPosition.x.x, xData.length]);

  // Y軸
  const yScale = useMemo(() => {
    const allValues = data.flatMap((dataset) =>
      dataset.data.map((d) => d.value),
    );
    const min = d3.min(allValues) ?? 0;
    const max = d3.max(allValues) ?? 0;
    return d3
      .scaleLinear()
      .domain([min, max])
      .range([plotPosition.origin.y, plotPosition.y.y])
      .nice();
  }, [plotPosition.origin.y, plotPosition.y.y, data]);
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

  // データポイントとライン
  const datasets = useMemo(() => {
    return data.map((dataset, datasetIndex) => {
      const points = dataset.data.map((d, i) => ({
        name: d.name,
        value: d.value,
        x: xScale(i),
        y: yScale(d.value),
      }));

      const lineSegments = points.slice(0, -1).map((point, i) => ({
        x1: point.x,
        y1: point.y,
        x2: points[i + 1].x,
        y2: points[i + 1].y,
      }));

      return {
        label: dataset.label,
        points,
        lineSegments,
        color: colors[datasetIndex % colors.length],
      };
    });
  }, [data, xScale, yScale, colors]);

  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    index: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    index: -1,
  });

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const handleMouseMove = (
    event: React.MouseEvent<SVGRectElement>,
    index: number,
  ) => {
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setTooltipState({
      visible: true,
      x,
      y,
      index,
    });
  };

  const handleMouseLeave = () => {
    setTooltipState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div ref={setContainerRef} style={{ position: "relative" }}>
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
        {/* X軸ラベル */}
        {xData.map((name, i) => (
          <text
            key={i}
            style={{
              fontSize: "16px",
              textAnchor: "middle",
              dominantBaseline: "hanging",
            }}
            x={xScale(i)}
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

        {/* ホバーエリア */}
        {xData.map((name, i) => {
          const x = xScale(i);
          const nextX = xScale(i + 1);
          const width =
            i === xData.length - 1 ? plotPosition.x.x - x : nextX - x;
          return (
            <rect
              key={`hover-${i}`}
              x={x}
              y={plotPosition.y.y}
              width={width}
              height={plotPosition.origin.y - plotPosition.y.y}
              fill="transparent"
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {/* ガイドライン */}
        {tooltipState.visible && (
          <line
            x1={xScale(tooltipState.index)}
            y1={plotPosition.y.y}
            x2={xScale(tooltipState.index)}
            y2={plotPosition.origin.y}
            stroke="currentColor"
            strokeDasharray="2,2"
            opacity={0.5}
          />
        )}

        {/* Plot */}
        {datasets.map((dataset, datasetIndex) => (
          <g key={datasetIndex}>
            {dataset.lineSegments.map((segment, i) => (
              <line
                key={`line-${i}`}
                x1={segment.x1}
                y1={segment.y1}
                x2={segment.x2}
                y2={segment.y2}
                stroke={dataset.color}
                strokeWidth="1"
              />
            ))}
            {dataset.points.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="2"
                fill={dataset.color}
              />
            ))}
          </g>
        ))}
      </svg>

      <Tooltip
        visible={tooltipState.visible}
        x={tooltipState.x}
        y={tooltipState.y}
        title={tooltipState.index >= 0 ? String(xData[tooltipState.index]) : ""}
        items={datasets.map((dataset) => ({
          label: dataset.label,
          value: dataset.points[tooltipState.index]?.value ?? 0,
          color: dataset.color,
        }))}
      />
    </div>
  );
}
