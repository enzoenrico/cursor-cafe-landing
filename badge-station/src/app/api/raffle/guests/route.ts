import { NextResponse } from "next/server";

import {
	DEFAULT_LUMA_EVENT_ID,
	DEFAULT_LUMA_EVENT_URL,
	fetchCheckedInGuests,
} from "@/lib/luma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const eventId = process.env.LUMA_EVENT_ID ?? DEFAULT_LUMA_EVENT_ID;

	try {
		const guests = await fetchCheckedInGuests({ eventId });
		return NextResponse.json({
			eventId,
			eventUrl: DEFAULT_LUMA_EVENT_URL,
			count: guests.length,
			guests,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Erro ao carregar convidados";
		const status = message.includes("LUMA_API_KEY") ? 503 : 502;
		return NextResponse.json({ error: message, eventId }, { status });
	}
}
