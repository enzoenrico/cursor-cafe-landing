"use client";

import { useState, useTransition } from "react";

import { BadgeCard } from "@/components/badge-card";
import {
	badgeBackgroundById,
	generateBackgroundConfig,
	getNextBadgeBackgroundId,
	type BadgeBackgroundConfig,
	type BadgeBackgroundId,
} from "@/components/badge-backgrounds/registry";
import { ExportVideoModal } from "@/components/export-video-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BadgeRecord } from "@/lib/badge-types";
import { writeStoredBadge } from "@/lib/client-badge";

type BadgeStudioProps = {
	initialBadge: BadgeRecord;
};

export function BadgeStudio({ initialBadge }: BadgeStudioProps) {
	const [badge, setBadge] = useState(initialBadge);
	const [nameDraft, setNameDraft] = useState(initialBadge.name);
	const [backgroundKey, setBackgroundKey] = useState(0);
	const [isExportOpen, setIsExportOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	const Background = badgeBackgroundById[badge.backgroundId];

	const applyLocal = (next: BadgeRecord) => {
		setBadge(next);
		setNameDraft(next.name);
		setBackgroundKey((k) => k + 1);
		writeStoredBadge(next);
	};

	const persist = (mutator: (current: BadgeRecord) => BadgeRecord) => {
		startTransition(async () => {
			const optimistic = mutator(badge);
			applyLocal(optimistic);

			try {
				const response = await fetch(`/api/badges/${badge.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: optimistic.name,
						backgroundId: optimistic.backgroundId,
						backgroundConfig: optimistic.backgroundConfig,
					}),
				});
				if (!response.ok) return;
				const data = (await response.json()) as { badge: BadgeRecord };
				applyLocal(data.badge);
			} catch {
				// local badge remains the source of truth for serverless deploys
			}
		});
	};

	const saveName = () => {
		const trimmed = nameDraft.trim().slice(0, 40);
		if (!trimmed || trimmed === badge.name) return;
		persist((current) => ({
			...current,
			name: trimmed,
			updatedAt: new Date().toISOString(),
		}));
	};

	const rerollStyle = () => {
		persist((current) => {
			const backgroundId = getNextBadgeBackgroundId(current.backgroundId);
			return {
				...current,
				backgroundId,
				backgroundConfig: generateBackgroundConfig(backgroundId),
				updatedAt: new Date().toISOString(),
			};
		});
	};

	const randomizeSameStyle = () => {
		persist((current) => ({
			...current,
			backgroundConfig: generateBackgroundConfig(current.backgroundId),
			updatedAt: new Date().toISOString(),
		}));
	};

	const setStyle = (id: BadgeBackgroundId) => {
		const config: BadgeBackgroundConfig = generateBackgroundConfig(id);
		persist((current) => ({
			...current,
			backgroundId: id,
			backgroundConfig: config,
			updatedAt: new Date().toISOString(),
		}));
	};

	const badgeProps = {
		name: badge.name,
		tags: badge.tags,
		location: badge.location,
		activatedAt: badge.activatedAt,
		background: (
			<Background key={backgroundKey} config={badge.backgroundConfig.config} />
		),
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
			<div className="w-full max-w-sm shrink-0">
				<BadgeCard
					{...badgeProps}
					className="animate-scale-in w-full pointer-events-auto"
				/>
			</div>

			<div className="animate-fade-up delay-200 w-full max-w-md space-y-6 text-left">
				<div>
					<p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
						Your badge
					</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
						Make it yours
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Set your name, swap the animated style, then export a short video of
						your live badge to share online.
					</p>
				</div>

				<div className="space-y-2">
					<label htmlFor="badge-name" className="text-sm font-medium">
						Display name
					</label>
					<div className="flex gap-2">
						<Input
							id="badge-name"
							value={nameDraft}
							maxLength={40}
							onChange={(e) => setNameDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									saveName();
								}
							}}
							placeholder="Your name"
						/>
						<Button
							type="button"
							variant="secondary"
							onClick={saveName}
							disabled={isPending || !nameDraft.trim()}
						>
							Save
						</Button>
					</div>
				</div>

				<div className="space-y-3">
					<div className="text-sm font-medium">Style</div>
					<div className="grid grid-cols-2 gap-2">
						{(
							[
								["liquid", "Liquid"],
								["abstract", "Abstract"],
								["molten", "Molten"],
								["dithering", "Dither"],
							] as const
						).map(([id, label]) => (
							<Button
								key={id}
								type="button"
								variant={badge.backgroundId === id ? "default" : "outline"}
								onClick={() => setStyle(id)}
								disabled={isPending}
							>
								{label}
							</Button>
						))}
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Button
							type="button"
							variant="secondary"
							onClick={rerollStyle}
							disabled={isPending}
						>
							Reroll style
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={randomizeSameStyle}
							disabled={isPending}
						>
							Shuffle colors
						</Button>
					</div>
				</div>

				<Button
					type="button"
					size="lg"
					className="w-full"
					onClick={() => setIsExportOpen(true)}
					data-testid="export-video-button"
				>
					Export animated video
				</Button>

				<p className="text-xs text-muted-foreground">
					Badge ID{" "}
					<span className="font-mono text-foreground/80">{badge.id}</span>
				</p>
			</div>

			<ExportVideoModal
				open={isExportOpen}
				onOpenChange={setIsExportOpen}
				badgeProps={badgeProps}
				fileName={`badge-${badge.name.toLowerCase().replace(/\s+/g, "-")}`}
			/>
		</div>
	);
}
