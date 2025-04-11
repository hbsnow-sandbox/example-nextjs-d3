"use client";

import { type CSSProperties } from "react";

type TooltipProps = {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  items: {
    label: string;
    value: number;
    color: string;
  }[];
};

export function Tooltip({ visible, x, y, title, items }: TooltipProps) {
  if (!visible) return null;

  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    transform: "translate(10px, -50%)",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "8px 12px",
    pointerEvents: "none",
    zIndex: 10,
  };

  const titleStyle: CSSProperties = {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "4px",
  };

  const itemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    lineHeight: "20px",
  };

  const dotStyle = (color: string): CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: color,
  });

  const valueStyle: CSSProperties = {
    marginLeft: "auto",
    fontWeight: "500",
  };

  return (
    <div style={style}>
      <div style={titleStyle}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={itemStyle}>
          <div style={dotStyle(item.color)} />
          <div>{item.label}</div>
          <div style={valueStyle}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
