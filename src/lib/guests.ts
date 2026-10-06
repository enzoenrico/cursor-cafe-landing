const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type GuestLookup = {
	firstName: string;
	name: string;
};

export class GuestsUnavailableError extends Error {
	constructor() {
		super("Guests data not configured");
		this.name = "GuestsUnavailableError";
	}
}

export function normalizeGuestEmail(value: string): string | null {
	const email = value.trim().toLowerCase();
	if (email.length === 0 || email.length > 254) return null;
	if (!EMAIL_PATTERN.test(email)) return null;
	return email;
}

export function readGuestsCsv(): string {
	const encoded = process.env.GUESTS_CSV?.trim();
	if (!encoded) {
		throw new GuestsUnavailableError();
	}

	const csv = Buffer.from(encoded, "base64").toString("utf-8");
	if (!csv.trim()) {
		throw new GuestsUnavailableError();
	}
	return csv;
}

/**
 * Finds one attendee by email. The returned object is only that person's
 * display name — never the address, id, or any other row.
 */
export function findGuestByEmail(
	csvText: string,
	normalizedEmail: string,
): GuestLookup | null {
	const rows = parseCsv(stripBom(csvText));
	if (rows.length === 0) return null;

	const headers = rows[0].map((header) => header.trim().toLowerCase());
	const emailIndex = headers.indexOf("email");
	if (emailIndex === -1) {
		throw new GuestsUnavailableError();
	}

	const nameIndex = headers.indexOf("name");
	const firstNameIndex = headers.indexOf("first_name");
	const lastNameIndex = headers.indexOf("last_name");

	for (let i = 1; i < rows.length; i++) {
		const values = rows[i];
		const rowEmail = (values[emailIndex] ?? "").trim().toLowerCase();
		if (rowEmail !== normalizedEmail) continue;

		return guestNameFromValues(values, {
			nameIndex,
			firstNameIndex,
			lastNameIndex,
		});
	}

	return null;
}

function guestNameFromValues(
	values: string[],
	columns: {
		nameIndex: number;
		firstNameIndex: number;
		lastNameIndex: number;
	},
): GuestLookup {
	const first = cell(values, columns.firstNameIndex);
	const last = cell(values, columns.lastNameIndex);
	const combined = [first, last].filter(Boolean).join(" ");
	const name = cell(values, columns.nameIndex) || combined;
	const firstName = first || name;
	return { firstName, name };
}

function cell(values: string[], index: number): string {
	if (index < 0) return "";
	return (values[index] ?? "").trim();
}

function stripBom(csvText: string): string {
	if (csvText.charCodeAt(0) === 0xfeff) return csvText.slice(1);
	return csvText;
}

function parseCsv(csvText: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < csvText.length; i++) {
		const char = csvText[i];

		if (inQuotes) {
			if (char === '"') {
				if (csvText[i + 1] === '"') {
					field += '"';
					i += 1;
				} else {
					inQuotes = false;
				}
			} else {
				field += char;
			}
			continue;
		}

		if (char === '"') {
			inQuotes = true;
			continue;
		}

		if (char === ",") {
			row.push(field);
			field = "";
			continue;
		}

		if (char === "\n" || char === "\r") {
			if (char === "\r" && csvText[i + 1] === "\n") i += 1;
			row.push(field);
			field = "";
			if (row.some((value) => value.length > 0)) rows.push(row);
			row = [];
			continue;
		}

		field += char;
	}

	if (field.length > 0 || row.length > 0) {
		row.push(field);
		if (row.some((value) => value.length > 0)) rows.push(row);
	}

	return rows;
}
