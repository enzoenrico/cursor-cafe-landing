"use client";

import { useState } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";
import { MeasuredBackground } from "../MeasuredBackground";
import { getRandomColors } from "../utils/getRandomProperties";
import type { LiquidMetalConfig } from "../registry";

type LiquidMetalBadgeBackgroundProps = {
	config?: LiquidMetalConfig;
};

/**
 * Liquid metal shader background for badge cards.
 */
export function LiquidMetalBadgeBackground({
	config,
}: LiquidMetalBadgeBackgroundProps) {
	const [colors] = useState<LiquidMetalConfig>(
		() =>
			config ?? {
				colorBack: getRandomColors(1)[0],
				colorTint: getRandomColors(1)[0],
			}
	);

	return (
		<MeasuredBackground>
			{({ width, height }) => (
				<LiquidMetal
					width={width}
					height={height}
					image="/cursor.svg"
					colorBack={colors.colorBack}
					colorTint={colors.colorTint}
					shape="circle"
					repetition={4.16}
					softness={0.92}
					shiftRed={0.28}
					shiftBlue={0.42}
					distortion={0.6}
					contour={0.7}
					angle={142}
					speed={0.44}
					scale={0.6}
					fit="contain"
					className="h-full w-full scale-110 flex items-center justify-center"
				/>
			)}
		</MeasuredBackground>
	);
}
