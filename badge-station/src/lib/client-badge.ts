import {
	generateBackgroundConfig,
	type BadgeBackgroundId,
} from "@/components/badge-backgrounds/registry";
import type { BadgeRecord } from "@/lib/badge-types";
import { createBadgeId } from "@/lib/ids";

function formatActivatedAt(date = new Date()): string {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function createClientBadge(input: {
	stationId: string;
	eventLabel?: string;
	location?: string;
	name?: string;
}): BadgeRecord {
	const backgroundId: BadgeBackgroundId = "liquid";
	const now = new Date();
	return {
		id: createBadgeId(),
		stationId: input.stationId.toUpperCase(),
		name: input.name?.trim() || "Guest",
		tags: [input.eventLabel?.trim() || "CAFE CURSOR", "EVENT"],
		location: input.location?.trim() || "Curitiba, PR",
		activatedAt: formatActivatedAt(now),
		backgroundId,
		backgroundConfig: generateBackgroundConfig(backgroundId),
		createdAt: now.toISOString(),
		updatedAt: now.toISOString(),
	};
}

export function stationBadgeKey(stationId: string) {
	return `badge-station:station:${stationId.toUpperCase()}`;
}

export function badgeStorageKey(badgeId: string) {
	return `badge-station:${badgeId.toUpperCase()}`;
}

export function readStoredBadge(badgeId: string): BadgeRecord | null {
	try {
		const raw = localStorage.getItem(badgeStorageKey(badgeId));
		if (!raw) return null;
		return JSON.parse(raw) as BadgeRecord;
	} catch {
		return null;
	}
}

export function writeStoredBadge(badge: BadgeRecord) {
	try {
		localStorage.setItem(badgeStorageKey(badge.id), JSON.stringify(badge));
		localStorage.setItem(stationBadgeKey(badge.stationId), badge.id);
	} catch {
		// ignore
	}
}
