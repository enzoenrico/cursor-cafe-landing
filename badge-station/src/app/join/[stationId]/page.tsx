"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { BadgeRecord } from "@/lib/badge-types";
import {
	createClientBadge,
	stationBadgeKey,
	writeStoredBadge,
} from "@/lib/client-badge";

function JoinStationInner() {
	const params = useParams<{ stationId: string }>();
	const searchParams = useSearchParams();
	const router = useRouter();
	const stationId = params.stationId;
	const claimedRef = useRef(false);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState("Claiming your badge…");

	useEffect(() => {
		if (!stationId || claimedRef.current) return;
		claimedRef.current = true;

		const eventLabel = searchParams.get("tag") ?? undefined;
		const location = searchParams.get("loc") ?? undefined;

		void (async () => {
			const existingKey = stationBadgeKey(stationId);
			try {
				const existing = localStorage.getItem(existingKey);
				if (existing) {
					setStatus("Welcome back — opening your badge…");
					router.replace(`/badge/${existing}`);
					return;
				}
			} catch {
				// continue to claim
			}

			let badge: BadgeRecord | null = null;

			try {
				const response = await fetch(`/api/stations/${stationId}/claim`, {
					method: "POST",
				});
				if (response.ok) {
					const data = (await response.json()) as { badge: BadgeRecord };
					badge = data.badge;
				}
			} catch {
				// fall through to client assignment
			}

			if (!badge) {
				badge = createClientBadge({
					stationId,
					eventLabel,
					location,
				});
			}

			writeStoredBadge(badge);
			setStatus("Badge assigned — opening studio…");
			router.replace(`/badge/${badge.id}`);
		})().catch((err) => {
			console.error(err);
			setError("Could not assign a badge. Check your connection and try again.");
		});
	}, [router, searchParams, stationId]);

	return (
		<div className="w-full max-w-md space-y-4 rounded-[2rem] border border-white/10 bg-black/35 p-8 text-center backdrop-blur-xl">
			<p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
				QR check-in
			</p>
			<h1 className="text-3xl font-bold tracking-tight">
				{error ? "Almost there" : "Assigning badge"}
			</h1>
			<p className="text-sm text-muted-foreground">{error ?? status}</p>
			{error ? (
				<div className="flex flex-col gap-2">
					<Button
						onClick={() => {
							claimedRef.current = false;
							setError(null);
							setStatus("Claiming your badge…");
							window.location.reload();
						}}
					>
						Try again
					</Button>
					<Button asChild variant="secondary">
						<Link href="/host">Go to host station</Link>
					</Button>
				</div>
			) : (
				<div className="mx-auto h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
					<div className="h-full w-1/2 animate-pulse bg-primary" />
				</div>
			)}
		</div>
	);
}

export default function JoinStationPage() {
	return (
		<main className="bg-animated relative flex min-h-screen items-center justify-center px-6">
			<Suspense
				fallback={
					<div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/35 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
						Claiming your badge…
					</div>
				}
			>
				<JoinStationInner />
			</Suspense>
		</main>
	);
}
