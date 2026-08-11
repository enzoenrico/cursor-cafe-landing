"use client";

import { useRef, useState } from "react";

import { BadgeCard, type BadgeCardProps } from "@/components/badge-card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { downloadBlob, recordBadgeVideo } from "@/lib/video-export";

type ExportVideoModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	badgeProps: Omit<BadgeCardProps, "cta" | "className">;
	fileName: string;
};

export function ExportVideoModal({
	open,
	onOpenChange,
	badgeProps,
	fileName,
}: ExportVideoModalProps) {
	const badgeRef = useRef<HTMLDivElement>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const resetPreview = () => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setPreviewUrl(null);
		setProgress(0);
		setError(null);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			resetPreview();
			setIsRecording(false);
		}
		onOpenChange(next);
	};

	const exportVideo = async () => {
		if (!badgeRef.current) return;
		setIsRecording(true);
		setError(null);
		setProgress(0);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}

		try {
			const blob = await recordBadgeVideo(badgeRef.current, {
				durationMs: 3200,
				fps: 20,
				pixelRatio: 2,
				onProgress: setProgress,
			});
			const url = URL.createObjectURL(blob);
			setPreviewUrl(url);
			downloadBlob(blob, `${fileName}.webm`);
		} catch (err) {
			console.error(err);
			setError(
				"Video export failed in this browser. Try Chrome or Edge on desktop."
			);
		} finally {
			setIsRecording(false);
		}
	};

	const shareVideo = async () => {
		if (!previewUrl) return;
		try {
			const response = await fetch(previewUrl);
			const blob = await response.blob();
			const file = new File([blob], `${fileName}.webm`, { type: blob.type });
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: "My event badge",
					text: "Check out my animated event badge!",
				});
				return;
			}
			downloadBlob(blob, `${fileName}.webm`);
		} catch (err) {
			console.error(err);
			setError("Sharing was cancelled or is unavailable.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto border-border/50 bg-background/95 sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Export animated badge</DialogTitle>
					<DialogDescription>
						Records a few seconds of your live badge — shaders included — as a
						WebM video you can share online.
					</DialogDescription>
				</DialogHeader>

				<div className="flex justify-center">
					<div ref={badgeRef} className="w-full max-w-[280px]">
						<BadgeCard {...badgeProps} className="w-full" />
					</div>
				</div>

				{isRecording ? (
					<div className="space-y-2">
						<div className="h-2 overflow-hidden rounded-full bg-secondary">
							<div
								className="h-full bg-primary transition-[width] duration-150"
								style={{ width: `${Math.round(progress * 100)}%` }}
							/>
						</div>
						<p className="text-center text-xs text-muted-foreground">
							Capturing animation… {Math.round(progress * 100)}%
						</p>
					</div>
				) : null}

				{previewUrl ? (
					<video
						src={previewUrl}
						className="mx-auto max-h-64 w-full rounded-xl border border-white/10"
						autoPlay
						loop
						muted
						playsInline
						controls
					/>
				) : null}

				{error ? <p className="text-sm text-red-400">{error}</p> : null}

				<DialogFooter className="flex-row gap-2 sm:justify-center">
					<Button
						variant="outline"
						className="flex-1"
						onClick={exportVideo}
						disabled={isRecording}
					>
						{isRecording ? "Recording…" : previewUrl ? "Record again" : "Record video"}
					</Button>
					<Button
						className="flex-1"
						onClick={shareVideo}
						disabled={!previewUrl || isRecording}
					>
						Share
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
