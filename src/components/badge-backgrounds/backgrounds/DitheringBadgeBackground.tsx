"use client";

import { useState } from "react";
import { Dithering } from "@paper-design/shaders-react";
import { MeasuredBackground } from "../MeasuredBackground";
import {
	type DitheringConfig,
	type DitheringShape,
	type DitheringType,
} from "../registry";

/** Valid shape options for the Dithering shader */
const DITHERING_SHAPES: readonly DitheringShape[] = [
	"simplex",
	"warp",
	"dots",
	"wave",
	"ripple",
	"swirl",
	"sphere",
];

/** Valid type options for the Dithering shader */
const DITHERING_TYPES: readonly DitheringType[] = ["random", "2x2", "4x4", "8x8"];

/** Pick a random element from an array */
function pickRandom<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a random hex color */
function randomHexColor(): string {
	return `#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padStart(6, "0")}`;
}

/**
 * Generate two distinct colors (re-rolls if they're too similar).
 * Uses simple luminance-based distance check.
 */
function getDistinctColors(): { colorBack: string; colorFront: string } {
	const hexToRgb = (hex: string) => {
		const h = hex.replace("#", "");
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16),
		};
	};

	const luminance = (r: number, g: number, b: number) =>
		0.299 * r + 0.587 * g + 0.114 * b;

	const colorBack = randomHexColor();
	let colorFront = randomHexColor();

	let attempts = 0;
	while (attempts < 10) {
		const bg = hexToRgb(colorBack);
		const fg = hexToRgb(colorFront);
		const diff = Math.abs(
			luminance(bg.r, bg.g, bg.b) - luminance(fg.r, fg.g, fg.b)
		);
		if (diff >= 60) break;
		colorFront = randomHexColor();
		attempts++;
	}

	return { colorBack, colorFront };
}

/** Random float in range [min, max] */
function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

/** Random speed excluding near-zero values */
function randomSpeed(): number {
	const sign = Math.random() < 0.5 ? -1 : 1;
	return sign * randomInRange(0.2, 0.9);
}

/** Generate default random config */
function generateDefaultConfig(): DitheringConfig {
	return {
		shape: pickRandom(DITHERING_SHAPES),
		type: pickRandom(DITHERING_TYPES),
		...getDistinctColors(),
		size: randomInRange(2.0, 9.0),
		speed: randomSpeed(),
		scale: randomInRange(0.4, 0.8),
		rotation: Math.floor(Math.random() * 360),
	};
}

type DitheringBadgeBackgroundProps = {
	config?: DitheringConfig;
};

/**
 * Dithering shader background with randomized shape, colors, size, and speed.
 */
export function DitheringBadgeBackground({
	config,
}: DitheringBadgeBackgroundProps) {
	const [settings] = useState<DitheringConfig>(
		() => config ?? generateDefaultConfig()
	);

	return (
		<MeasuredBackground>
			{({ width, height }) => (
				<Dithering
					width={width}
					height={height}
					colorBack={settings.colorBack}
					colorFront={settings.colorFront}
					shape={settings.shape}
					type={settings.type}
					size={settings.size}
					speed={settings.speed}
					scale={settings.scale}
					rotation={settings.rotation}
					className="absolute inset-0 h-full w-full"
				/>
			)}
		</MeasuredBackground>
	);
}
