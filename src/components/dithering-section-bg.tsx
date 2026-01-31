"use client";

import { useEffect, useRef, useState } from "react";
import { Dithering } from "@paper-design/shaders-react";

type DitheringShape = "simplex" | "warp" | "dots" | "wave" | "ripple" | "swirl" | "sphere";
type DitheringType = "random" | "2x2" | "4x4" | "8x8";

interface DitheringSectionBgProps {
	shape?: DitheringShape;
	type?: DitheringType;
	colorBack?: string;
	colorFront?: string;
	size?: number;
	speed?: number;
	scale?: number;
	rotation?: number;
	opacity?: number;
	className?: string;
}

export function DitheringSectionBg({
	shape = "warp",
	type = "4x4",
	colorBack = "#0a0a0a",
	colorFront = "#1a6b6b",
	size = 4,
	speed = 0.15,
	scale = 0.6,
	rotation = 0,
	opacity = 0.4,
	className = "",
}: DitheringSectionBgProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (!containerRef.current) return;

		const updateDimensions = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setDimensions({ width: rect.width, height: rect.height });
			}
		};

		updateDimensions();

		const resizeObserver = new ResizeObserver(updateDimensions);
		resizeObserver.observe(containerRef.current);

		return () => resizeObserver.disconnect();
	}, []);

	return (
		<div
			ref={containerRef}
			className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
			style={{ opacity }}
		>
			{dimensions.width > 0 && dimensions.height > 0 && (
				<Dithering
					width={dimensions.width}
					height={dimensions.height}
					colorBack={colorBack}
					colorFront={colorFront}
					shape={shape}
					type={type}
					size={size}
					speed={speed}
					scale={scale}
					rotation={rotation}
					fit="cover"
					className="absolute inset-0 w-full h-full"
				/>
			)}
		</div>
	);
}
