import type {
	BadgeBackgroundConfig,
	BadgeBackgroundId,
} from "@/components/badge-backgrounds/registry";

export type BadgeRecord = {
	id: string;
	stationId: string;
	name: string;
	tags: [string, string];
	location: string;
	activatedAt: string;
	backgroundId: BadgeBackgroundId;
	backgroundConfig: BadgeBackgroundConfig;
	createdAt: string;
	updatedAt: string;
};

export type StationRecord = {
	id: string;
	name: string;
	eventLabel: string;
	location: string;
	createdAt: string;
	claimCount: number;
};

export type ClaimBadgeResponse = {
	badge: BadgeRecord;
};

export type UpdateBadgePayload = {
	name?: string;
	backgroundId?: BadgeBackgroundId;
	backgroundConfig?: BadgeBackgroundConfig;
	reroll?: boolean;
};
