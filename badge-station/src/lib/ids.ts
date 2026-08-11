const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function createId(length = 10): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	let id = "";
	for (let i = 0; i < length; i++) {
		id += ALPHABET[bytes[i]! % ALPHABET.length];
	}
	return id;
}

export function createStationCode(): string {
	return createId(6);
}

export function createBadgeId(): string {
	return createId(12);
}
