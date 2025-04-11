"use client";

import { useMemo, useState } from "react";
import * as d3 from "d3";

import { DEFAULT_COLORS } from "../constants";
import { Tooltip } from "../tooltip";

export function BarGraph({
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
    return data[0]?.data.map((d) => String(d.name)) ?? [];
  }, [data]);
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(xData)
      .range([plotPosition.origin.x, plotPosition.x.x])
      .padding(0.1);
  }, [plotPosition.origin.x, plotPosition.x.x, xData]);

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

  // バーの位置とサイズ
  const datasets = useMemo(() => {
    const barWidth = xScale.bandwidth() / data.length;

    return data.map((dataset, datasetIndex) => {
      const bars = dataset.data.map((d) => ({
        name: d.name,
        value: d.value,
        x: (xScale(String(d.name)) ?? 0) + barWidth * datasetIndex,
        y: yScale(d.value),
        width: barWidth,
        height: plotPosition.origin.y - yScale(d.value),
      }));

      return {
        label: dataset.label,
        bars,
        color: colors[datasetIndex % colors.length],
      };
    });
  }, [data, xScale, yScale, plotPosition.origin.y, colors]);

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

        {/* ホバーエリア */}
        {xData.map((name, i) => {
          const currentX = xScale(String(name)) ?? 0;
          const segmentWidth = xScale.bandwidth();
          // Y軸の最小値からホバーエリアを開始
          const y = yScale.domain()[0];
          const height = plotPosition.origin.y - y;

          return (
            <rect
              key={`hover-${i}`}
              x={currentX}
              y={y}
              width={segmentWidth}
              height={height}
              fill="transparent"
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {/* ガイドライン */}
        {tooltipState.visible && (
          <line
            x1={
              (xScale(String(xData[tooltipState.index])) ?? 0) +
              xScale.bandwidth() / 2
            }
            y1={plotPosition.y.y}
            x2={
              (xScale(String(xData[tooltipState.index])) ?? 0) +
              xScale.bandwidth() / 2
            }
            y2={plotPosition.origin.y}
            stroke="currentColor"
            strokeDasharray="2,2"
            opacity={0.5}
          />
        )}

        {/* Plot */}
        {datasets.map((dataset) =>
          dataset.bars.map((bar, i) => (
            <rect
              key={`${bar.name}-${dataset.color}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={dataset.color}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={handleMouseLeave}
            />
          )),
        )}
      </svg>

      <Tooltip
        visible={tooltipState.visible}
        x={tooltipState.x}
        y={tooltipState.y}
        title={tooltipState.index >= 0 ? String(xData[tooltipState.index]) : ""}
        items={datasets.map((dataset) => ({
          label: dataset.label,
          value: dataset.bars[tooltipState.index]?.value ?? 0,
          color: dataset.color,
        }))}
      />
    </div>
  );
}
