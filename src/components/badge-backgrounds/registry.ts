import type { ComponentType } from "react";

import { AbstractBadgeBackground } from "./backgrounds/AbstractBadgeBackground";
import { DitheringBadgeBackground } from "./backgrounds/DitheringBadgeBackground";
import { LiquidMetalBadgeBackground } from "./backgrounds/LiquidMetalBadgeBackground";
import { MoltenBadgeBackground } from "./backgrounds/MoltenBadgeBackground";

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
 * Map from background ID to its component for O(1) lookup.
 */
export const badgeBackgroundById: Record<BadgeBackgroundId, ComponentType> =
	BADGE_BACKGROUNDS.reduce(
		(acc, { id, Component }) => {
			acc[id] = Component;
			return acc;
		},
		{} as Record<BadgeBackgroundId, ComponentType>
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
