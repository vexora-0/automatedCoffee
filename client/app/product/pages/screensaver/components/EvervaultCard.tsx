"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EvervaultCardProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export function EvervaultCard({
  className,
  text = "Smart Coffee System",
  ...props
}: EvervaultCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    setCoordinates({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-black/20 to-black/5 p-8 backdrop-blur-sm transition-all duration-200",
        isHovered && "border-neutral-700",
        className
      )}
      style={
        {
          "--x": coordinates.x,
          "--y": coordinates.y,
        } as React.CSSProperties
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-0.5 opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}
        style={{
          background: `radial-gradient(600px circle at ${
            coordinates.x * 100
          }% ${
            coordinates.y * 100
          }%, rgba(255, 255, 255, 0.1), transparent 40%)`,
        }}
      />
      <div className="z-10 flex flex-col items-center justify-center text-center">
        <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          {text}
        </h3>
        <p className="text-foreground/80">
          Touch to explore our delicious menu
        </p>
      </div>
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10",
          isHovered && "opacity-10"
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at ${coordinates.x * 100}% ${
            coordinates.y * 100
          }%, 
            var(--primary) 0%, 
            transparent 60%)
          `,
        }}
      />
    </div>
  );
}
