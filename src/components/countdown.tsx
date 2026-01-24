"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2026-01-30T10:00:00-03:00");

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function calculateTimeLeft(): TimeLeft | null {
	const now = new Date();
	const difference = TARGET_DATE.getTime() - now.getTime();

	if (difference <= 0) {
		return null;
	}

	return {
		days: Math.floor(difference / (1000 * 60 * 60 * 24)),
		hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
		minutes: Math.floor((difference / 1000 / 60) % 60),
		seconds: Math.floor((difference / 1000) % 60),
	};
}

function pad(num: number): string {
	return num.toString().padStart(2, "0");
}

export function Countdown() {
	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const raf = requestAnimationFrame(() => {
			setMounted(true);
			setTimeLeft(calculateTimeLeft());
		});

		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => {
			cancelAnimationFrame(raf);
			clearInterval(timer);
		};
	}, []);

	// Avoid hydration mismatch
	if (!mounted) {
		return (
			<div className="flex items-center justify-center gap-2 sm:gap-4 font-mono text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight">
				<CountdownBlock value="--" label="days" />
				<span className="text-muted-foreground">:</span>
				<CountdownBlock value="--" label="hours" />
				<span className="text-muted-foreground">:</span>
				<CountdownBlock value="--" label="min" />
				<span className="text-muted-foreground">:</span>
				<CountdownBlock value="--" label="sec" />
			</div>
		);
	}

	if (!timeLeft) {
		return (
			<div className="text-center">
				<p className="text-2xl sm:text-4xl font-bold text-primary">
					O evento já começou!
				</p>
				<p className="mt-2 text-muted-foreground">
					Esperamos ver você lá ☕
				</p>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center gap-2 sm:gap-4 font-mono text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight">
			<CountdownBlock value={pad(timeLeft.days)} label="days" />
			<span className="text-muted-foreground self-start mt-2 sm:mt-4">:</span>
			<CountdownBlock value={pad(timeLeft.hours)} label="hours" />
			<span className="text-muted-foreground self-start mt-2 sm:mt-4">:</span>
			<CountdownBlock value={pad(timeLeft.minutes)} label="min" />
			<span className="text-muted-foreground self-start mt-2 sm:mt-4">:</span>
			<CountdownBlock value={pad(timeLeft.seconds)} label="sec" />
		</div>
	);
}

function CountdownBlock({ value, label }: { value: string; label: string }) {
	return (
		<div className="flex flex-col items-center">
			<span className="relative tabular-nums px-2 sm:px-4 py-2 sm:py-3 rounded-lg border backdrop-blur-xl ">
				<span className="text-transparent bg-clip-text bg-linear-to-b from-white/90 via-white/25 to-white/80 drop-shadow-[0_1px_0_rgba(255,255,255,0.08)]">
					{value}
				</span>
			</span>
			<span className="mt-1 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-sans font-medium">
				{label}
			</span>
		</div>
	);
}
