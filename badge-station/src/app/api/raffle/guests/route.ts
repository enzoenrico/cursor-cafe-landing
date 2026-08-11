import { NextResponse } from "next/server";

import {
	DEFAULT_LUMA_EVENT_ID,
	DEFAULT_LUMA_EVENT_URL,
	fetchGuestQuestions,
	fetchRaffleGuests,
} from "@/lib/luma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const [guests, questions] = await Promise.all([
			fetchRaffleGuests(),
			fetchGuestQuestions(),
		]);

		return NextResponse.json({
			eventId: process.env.LUMA_EVENT_ID ?? DEFAULT_LUMA_EVENT_ID,
			eventUrl: DEFAULT_LUMA_EVENT_URL,
			count: guests.length,
			checkedInCount: guests.filter((guest) => guest.checkedInAt).length,
			questionsCount: questions.length,
			guests,
			questions,
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Falha ao carregar convidados do Luma.";
		const status = message.includes("LUMA_API_KEY") ? 503 : 500;
		console.error("Failed to load raffle guests", error);
		return NextResponse.json({ error: message }, { status });
	}
}
