"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/branding";
import type { RaffleGuest } from "@/lib/luma";

type GuestsResponse = {
	eventId: string;
	eventUrl: string;
	count: number;
	guests: RaffleGuest[];
	error?: string;
};

type RaffleState = {
	eventId: string;
	drawnIds: string[];
	winners: RaffleGuest[];
};

function storageKey(eventId: string) {
	return `raffle:${eventId}`;
}

function readState(eventId: string): RaffleState {
	try {
		const raw = localStorage.getItem(storageKey(eventId));
		if (!raw) return { eventId, drawnIds: [], winners: [] };
		const parsed = JSON.parse(raw) as RaffleState;
		return {
			eventId,
			drawnIds: Array.isArray(parsed.drawnIds) ? parsed.drawnIds : [],
			winners: Array.isArray(parsed.winners) ? parsed.winners : [],
		};
	} catch {
		return { eventId, drawnIds: [], winners: [] };
	}
}

function writeState(state: RaffleState) {
	try {
		localStorage.setItem(storageKey(state.eventId), JSON.stringify(state));
	} catch {
		// ignore quota / private mode
	}
}

function pickRandomIndex(length: number): number {
	if (length <= 0) return -1;
	const buffer = new Uint32Array(1);
	crypto.getRandomValues(buffer);
	return buffer[0]! % length;
}

