"use client";

import { Heatmap as HeatmapShader } from "@paper-design/shaders-react";
import { MeasuredBackground } from "../MeasuredBackground";
import { getRandomColors } from "../utils/getRandomProperties";
import { useState } from "react";

/**
 * Molten abstract metal background combining heatmap shader with specular highlights.
 */
export function MoltenBadgeBackground() {
	// Lazy initialization generates new colors on each mount
	const [colors] = useState(() => getRandomColors(7));
	return (
		<MeasuredBackground>
			{({ width, height }) => (
				<>
					<HeatmapShader
						width={width}
						height={height}
						image="/cursor.svg"
						colors={colors}
						colorBack="#000000"
						contour={0.22}
						angle={18}
						noise={0.66}
						innerGlow={0.86}
						outerGlow={0.5}
						speed={0.5}
						scale={1}
						className="absolute inset-0 h-full w-full opacity-85"
					/>

					{/* Specular highlights to sell "liquid metal" */}
					<div
						className={[
							"absolute inset-0",
							"bg-[radial-gradient(900px_circle_at_22%_28%,rgba(255,255,255,0.30),transparent_46%),radial-gradient(700px_circle_at_78%_70%,rgba(255,255,255,0.18),transparent_52%),radial-gradient(520px_circle_at_55%_12%,rgba(88,240,214,0.22),transparent_60%)]",
							"mix-blend-soft-light opacity-70",
						].join(" ")}
					/>
				</>
			)}
		</MeasuredBackground>
	);
}
