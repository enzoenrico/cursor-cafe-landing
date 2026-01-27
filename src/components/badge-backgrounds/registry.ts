import type { ComponentType } from "react";

import { AbstractBadgeBackground } from "./backgrounds/AbstractBadgeBackground";
import { DitheringBadgeBackground } from "./backgrounds/DitheringBadgeBackground";
import { LiquidMetalBadgeBackground } from "./backgrounds/LiquidMetalBadgeBackground";
import { MoltenBadgeBackground } from "./backgrounds/MoltenBadgeBackground";
import {
	type AbstractShape,
	getRandomColors,
	getRandomShape,
} from "./utils/getRandomProperties";

// ============================================================================
// Background Configuration Types
// ============================================================================

export type LiquidMetalConfig = {
	colorBack: string;
	colorTint: string;
};

export type AbstractConfig = {
	shape: AbstractShape;
	colors: string[];
};

export type MoltenConfig = {
	colors: string[];
};

export type DitheringShape =
	| "simplex"
	| "warp"
	| "dots"
	| "wave"
	| "ripple"
	| "swirl"
	| "sphere";

export type DitheringType = "random" | "2x2" | "4x4" | "8x8";

export type DitheringConfig = {
	shape: DitheringShape;
	type: DitheringType;
	colorBack: string;
	colorFront: string;
	size: number;
	speed: number;
	scale: number;
	rotation: number;
};

export type BadgeBackgroundConfig =
	| { id: "liquid"; config: LiquidMetalConfig }
	| { id: "abstract"; config: AbstractConfig }
	| { id: "molten"; config: MoltenConfig }
	| { id: "dithering"; config: DitheringConfig };

// ============================================================================
// Configuration Generators
// ============================================================================

function randomHexColor(): string {
	return `#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padStart(6, "0")}`;
}

function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function randomSpeed(): number {
	const sign = Math.random() < 0.5 ? -1 : 1;
	return sign * randomInRange(0.2, 0.9);
}

function pickRandom<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

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

const DITHERING_SHAPES: readonly DitheringShape[] = [
	"simplex",
	"warp",
	"dots",
	"wave",
	"ripple",
	"swirl",
	"sphere",
];

const DITHERING_TYPES: readonly DitheringType[] = ["random", "2x2", "4x4", "8x8"];

function generateLiquidMetalConfig(): LiquidMetalConfig {
	return {
		colorBack: getRandomColors(1)[0],
		colorTint: getRandomColors(1)[0],
	};
}

function generateAbstractConfig(): AbstractConfig {
	return {
		shape: getRandomShape(),
		colors: getRandomColors(Math.floor(Math.random() * 10) + 1),
	};
}

function generateMoltenConfig(): MoltenConfig {
	return {
		colors: getRandomColors(7),
	};
}

function generateDitheringConfig(): DitheringConfig {
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

export function generateBackgroundConfig(id: BadgeBackgroundId): BadgeBackgroundConfig {
	switch (id) {
		case "liquid":
			return { id, config: generateLiquidMetalConfig() };
		case "abstract":
			return { id, config: generateAbstractConfig() };
		case "molten":
			return { id, config: generateMoltenConfig() };
		case "dithering":
			return { id, config: generateDitheringConfig() };
	}
}

/**
 * Ordered list of badge background definitions.
 * The order determines cycling behavior.
 */
export const BADGE_BACKGROUNDS = [
	{ id: "liquid", Component: LiquidMetalBadgeBackground },
	{ id: "abstract", Component: AbstractBadgeBackground },
	{ id: "molten", Component: MoltenBadgeBackground },
	{ id: "dithering", Component: DitheringBadgeBackground },
] as const;

/**
 * Union type of all valid badge background IDs.
 */
export type BadgeBackgroundId = (typeof BADGE_BACKGROUNDS)[number]["id"];

/**
 * Props type for background components - accepts any config type.
 */
export type BadgeBackgroundProps = {
	config?: LiquidMetalConfig | AbstractConfig | MoltenConfig | DitheringConfig;
};

/**
 * Map from background ID to its component for O(1) lookup.
 * Each component accepts an optional config prop.
 */
export const badgeBackgroundById: Record<
	BadgeBackgroundId,
	ComponentType<BadgeBackgroundProps>
> = BADGE_BACKGROUNDS.reduce(
	(acc, { id, Component }) => {
		// Type assertion needed because each component has its own specific config type
		acc[id] = Component as ComponentType<BadgeBackgroundProps>;
		return acc;
	},
	{} as Record<BadgeBackgroundId, ComponentType<BadgeBackgroundProps>>
);

/**
 * Returns the next background ID in the cycle.
 */
export function getNextBadgeBackgroundId(
	current: BadgeBackgroundId
): BadgeBackgroundId {
	const idx = BADGE_BACKGROUNDS.findIndex((bg) => bg.id === current);
	const nextIdx = (idx + 1) % BADGE_BACKGROUNDS.length;
	return BADGE_BACKGROUNDS[nextIdx].id;
}
