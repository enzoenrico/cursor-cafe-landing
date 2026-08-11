import { NextResponse } from "next/server";

import { claimBadge, getStation } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
	params: Promise<{ stationId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
	const { stationId } = await context.params;
	const station = getStation(stationId);
	if (!station) {
		return NextResponse.json({ error: "Estação não encontrada" }, { status: 404 });
	}

	const badge = claimBadge(station.id);
	if (!badge) {
		return NextResponse.json(
			{ error: "Não foi possível atribuir a badge" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ badge }, { status: 201 });
}
