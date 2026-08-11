"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { BadgeStudio } from "@/components/badge-studio";
import { PageShell } from "@/components/page-shell";
import type { BadgeRecord } from "@/lib/badge-types";
import { BRAND } from "@/lib/branding";
import { readStoredBadge, writeStoredBadge } from "@/lib/client-badge";

export default function BadgePage() {
	const params = useParams<{ badgeId: string }>();
	const badgeId = params.badgeId;
	const [badge, setBadge] = useState<BadgeRecord | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!badgeId) return;
		let cancelled = false;

		(async () => {
			const cached = readStoredBadge(badgeId);
			if (cached && !cancelled) {
				setBadge(cached);
				setLoading(false);
			}

			try {
				const response = await fetch(`/api/badges/${badgeId}`);
				if (response.ok) {
					const data = (await response.json()) as { badge: BadgeRecord };
					if (!cancelled) {
						setBadge(data.badge);
						writeStoredBadge(data.badge);
						setError(null);
						setLoading(false);
					}
					return;
				}

				if (!cancelled) {
					if (cached) {
						setLoading(false);
					} else {
						setError(
							"Badge não encontrada. Escaneie o QR do evento de novo para receber outra."
						);
						setLoading(false);
					}
				}
			} catch {
				if (!cancelled) {
					if (cached) {
						setLoading(false);
					} else {
						setError("Não foi possível carregar a badge.");
						setLoading(false);
					}
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [badgeId]);

	return (
		<PageShell>
			<main className="min-h-screen px-4 py-10 sm:px-6">
				<div className="mb-8 flex items-center justify-between">
					<Link
						href="/"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						{BRAND.namePt}
					</Link>
					<Link
						href="/host"
						className="inline-flex h-8 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
					>
						QR da estação
					</Link>
				</div>

				{badge ? (
					<BadgeStudio initialBadge={badge} />
				) : (
					<div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-black/35 p-8 text-center backdrop-blur-xl">
						<h1 className="text-2xl font-bold">
							{error
								? "Badge indisponível"
								: loading
									? "Carregando badge…"
									: "Badge indisponível"}
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							{error ?? "Buscando a badge atribuída a você."}
						</p>
						{error ? (
							<Link
								href="/host"
								className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
							>
								Escanear QR da estação
							</Link>
						) : null}
					</div>
				)}
			</main>
		</PageShell>
	);
}
