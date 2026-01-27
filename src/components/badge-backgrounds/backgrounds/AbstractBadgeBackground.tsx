"use client";

import { useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import { MeasuredBackground } from "../MeasuredBackground";
import { getRandomColors, getRandomShape } from "../utils/getRandomProperties";
import type { AbstractConfig } from "../registry";

type AbstractBadgeBackgroundProps = {
	config?: AbstractConfig;
};

/**
 * Abstract gradient background with grain effect for badge cards.
 */
export function AbstractBadgeBackground({
	config,
}: AbstractBadgeBackgroundProps) {
	const [settings] = useState<AbstractConfig>(
		() =>
			config ?? {
				shape: getRandomShape(),
				colors: getRandomColors(Math.floor(Math.random() * 10) + 1),
			}
	);

	return (
		<MeasuredBackground>
			{({ width, height }) => (
				<GrainGradient
					width={width}
					height={height}
					colors={settings.colors}
					colorBack="#000000"
					softness={0.2}
					scale={0.9}
					intensity={0.75}
					noise={0.5}
					fit="contain"
					shape={settings.shape}
					speed={1}
					className="absolute inset-0 h-full w-full scale-110 flex items-center justify-center"
				/>
			)}
		</MeasuredBackground>
	);
}
