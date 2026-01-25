"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import { MeasuredBackground } from "../MeasuredBackground";

/**
 * Liquid metal shader background for badge cards.
 */
export function LiquidMetalBadgeBackground() {
	return (
		<MeasuredBackground>
			{({ width, height }) => (
				<LiquidMetal
					width={width}
					height={height}
					image="/cursor.svg"
					colorBack="#222222"
					colorTint="#ffffff"
					shape="circle"
					repetition={4.16}
					softness={0.92}
					shiftRed={0.28}
					shiftBlue={0.42}
					distortion={0.6}
					contour={0.7}
					angle={142}
					speed={0.44}
					scale={0.5}
					fit="cover"
					className="h-full w-full"
				/>
			)}
		</MeasuredBackground>
	);
}
