import { NextResponse } from "next/server";

export async function GET() {
	const encoded = process.env.GUESTS_CSV;
	if (!encoded) {
		return NextResponse.json(
			{ error: "Dados de convidados não configurados" },
			{ status: 503 }
		);
	}
	const csv = Buffer.from(encoded, "base64").toString("utf-8");
	return new NextResponse(csv, {
		headers: {
			"Content-Type": "text/csv",
		},
	});
}