export function RafflePanel() {
	const [loading, setLoading] = useState(true);
	const [drawing, setDrawing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [eventId, setEventId] = useState("");
	const [eventUrl, setEventUrl] = useState("https://luma.com/cursor-umd5");
	const [allGuests, setAllGuests] = useState<RaffleGuest[]>([]);
	const [drawnIds, setDrawnIds] = useState<string[]>([]);
	const [winners, setWinners] = useState<RaffleGuest[]>([]);
	const [currentWinner, setCurrentWinner] = useState<RaffleGuest | null>(null);
	const [spinName, setSpinName] = useState<string | null>(null);

	const remaining = useMemo(
		() => allGuests.filter((guest) => !drawnIds.includes(guest.id)),
		[allGuests, drawnIds]
	);

	const hydrateFromStorage = useCallback((id: string) => {
		const saved = readState(id);
		setDrawnIds(saved.drawnIds);
		setWinners(saved.winners);
		setCurrentWinner(saved.winners[0] ?? null);
	}, []);

	const loadGuests = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/raffle/guests", { cache: "no-store" });
			const data = (await response.json()) as GuestsResponse;
			if (!response.ok) {
				throw new Error(data.error || "Não foi possível carregar a lista");
			}
			setEventId(data.eventId);
			setEventUrl(data.eventUrl);
			setAllGuests(data.guests);
			hydrateFromStorage(data.eventId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao carregar convidados");
		} finally {
			setLoading(false);
		}
	}, [hydrateFromStorage]);

	useEffect(() => {
		void loadGuests();
	}, [loadGuests]);

	const persist = (nextDrawn: string[], nextWinners: RaffleGuest[]) => {
		if (!eventId) return;
		writeState({ eventId, drawnIds: nextDrawn, winners: nextWinners });
	};

	const drawWinner = async () => {
		if (drawing || remaining.length === 0) return;
		setDrawing(true);
		setError(null);

		const pool = [...remaining];
		const end = performance.now() + 1600;
		while (performance.now() < end) {
			const idx = pickRandomIndex(pool.length);
			setSpinName(pool[idx]?.name ?? null);
			await new Promise<void>((resolve) => {
				window.setTimeout(resolve, 70);
			});
		}

		const winnerIndex = pickRandomIndex(pool.length);
		const winner = pool[winnerIndex];
		if (!winner) {
			setDrawing(false);
			setSpinName(null);
			return;
		}

		const nextDrawn = [...drawnIds, winner.id];
		const nextWinners = [winner, ...winners];
		setDrawnIds(nextDrawn);
		setWinners(nextWinners);
		setCurrentWinner(winner);
		setSpinName(null);
		persist(nextDrawn, nextWinners);
		setDrawing(false);
	};

	const resetRaffle = () => {
		if (!eventId) return;
		setDrawnIds([]);
		setWinners([]);
		setCurrentWinner(null);
		setSpinName(null);
		persist([], []);
	};

	const putBackLast = () => {
		if (winners.length === 0) return;
		const [last, ...rest] = winners;
		const nextDrawn = drawnIds.filter((id) => id !== last.id);
		setWinners(rest);
		setDrawnIds(nextDrawn);
		setCurrentWinner(rest[0] ?? null);
		persist(nextDrawn, rest);
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
			<div className="space-y-3">
				<p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
					{BRAND.nameEn}
				</p>
				<h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
					Sorteio
				</h1>
				<p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
					Sorteia uma pessoa check-in no evento Luma por vez e remove do
					pote. Fonte:{" "}
					<a
						href={eventUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary underline underline-offset-4"
					>
						luma.com/cursor-umd5
					</a>
				</p>
			</div>

			<div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
				<div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5 backdrop-blur-xl">
					<div className="text-xs tracking-widest text-muted-foreground uppercase">
						Check-in
					</div>
					<div className="mt-2 text-3xl font-bold">{allGuests.length}</div>
				</div>
				<div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5 backdrop-blur-xl">
					<div className="text-xs tracking-widest text-muted-foreground uppercase">
						No pote
					</div>
					<div className="mt-2 text-3xl font-bold">{remaining.length}</div>
				</div>
				<div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-5 backdrop-blur-xl sm:col-span-1">
					<div className="text-xs tracking-widest text-muted-foreground uppercase">
						Sorteados
					</div>
					<div className="mt-2 text-3xl font-bold">{winners.length}</div>
				</div>
			</div>

			<div className="flex min-h-40 w-full items-center justify-center rounded-[2rem] border border-white/10 bg-black/35 px-6 py-10 backdrop-blur-xl">
				{loading ? (
					<p className="text-muted-foreground">Carregando convidados…</p>
				) : error ? (
					<div className="space-y-3">
						<p className="text-red-400">{error}</p>
						<p className="text-sm text-muted-foreground">
							Configure <code className="text-foreground">LUMA_API_KEY</code> no
							ambiente e no Vercel, depois atualize a lista.
						</p>
					</div>
				) : drawing ? (
					<div className="space-y-2">
						<p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
							Sorteando
						</p>
						<p className="text-3xl font-bold tracking-tight sm:text-5xl">
							{spinName}
						</p>
					</div>
				) : currentWinner ? (
					<div className="space-y-2">
						<p className="text-xs tracking-[0.25em] text-primary uppercase">
							Última pessoa sorteada
						</p>
						<p className="text-3xl font-bold tracking-tight sm:text-5xl">
							{currentWinner.name}
						</p>
						{currentWinner.email ? (
							<p className="text-sm text-muted-foreground">
								{currentWinner.email}
							</p>
						) : null}
					</div>
				) : (
					<p className="text-muted-foreground">
						Toque em sortear para revelar a primeira pessoa.
					</p>
				)}
			</div>

			<div className="flex w-full flex-col gap-3 sm:flex-row">
				<Button
					size="lg"
					className="flex-1"
					onClick={() => void drawWinner()}
					disabled={loading || drawing || !!error || remaining.length === 0}
				>
					{drawing
						? "Sorteando…"
						: remaining.length === 0
							? "Pote vazio"
							: "Sortear alguém"}
				</Button>
				<Button
					size="lg"
					variant="secondary"
					className="flex-1"
					onClick={() => void loadGuests()}
					disabled={loading || drawing}
				>
					Atualizar lista
				</Button>
			</div>

			<div className="flex w-full flex-col gap-3 sm:flex-row">
				<Button
					variant="outline"
					className="flex-1"
					onClick={putBackLast}
					disabled={drawing || winners.length === 0}
				>
					Devolver último ao pote
				</Button>
				<Button
					variant="ghost"
					className="flex-1"
					onClick={resetRaffle}
					disabled={drawing || (drawnIds.length === 0 && winners.length === 0)}
				>
					Reiniciar sorteio
				</Button>
			</div>

			{winners.length > 0 ? (
				<div className="w-full space-y-3 text-left">
					<h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
						Histórico
					</h2>
					<ol className="space-y-2">
						{winners.map((winner, index) => (
							<li
								key={`${winner.id}-${index}`}
								className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3"
							>
								<div>
									<div className="font-medium">{winner.name}</div>
									{winner.email ? (
										<div className="text-xs text-muted-foreground">
											{winner.email}
										</div>
									) : null}
								</div>
								<div className="text-xs text-muted-foreground">
									#{winners.length - index}
								</div>
							</li>
						))}
					</ol>
				</div>
			) : null}
		</div>
	);
}
