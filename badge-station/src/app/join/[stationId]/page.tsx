"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
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
	const [status, setStatus] = useState("Recebendo sua badge…");

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
					setStatus("Bem-vindo de volta — abrindo sua badge…");
					router.replace(`/badge/${existing}`);
					return;
				}
			} catch {
				// continua para atribuir
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
				// usa atribuição no cliente
			}

			if (!badge) {
				badge = createClientBadge({
					stationId,
					eventLabel,
					location,
				});
			}

			writeStoredBadge(badge);
			setStatus("Badge atribuída — abrindo o estúdio…");
			router.replace(`/badge/${badge.id}`);
		})().catch((err) => {
			console.error(err);
			setError(
				"Não foi possível atribuir uma badge. Verifique a conexão e tente de novo."
			);
		});
	}, [router, searchParams, stationId]);

	return (
		<div className="w-full max-w-md space-y-4 rounded-[2rem] border border-white/10 bg-black/35 p-8 text-center backdrop-blur-xl">
			<p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
				Entrada por QR
			</p>
			<h1 className="text-3xl font-bold tracking-tight">
				{error ? "Quase lá" : "Atribuindo badge"}
			</h1>
			<p className="text-sm text-muted-foreground">{error ?? status}</p>
			{error ? (
				<div className="flex flex-col gap-2">
					<Button
						onClick={() => {
							claimedRef.current = false;
							setError(null);
							setStatus("Recebendo sua badge…");
							window.location.reload();
						}}
					>
						Tentar de novo
					</Button>
					<Button asChild variant="secondary">
						<Link href="/host">Ir para a estação</Link>
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
		<PageShell className="flex min-h-screen items-center justify-center px-6">
			<main className="flex w-full items-center justify-center">
				<Suspense
					fallback={
						<div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/35 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
							Recebendo sua badge…
						</div>
					}
				>
					<JoinStationInner />
				</Suspense>
			</main>
		</PageShell>
	);
}
