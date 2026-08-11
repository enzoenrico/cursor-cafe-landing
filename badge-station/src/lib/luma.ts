export type RaffleGuest = {
	id: string;
	name: string;
	email: string;
	checkedInAt: string | null;
	registeredAt: string | null;
};

export type GuestQuestion = {
	guestId: string;
	guestName: string;
	guestEmail: string;
	questionId: string;
	questionLabel: string;
	answer: string;
	registeredAt: string | null;
	checkedInAt: string | null;
};

type LumaTicket = {
	checked_in_at?: string | null;
};

type LumaRegistrationAnswer = {
	label?: string | null;
	question_id?: string | null;
	question_type?: string | null;
	value?: unknown;
	answer?: unknown;
};

type LumaGuestEntry = {
	id?: string;
	api_id?: string;
	name?: string | null;
	email?: string | null;
	user_name?: string | null;
	user_email?: string | null;
	checked_in_at?: string | null;
	registered_at?: string | null;
	registration_answers?: LumaRegistrationAnswer[] | null;
	event_tickets?: LumaTicket[] | null;
	guest?: {
		id?: string;
		api_id?: string;
		name?: string | null;
		email?: string | null;
		checked_in_at?: string | null;
		registered_at?: string | null;
		registration_answers?: LumaRegistrationAnswer[] | null;
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

/** Registration question: "Tem alguma pergunta para o time Cursor?" */
export const CURSOR_TEAM_QUESTION_ID = "zfd03vbb";

function getCheckedInAt(entry: LumaGuestEntry): string | null {
	const nested = entry.guest;
	const tickets = entry.event_tickets ?? nested?.event_tickets ?? [];
	for (const ticket of tickets) {
		if (ticket.checked_in_at) return ticket.checked_in_at;
	}
	return entry.checked_in_at ?? nested?.checked_in_at ?? null;
}

function answerToString(value: unknown): string {
	if (value == null) return "";
	if (typeof value === "string") return value.trim();
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (typeof value === "object") {
		try {
			return JSON.stringify(value);
		} catch {
			return "";
		}
	}
	return "";
}

function isCursorTeamQuestion(answer: LumaRegistrationAnswer): boolean {
	if (answer.question_id === CURSOR_TEAM_QUESTION_ID) return true;
	const label = answer.label ?? "";
	return /pergunta para o time/i.test(label) || /pergunta.*cursor/i.test(label);
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

	if (!id) return null;

	return {
		id,
		name: name || email || "Convidado",
		email,
		checkedInAt: getCheckedInAt(entry),
		registeredAt: entry.registered_at ?? nested?.registered_at ?? null,
	};
}

function extractQuestions(entry: LumaGuestEntry): GuestQuestion[] {
	const guest = normalizeGuest(entry);
	if (!guest) return [];

	const answers =
		entry.registration_answers ?? entry.guest?.registration_answers ?? [];
	const out: GuestQuestion[] = [];

	for (const answer of answers) {
		if (!isCursorTeamQuestion(answer)) continue;
		const text = answerToString(answer.answer ?? answer.value);
		if (!text) continue;
		out.push({
			guestId: guest.id,
			guestName: guest.name,
			guestEmail: guest.email,
			questionId: answer.question_id || CURSOR_TEAM_QUESTION_ID,
			questionLabel:
				answer.label?.trim() || "Tem alguma pergunta para o time Cursor?",
			answer: text,
			registeredAt: guest.registeredAt,
			checkedInAt: guest.checkedInAt,
		});
	}

	return out;
}

async function fetchApprovedGuestEntries(options?: {
	apiKey?: string;
	eventId?: string;
}): Promise<LumaGuestEntry[]> {
	const apiKey = options?.apiKey ?? process.env.LUMA_API_KEY;
	const eventId =
		options?.eventId ?? process.env.LUMA_EVENT_ID ?? DEFAULT_LUMA_EVENT_ID;

	if (!apiKey) {
		throw new Error("LUMA_API_KEY não configurada");
	}

	const entries: LumaGuestEntry[] = [];
	let cursor: string | undefined;

	for (let page = 0; page < 50; page++) {
		const url = new URL("https://public-api.luma.com/v1/events/guests/list");
		url.searchParams.set("event_id", eventId);
		url.searchParams.set("approval_status", "approved");
		url.searchParams.set("pagination_limit", "100");
		url.searchParams.set("sort_column", "registered_at");
		url.searchParams.set("sort_direction", "desc");
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
		entries.push(...(data.entries ?? []));

		if (!data.has_more || !data.next_cursor) break;
		cursor = data.next_cursor;
	}

	return entries;
}

export async function fetchRaffleGuests(options?: {
	apiKey?: string;
	eventId?: string;
	/** When true, only guests with Luma check-in. Default: all approved. */
	checkedInOnly?: boolean;
}): Promise<RaffleGuest[]> {
	const entries = await fetchApprovedGuestEntries(options);
	const guests: RaffleGuest[] = [];

	for (const entry of entries) {
		const guest = normalizeGuest(entry);
		if (!guest) continue;
		if (options?.checkedInOnly && !guest.checkedInAt) continue;
		guests.push(guest);
	}

	const byId = new Map<string, RaffleGuest>();
	for (const guest of guests) {
		if (!byId.has(guest.id)) byId.set(guest.id, guest);
	}

	return [...byId.values()].toSorted((a, b) =>
		a.name.localeCompare(b.name, "pt-BR")
	);
}

/** @deprecated Use fetchRaffleGuests — kept for older imports. */
export async function fetchCheckedInGuests(options?: {
	apiKey?: string;
	eventId?: string;
}): Promise<RaffleGuest[]> {
	return fetchRaffleGuests({ ...options, checkedInOnly: true });
}

export async function fetchGuestQuestions(options?: {
	apiKey?: string;
	eventId?: string;
}): Promise<GuestQuestion[]> {
	const entries = await fetchApprovedGuestEntries(options);
	const questions: GuestQuestion[] = [];

	for (const entry of entries) {
		questions.push(...extractQuestions(entry));
	}

	return questions.toSorted((a, b) => {
		const aTime = a.registeredAt ?? "";
		const bTime = b.registeredAt ?? "";
		return bTime.localeCompare(aTime);
	});
}
