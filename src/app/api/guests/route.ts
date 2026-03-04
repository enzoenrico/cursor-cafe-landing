import { NextResponse } from "next/server";

export async function GET() {
	const encoded = process.env.GUESTS_CSV;
	if (!encoded) {
		return NextResponse.json(
			{ error: "Guests data not configured" },
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
