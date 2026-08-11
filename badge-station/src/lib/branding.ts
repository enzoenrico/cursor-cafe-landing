/** Branding and default copy for Cursor Além do Código / Beyond Coding */

export const BRAND = {
	namePt: "Cursor Além do Código",
	nameEn: "Cursor Beyond Coding",
	shortTag: "ALÉM DO CÓDIGO",
	eventTag: "EVENTO",
	sealLines: ["Além", "do Código", "2026"] as const,
	defaultStationName: "Estação de Badge — Cursor Além do Código",
	defaultLocation: "Curitiba, PR",
	defaultGuestName: "Convidado",
} as const;

export function formatActivatedAt(date = new Date()): string {
	return date.toLocaleDateString("pt-BR", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}
