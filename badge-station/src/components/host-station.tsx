"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StationRecord } from "@/lib/badge-types";
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
		name: input.name.trim() || "Event Badge Station",
		eventLabel: input.eventLabel.trim() || "CAFE CURSOR",
		location: input.location.trim() || "Curitiba, PR",
		createdAt: new Date().toISOString(),
		claimCount: 0,
	};
}

export function HostStation() {
	const [station, setStation] = useState<StationRecord | null>(null);
	const [name, setName] = useState("Cafe Cursor Badge Desk");
	const [eventLabel, setEventLabel] = useState("CAFE CURSOR");
	const [location, setLocation] = useState("Curitiba, PR");
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
				// First visit: show a QR immediately so the desk works with one open.
				const created = makeLocalStation({
					name: "Cafe Cursor Badge Desk",
					eventLabel: "CAFE CURSOR",
					location: "Curitiba, PR",
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
					// local station already works without the API
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
			// Optimistic: QR updates immediately, then sync id if API succeeds.
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
			// fallback: select-friendly prompt
			window.prompt("Copy this link", joinUrl);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-4 py-10">
			<div className="max-w-xl text-center">
				<p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
					Badge station
				</p>
				<h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
					Scan to claim
				</h1>
				<p className="mt-3 text-muted-foreground">
					Put this QR on a screen at the entrance. Guests scan with their phone,
					get a badge, customize it, and export an animated video.
				</p>
			</div>

			{!hydrated || !station || !joinUrl ? (
				<div className="text-sm text-muted-foreground">Loading station…</div>
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
								Station name
							</label>
							<Input
								id="station-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="space-y-2 text-left">
							<label className="text-sm font-medium" htmlFor="event-label">
								Badge tag
							</label>
							<Input
								id="event-label"
								value={eventLabel}
								onChange={(e) => setEventLabel(e.target.value)}
							/>
						</div>
						<div className="space-y-2 text-left">
							<label className="text-sm font-medium" htmlFor="location">
								Location
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
							{copied ? "Copied" : "Copy link"}
						</Button>
						<Button
							type="button"
							className="flex-1"
							onClick={() => void createStation()}
							disabled={isCreating}
						>
							{isCreating ? "Creating…" : "New station"}
						</Button>
					</div>
					<a
						href={joinUrl}
						className="text-sm text-primary underline-offset-4 hover:underline"
					>
						Open join link on this device
					</a>
				</div>
			)}
		</div>
	);
}
