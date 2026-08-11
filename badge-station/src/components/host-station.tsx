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

export function HostStation() {
	const [station, setStation] = useState<StationRecord | null>(null);
	const [name, setName] = useState("Cafe Cursor Badge Desk");
	const [eventLabel, setEventLabel] = useState("CAFE CURSOR");
	const [location, setLocation] = useState("Curitiba, PR");
	const [origin, setOrigin] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setOrigin(window.location.origin);
			const cached = readHostStation();
			if (cached) {
				setStation(cached);
				setName(cached.name);
				setEventLabel(cached.eventLabel);
				setLocation(cached.location);
			}
			setHydrated(true);
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	const joinUrl = useMemo(() => {
		if (!station || !origin) return "";
		return buildJoinUrl(origin, station);
	}, [origin, station]);

	const persistLocal = (next: StationRecord) => {
		setStation(next);
		try {
			localStorage.setItem(HOST_STATION_KEY, JSON.stringify(next));
		} catch {
			// ignore
		}
	};

	const createStation = async () => {
		setIsCreating(true);
		try {
			const response = await fetch("/api/stations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, eventLabel, location }),
			});

			if (response.ok) {
				const data = (await response.json()) as { station: StationRecord };
				persistLocal(data.station);
				return;
			}

			persistLocal({
				id: createStationCode(),
				name: name.trim() || "Event Badge Station",
				eventLabel: eventLabel.trim() || "CAFE CURSOR",
				location: location.trim() || "Curitiba, PR",
				createdAt: new Date().toISOString(),
				claimCount: 0,
			});
		} catch (err) {
			console.error(err);
			persistLocal({
				id: createStationCode(),
				name: name.trim() || "Event Badge Station",
				eventLabel: eventLabel.trim() || "CAFE CURSOR",
				location: location.trim() || "Curitiba, PR",
				createdAt: new Date().toISOString(),
				claimCount: 0,
			});
		} finally {
			setIsCreating(false);
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

			{!hydrated ? (
				<div className="text-sm text-muted-foreground">Loading station…</div>
			) : station && joinUrl ? (
				<div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[2rem] border border-white/10 bg-black/30 p-8 backdrop-blur-xl">
					<div className="rounded-3xl bg-white p-4">
						<QRCodeSVG value={joinUrl} size={240} level="M" includeMargin />
					</div>
					<div className="space-y-1 text-center">
						<div className="text-lg font-semibold">{station.name}</div>
						<div className="font-mono text-sm text-primary">{station.id}</div>
						<div className="text-xs break-all text-muted-foreground">{joinUrl}</div>
					</div>
					<div className="flex w-full gap-2">
						<Button
							variant="secondary"
							className="flex-1"
							onClick={() => {
								void navigator.clipboard?.writeText(joinUrl);
							}}
						>
							Copy link
						</Button>
						<Button className="flex-1" onClick={createStation} disabled={isCreating}>
							New station
						</Button>
					</div>
				</div>
			) : (
				<div className="w-full max-w-md space-y-4 rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="station-name">
							Station name
						</label>
						<Input
							id="station-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="event-label">
							Badge tag
						</label>
						<Input
							id="event-label"
							value={eventLabel}
							onChange={(e) => setEventLabel(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="location">
							Location
						</label>
						<Input
							id="location"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						/>
					</div>
					<Button
						className="w-full"
						size="lg"
						onClick={createStation}
						disabled={isCreating}
					>
						{isCreating ? "Creating…" : "Create QR station"}
					</Button>
				</div>
			)}
		</div>
	);
}
