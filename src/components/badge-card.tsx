import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type BadgeCardProps = {
	name: string;
	tags: readonly [string, string];
	location: string;
	activatedAt: string;
	background: React.ReactNode;
	cta?: React.ReactNode;
	className?: string;
};

export function BadgeCard({
	name,
	tags,
	location,
	activatedAt,
	background,
	cta,
	className,
}: BadgeCardProps) {
	return (
		<Card
			className={cn(
				"relative isolate overflow-hidden rounded-4xl border border-white/10 bg-transparent py-0 shadow-xl aspect-reels",
				"flex flex-col justify-between",
				className
			)}
		>
			<div aria-hidden className="absolute inset-0 -z-10">
				{background}
			</div>

			<div
				aria-hidden
				className="absolute inset-0 -z-10 bg-linear-to-b from-black/25 via-black/20 to-black/55"
			/>
			<div aria-hidden className="absolute inset-0 -z-10 bg-black/15" />

			{/* Punch slot */}
			<div
				aria-hidden
				className="absolute top-3 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-black/35 shadow-sm ring-1 ring-white/10"
			>
				<div className="absolute inset-[2px] rounded-full bg-background/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" />
			</div>

			<div className="relative px-6 pt-12 pb-6 flex flex-col items-start justify-between h-full">
				<div className="flex flex-col items-start justify-center">
					<div className="flex items-start justify-between gap-4 pt-8">
						<div className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
							{name}
						</div>

						<div className="relative h-14 w-14 shrink-0 rounded-full border border-white/25 bg-black/25">
							<div className="absolute inset-0 grid place-items-center text-[10px] font-medium tracking-wide text-white/75">
								<div className="-rotate-12 leading-tight text-center">
									<div>Cursor</div>
									<div>Café</div>
									<div className="text-white/55">2026</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-4 flex flex-wrap gap-2">
						<Badge className="border-white/20 bg-white/10 text-white/90">
							{tags[0]}
						</Badge>
						<Badge className="border-white/20 bg-white/10 text-white/90">
							{tags[1]}
						</Badge>
					</div>
				</div>

				{/* down content */}
				<div className="flex flex-col items-start justify-between ">
					<div className="mt-6 grid grid-cols-2 gap-6 ">
						<div className="space-y-1 flex flex-col items-start justify-start">
							<div className="text-[11px] tracking-widest text-white/65">
								LOCATION
							</div>
							<div className="text-sm font-medium text-white/95">
								{location}
							</div>
						</div>

						<div className="space-y-1 flex flex-col items-start justify-start">
							<div className="text-[11px] tracking-widest text-white/65">
								ACTIVATED
							</div>
							<div className="text-sm font-medium text-white/95">
								{activatedAt}
							</div>
						</div>
					</div>

				</div>
			</div>

			{cta ? <div className="px-6 pb-6">{cta}</div> : null}
		</Card>
	);
}

