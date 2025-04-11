"use client";

import { useMemo } from "react";
import * as d3 from "d3";

import { DEFAULT_COLORS } from "../constants";

type DataPoint = {
  name: string | number;
  value: number;
};

type Dataset = {
  type: "line" | "bar";
  data: DataPoint[];
  color?: string;
};

export function MixedGraph({
  width,
  height,
  margin = { top: 16, right: 16, bottom: 32, left: 48 },
  datasets,
}: {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  datasets: Dataset[];
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
    return datasets[0]?.data.map((d) => String(d.name)) ?? [];
  }, [datasets]);
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(xData)
      .range([plotPosition.origin.x, plotPosition.x.x])
      .padding(0.1);
  }, [plotPosition.origin.x, plotPosition.x.x, xData]);

  // Y軸
  const yScale = useMemo(() => {
    const allValues = datasets.flatMap((dataset) =>
      dataset.data.map((d) => d.value),
    );
    const min = d3.min(allValues) ?? 0;
    const max = d3.max(allValues) ?? 0;
    return d3
      .scaleLinear()
      .domain([min, max])
      .range([plotPosition.origin.y, plotPosition.y.y])
      .nice();
  }, [plotPosition.origin.y, plotPosition.y.y, datasets]);
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

  // データセットの処理
  const processedDatasets = useMemo(() => {
    const barDatasets = datasets.filter((d) => d.type === "bar");
    const barWidth = xScale.bandwidth() / (barDatasets.length || 1);

    return datasets.map((dataset, datasetIndex) => {
      const color =
        dataset.color ?? DEFAULT_COLORS[datasetIndex % DEFAULT_COLORS.length];

      if (dataset.type === "line") {
        const points = dataset.data.map((d) => ({
          name: d.name,
          value: d.value,
          x: (xScale(String(d.name)) ?? 0) + xScale.bandwidth() / 2,
          y: yScale(d.value),
        }));

        const lineSegments = points.slice(0, -1).map((point, i) => ({
          x1: point.x,
          y1: point.y,
          x2: points[i + 1].x,
          y2: points[i + 1].y,
        }));

        return {
          type: "line" as const,
          points,
          lineSegments,
          color,
        };
      } else {
        const barIndex = barDatasets.findIndex((d) => d === dataset);
        return {
          type: "bar" as const,
          bars: dataset.data.map((d) => ({
            name: d.name,
            value: d.value,
            x: (xScale(String(d.name)) ?? 0) + barWidth * barIndex,
            y: yScale(d.value),
            width: barWidth,
            height: plotPosition.origin.y - yScale(d.value),
          })),
          color,
        };
      }
    });
  }, [datasets, xScale, yScale, plotPosition.origin.y]);

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
      {xData.map((name, i) => (
        <text
          key={i}
          style={{
            fontSize: "16px",
            textAnchor: "middle",
            dominantBaseline: "hanging",
          }}
          x={(xScale(name) ?? 0) + xScale.bandwidth() / 2}
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
      {processedDatasets.map((dataset, datasetIndex) => {
        if (dataset.type === "line") {
          return (
            <g key={`line-${datasetIndex}`}>
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
          );
        } else {
          return (
            <g key={`bar-${datasetIndex}`}>
              {dataset.bars.map((bar) => (
                <rect
                  key={`${bar.name}`}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={dataset.color}
                />
              ))}
            </g>
          );
        }
      })}
    </svg>
  );
}
