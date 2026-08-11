import { NextResponse } from "next/server";

import { createStation, ensureDemoStation, listStations } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	ensureDemoStation();
	return NextResponse.json({ stations: listStations() });
}

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as {
		name?: string;
		eventLabel?: string;
		location?: string;
	};

	const station = createStation(body);
	return NextResponse.json({ station }, { status: 201 });
}
