export type RaffleGuest = {
	id: string;
	name: string;
	email: string;
	checkedInAt: string;
};

type LumaTicket = {
	checked_in_at?: string | null;
};

type LumaGuestEntry = {
	id?: string;
	api_id?: string;
	name?: string | null;
	email?: string | null;
	user_name?: string | null;
	user_email?: string | null;
	checked_in_at?: string | null;
	event_tickets?: LumaTicket[] | null;
	guest?: {
		id?: string;
		api_id?: string;
		name?: string | null;
		email?: string | null;
		checked_in_at?: string | null;
		event_tickets?: LumaTicket[] | null;
	} | null;
};

type LumaGuestsListResponse = {
	entries?: LumaGuestEntry[];
	has_more?: boolean;
	next_cursor?: string | null;
};

export const DEFAULT_LUMA_EVENT_ID = "evt-EWoOevOW0uG6LTM";
export const DEFAULT_LUMA_EVENT_URL = "https://luma.com/cursor-umd5";

function getCheckedInAt(entry: LumaGuestEntry): string | null {
	const nested = entry.guest;
	const tickets = entry.event_tickets ?? nested?.event_tickets ?? [];
	for (const ticket of tickets) {
		if (ticket.checked_in_at) return ticket.checked_in_at;
	}
	return entry.checked_in_at ?? nested?.checked_in_at ?? null;
}

function normalizeGuest(entry: LumaGuestEntry): RaffleGuest | null {
	const nested = entry.guest;
	const id = entry.id ?? entry.api_id ?? nested?.id ?? nested?.api_id;
	const name =
		entry.name?.trim() ||
		nested?.name?.trim() ||
		entry.user_name?.trim() ||
		"";
	const email =
		entry.email?.trim() ||
		nested?.email?.trim() ||
		entry.user_email?.trim() ||
		"";
	const checkedInAt = getCheckedInAt(entry);

	if (!id || !checkedInAt) return null;

	return {
		id,
		name: name || email || "Convidado",
		email,
		checkedInAt,
	};
}

export async function fetchCheckedInGuests(options?: {
	apiKey?: string;
	eventId?: string;
}): Promise<RaffleGuest[]> {
	const apiKey = options?.apiKey ?? process.env.LUMA_API_KEY;
	const eventId =
		options?.eventId ?? process.env.LUMA_EVENT_ID ?? DEFAULT_LUMA_EVENT_ID;

	if (!apiKey) {
		throw new Error("LUMA_API_KEY não configurada");
	}

	const guests: RaffleGuest[] = [];
	let cursor: string | undefined;

	for (let page = 0; page < 50; page++) {
		const url = new URL("https://public-api.luma.com/v1/events/guests/list");
		url.searchParams.set("event_id", eventId);
		url.searchParams.set("approval_status", "approved");
		url.searchParams.set("pagination_limit", "100");
		url.searchParams.set("sort_column", "checked_in_at");
		url.searchParams.set("sort_direction", "desc nulls last");
		if (cursor) url.searchParams.set("pagination_cursor", cursor);

		const response = await fetch(url, {
			headers: {
				"x-luma-api-key": apiKey,
				accept: "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			const body = await response.text().catch(() => "");
			throw new Error(
				`Falha ao buscar convidados da Luma (${response.status})${body ? `: ${body.slice(0, 180)}` : ""}`
			);
		}

		const data = (await response.json()) as LumaGuestsListResponse;
		for (const entry of data.entries ?? []) {
			const guest = normalizeGuest(entry);
			if (guest) guests.push(guest);
		}

		if (!data.has_more || !data.next_cursor) break;
		cursor = data.next_cursor;
	}

	// Deduplicate by id while preserving first occurrence.
	const byId = new Map<string, RaffleGuest>();
	for (const guest of guests) {
		if (!byId.has(guest.id)) byId.set(guest.id, guest);
	}

	return [...byId.values()].toSorted((a, b) =>
		a.name.localeCompare(b.name, "pt-BR")
	);
}
