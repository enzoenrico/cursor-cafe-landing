import { NextResponse } from "next/server";

import type { UpdateBadgePayload } from "@/lib/badge-types";
import { getBadge, updateBadge } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
	params: Promise<{ badgeId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
	const { badgeId } = await context.params;
	const badge = getBadge(badgeId);
	if (!badge) {
		return NextResponse.json({ error: "Badge not found" }, { status: 404 });
	}
	return NextResponse.json({ badge });
}

export async function PATCH(request: Request, context: RouteContext) {
	const { badgeId } = await context.params;
	const payload = (await request.json().catch(() => ({}))) as UpdateBadgePayload;
	const badge = updateBadge(badgeId, payload);
	if (!badge) {
		return NextResponse.json({ error: "Badge not found" }, { status: 404 });
	}
	return NextResponse.json({ badge });
}
