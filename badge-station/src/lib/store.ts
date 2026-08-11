import {
	generateBackgroundConfig,
	type BadgeBackgroundId,
} from "@/components/badge-backgrounds/registry";
import type { BadgeRecord, StationRecord, UpdateBadgePayload } from "@/lib/badge-types";
import { BRAND, formatActivatedAt } from "@/lib/branding";
import { createBadgeId, createStationCode } from "@/lib/ids";

type StoreShape = {
	stations: Map<string, StationRecord>;
	badges: Map<string, BadgeRecord>;
};

const globalForStore = globalThis as typeof globalThis & {
	__badgeStationStore?: StoreShape;
};

function getStore(): StoreShape {
	if (!globalForStore.__badgeStationStore) {
		globalForStore.__badgeStationStore = {
			stations: new Map(),
			badges: new Map(),
		};
	}
	return globalForStore.__badgeStationStore;
}

export function createStation(input?: {
	name?: string;
	eventLabel?: string;
	location?: string;
}): StationRecord {
	const store = getStore();
	const station: StationRecord = {
		id: createStationCode(),
		name: input?.name?.trim() || BRAND.defaultStationName,
		eventLabel: input?.eventLabel?.trim() || BRAND.shortTag,
		location: input?.location?.trim() || BRAND.defaultLocation,
		createdAt: new Date().toISOString(),
		claimCount: 0,
	};
	store.stations.set(station.id, station);
	return station;
}

export function getStation(stationId: string): StationRecord | null {
	return getStore().stations.get(stationId.toUpperCase()) ?? null;
}

export function listStations(): StationRecord[] {
	return [...getStore().stations.values()].toSorted(
		(a, b) => b.createdAt.localeCompare(a.createdAt)
	);
}

export function claimBadge(stationId: string): BadgeRecord | null {
	const store = getStore();
	const station = store.stations.get(stationId.toUpperCase());
	if (!station) return null;

	const backgroundId: BadgeBackgroundId = "liquid";
	const backgroundConfig = generateBackgroundConfig(backgroundId);
	const now = new Date();
	const badge: BadgeRecord = {
		id: createBadgeId(),
		stationId: station.id,
		name: `${BRAND.defaultGuestName} ${station.claimCount + 1}`,
		tags: [station.eventLabel, BRAND.eventTag],
		location: station.location,
		activatedAt: formatActivatedAt(now),
		backgroundId,
		backgroundConfig,
		createdAt: now.toISOString(),
		updatedAt: now.toISOString(),
	};

	store.badges.set(badge.id, badge);
	station.claimCount += 1;
	store.stations.set(station.id, station);
	return badge;
}

export function getBadge(badgeId: string): BadgeRecord | null {
	return getStore().badges.get(badgeId.toUpperCase()) ?? null;
}

export function updateBadge(
	badgeId: string,
	payload: UpdateBadgePayload
): BadgeRecord | null {
	const store = getStore();
	const existing = store.badges.get(badgeId.toUpperCase());
	if (!existing) return null;

	const next: BadgeRecord = { ...existing };

	if (typeof payload.name === "string") {
		const trimmed = payload.name.trim().slice(0, 40);
		if (trimmed) next.name = trimmed;
	}

	if (payload.reroll) {
		const backgroundId = payload.backgroundId ?? existing.backgroundId;
		next.backgroundId = backgroundId;
		next.backgroundConfig = generateBackgroundConfig(backgroundId);
	} else if (payload.backgroundId || payload.backgroundConfig) {
		const backgroundId = payload.backgroundId ?? existing.backgroundId;
		next.backgroundId = backgroundId;
		next.backgroundConfig =
			payload.backgroundConfig ?? generateBackgroundConfig(backgroundId);
	}

	next.updatedAt = new Date().toISOString();
	store.badges.set(next.id, next);
	return next;
}

/** Garante uma estação demo no ambiente local/dev. */
export function ensureDemoStation(): StationRecord {
	const existing = listStations()[0];
	if (existing) return existing;
	return createStation({
		name: BRAND.defaultStationName,
		eventLabel: BRAND.shortTag,
		location: BRAND.defaultLocation,
	});
}
