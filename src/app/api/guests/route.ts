import { NextResponse } from "next/server";

import {
	findGuestByEmail,
	GuestsUnavailableError,
	normalizeGuestEmail,
	readGuestsCsv,
} from "@/lib/guests";

export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 1024;

export async function POST(request: Request) {
	let email: string;
	try {
		email = await readEmail(request);
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	const normalized = normalizeGuestEmail(email);
	if (!normalized) {
		return NextResponse.json({ error: "not_found" }, { status: 404 });
	}

	try {
		const guest = findGuestByEmail(readGuestsCsv(), normalized);
		if (!guest) {
			return NextResponse.json({ error: "not_found" }, { status: 404 });
		}

		return NextResponse.json(
			{ firstName: guest.firstName, name: guest.name },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch (error) {
		if (!(error instanceof GuestsUnavailableError)) {
			console.error("Guest lookup failed");
		}
		return NextResponse.json(
			{ error: "Guests data not configured" },
			{ status: 503 },
		);
	}
}

async function readEmail(request: Request): Promise<string> {
	const raw = await request.text();
	if (raw.length === 0 || raw.length > MAX_BODY_CHARS) {
		throw new Error("Invalid request");
	}

	const body: unknown = JSON.parse(raw);
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		throw new Error("Invalid request");
	}

	const email = (body as { email?: unknown }).email;
	if (typeof email !== "string") {
		throw new Error("Invalid request");
	}

	return email;
}
