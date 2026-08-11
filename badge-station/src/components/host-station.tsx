"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StationRecord } from "@/lib/badge-types";
import { BRAND } from "@/lib/branding";
import { createStationCode } from "@/lib/ids";

const HOST_STATION_KEY = "badge-station:host-station";

function buildJoinUrl(origin: string, station: StationRecord) {
	const url = new URL(`/join/${station.id}`, origin);
	url.searchParams.set("tag", station.eventLabel);
	url.searchParams.set("loc", station.location);
	return url.toString();
}

function readHostStation(): StationRecord | null {
	try {
		const cached = localStorage.getItem(HOST_STATION_KEY);
		if (!cached) return null;
		return JSON.parse(cached) as StationRecord;
	} catch {
		return null;
	}
}

function writeHostStation(next: StationRecord) {
	try {
		localStorage.setItem(HOST_STATION_KEY, JSON.stringify(next));
	} catch {
		// ignore
	}
}

function makeLocalStation(input: {
	name: string;
	eventLabel: string;
	location: string;
}): StationRecord {
	return {
		id: createStationCode(),
		name: input.name.trim() || BRAND.defaultStationName,
		eventLabel: input.eventLabel.trim() || BRAND.shortTag,
		location: input.location.trim() || BRAND.defaultLocation,
		createdAt: new Date().toISOString(),
		claimCount: 0,
	};
}

export function HostStation() {
	const [station, setStation] = useState<StationRecord | null>(null);
	const [name, setName] = useState<string>(BRAND.defaultStationName);
	const [eventLabel, setEventLabel] = useState<string>(BRAND.shortTag);
	const [location, setLocation] = useState<string>(BRAND.defaultLocation);
	const [origin, setOrigin] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [copied, setCopied] = useState(false);
	const [hydrated, setHydrated] = useState(false);

	const persistLocal = (next: StationRecord) => {
		setStation(next);
		writeHostStation(next);
	};

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setOrigin(window.location.origin);
			const cached = readHostStation();
			if (cached) {
				setStation(cached);
				setName(cached.name);
				setEventLabel(cached.eventLabel);
				setLocation(cached.location);
			} else {
				const created = makeLocalStation({
					name: BRAND.defaultStationName,
					eventLabel: BRAND.shortTag,
					location: BRAND.defaultLocation,
				});
				setStation(created);
				writeHostStation(created);
				void fetch("/api/stations", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: created.name,
						eventLabel: created.eventLabel,
						location: created.location,
					}),
				}).catch(() => {
					// a estação local já funciona sem a API
				});
			}
			setHydrated(true);
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	const joinUrl = useMemo(() => {
		if (!station || !origin) return "";
		return buildJoinUrl(origin, station);
	}, [origin, station]);

	const createStation = async () => {
		if (isCreating) return;
		setIsCreating(true);
		try {
			const local = makeLocalStation({ name, eventLabel, location });
			persistLocal(local);

			const response = await fetch("/api/stations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, eventLabel, location }),
			});

			if (response.ok) {
				const data = (await response.json()) as { station: StationRecord };
				persistLocal(data.station);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsCreating(false);
		}
	};

	const copyLink = async () => {
		if (!joinUrl) return;
		try {
			await navigator.clipboard.writeText(joinUrl);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			window.prompt("Copie este link", joinUrl);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-4 py-10">
			<div className="max-w-xl text-center">
				<p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
					Estação de badge
				</p>
				<h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
					Escaneie para receber
				</h1>
				<p className="mt-3 text-muted-foreground">
					Coloque este QR em uma tela na entrada. As pessoas escaneiam no
					celular, recebem a badge, personalizam e exportam um vídeo animado.
				</p>
			</div>

			{!hydrated || !station || !joinUrl ? (
				<div className="text-sm text-muted-foreground">Carregando estação…</div>
			) : (
				<div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[2rem] border border-white/10 bg-black/30 p-8 backdrop-blur-xl">
					<div className="rounded-3xl bg-white p-4">
						<QRCodeSVG value={joinUrl} size={240} level="M" includeMargin />
					</div>
					<div className="space-y-1 text-center">
						<div className="text-lg font-semibold">{station.name}</div>
						<div className="font-mono text-sm text-primary">{station.id}</div>
						<div className="text-xs break-all text-muted-foreground">{joinUrl}</div>
					</div>

					<div className="grid w-full gap-3">
						<div className="space-y-2 text-left">
							<label className="text-sm font-medium" htmlFor="station-name">
								Nome da estação
							</label>
							<Input
								id="station-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="space-y-2 text-left">
							<label className="text-sm font-medium" htmlFor="event-label">
								Tag da badge
							</label>
							<Input
								id="event-label"
								value={eventLabel}
								onChange={(e) => setEventLabel(e.target.value)}
							/>
						</div>
						<div className="space-y-2 text-left">
							<label className="text-sm font-medium" htmlFor="location">
								Local
							</label>
							<Input
								id="location"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex w-full gap-2">
						<Button
							type="button"
							variant="secondary"
							className="flex-1"
							onClick={() => void copyLink()}
						>
							{copied ? "Copiado" : "Copiar link"}
						</Button>
						<Button
							type="button"
							className="flex-1"
							onClick={() => void createStation()}
							disabled={isCreating}
						>
							{isCreating ? "Criando…" : "Nova estação"}
						</Button>
					</div>
					<a
						href={joinUrl}
						className="text-sm text-primary underline-offset-4 hover:underline"
					>
						Abrir link de entrada neste aparelho
					</a>
				</div>
			)}
		</div>
	);
}
