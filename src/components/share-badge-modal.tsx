"use client";

import * as React from "react";
import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeCard, type BadgeCardProps } from "@/components/badge-card";

type ShareBadgeModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	badgeProps: Omit<BadgeCardProps, "cta" | "className">;
};

export function ShareBadgeModal({
	open,
	onOpenChange,
	badgeProps,
}: ShareBadgeModalProps) {
	const badgeRef = useRef<HTMLDivElement>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	const shareUrl = typeof window !== "undefined" ? window.location.href : "";
	const shareText = `Check out my Cursor Café badge! 🎉`;

	const shareOnLinkedIn = useCallback(() => {
		const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
		window.open(url, "_blank", "noopener,noreferrer");
	}, [shareUrl]);

	const shareOnX = useCallback(() => {
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
		window.open(url, "_blank", "noopener,noreferrer");
	}, [shareText, shareUrl]);

	const downloadBadge = useCallback(async () => {
		if (!badgeRef.current) return;

		setIsDownloading(true);
		try {
			const dataUrl = await toPng(badgeRef.current, {
				quality: 1,
				pixelRatio: 2,
				cacheBust: true,
			});

			const link = document.createElement("a");
			link.download = `cursor-cafe-badge-${badgeProps.name}.png`;
			link.href = dataUrl;
			link.click();
		} catch (error) {
			console.error("Failed to download badge:", error);
		} finally {
			setIsDownloading(false);
		}
	}, [badgeProps.name]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 max-h-4/5">
				<DialogHeader>
					<DialogTitle>Compartilhar badge</DialogTitle>
					<DialogDescription>
						Compartilhe sua badge nas redes sociais ou baixe como imagem.
					</DialogDescription>
				</DialogHeader>

				<div className="flex justify-center">
					<div ref={badgeRef} className="w-full max-w-sm">
						<BadgeCard {...badgeProps} className="animate-fade-up w-full" />
					</div>
				</div>

				<DialogFooter className="flex-row justify-center gap-2 sm:justify-center">
					<Button
						variant="outline"
						onClick={shareOnLinkedIn}
						className="flex-1"
					>
						<LinkedInIcon className="size-4 mr-2" />
						LinkedIn
					</Button>
					<Button
						variant="outline"
						onClick={shareOnX}
						className="flex-1"
					>
						<XIcon className="size-4 mr-2" />
						X
					</Button>
					<Button
						variant="default"
						onClick={downloadBadge}
						disabled={isDownloading}
						className="flex-1"
					>
						<DownloadIcon className="size-4 mr-2" />
						{isDownloading ? "..." : "Baixar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function LinkedInIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
		</svg>
	);
}

function XIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function DownloadIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7,10 12,15 17,10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	);
}
