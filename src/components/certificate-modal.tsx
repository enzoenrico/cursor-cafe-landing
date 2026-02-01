"use client";

import * as React from "react";
import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DitheringSectionBg } from "@/components/dithering-section-bg";

type CertificateModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	guestName: string;
	guestEmail: string;
};

export function CertificateModal({
	open,
	onOpenChange,
	guestName,
	guestEmail,
}: CertificateModalProps) {
	const certificateRef = useRef<HTMLDivElement>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	const downloadPdf = useCallback(async () => {
		if (!certificateRef.current) return;

		setIsDownloading(true);
		try {
			// Convert certificate to PNG
			const dataUrl = await toPng(certificateRef.current, {
				quality: 1,
				pixelRatio: 2,
				cacheBust: true,
				backgroundColor: "#f2f1e8",
			});

			// Create PDF in landscape A4
			const pdf = new jsPDF({
				orientation: "landscape",
				unit: "mm",
				format: "a4",
			});

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			// Add the image to fill the page
			pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

			// Download the PDF
			pdf.save(`certificado-cafe-cursor-${guestName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
		} catch (error) {
			console.error("Failed to download certificate:", error);
		} finally {
			setIsDownloading(false);
		}
	}, [guestName]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl bg-background/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-y-auto overflow-x-hidden">

				<DialogHeader className="relative z-10">
					<DialogTitle>Certificado de Participação</DialogTitle>
					<DialogDescription>
						Baixe seu certificado oficial de participação no Cafe Cursor Curitiba.
					</DialogDescription>
				</DialogHeader>

				<div className="relative z-10 flex justify-center py-4">

					<div
						ref={certificateRef}
						className="w-full aspect-297/210 bg-[#f2f1e8] text-black rounded-lg shadow-lg overflow-hidden"
						style={{ maxWidth: "600px" }}
					>
						{/* Certificate Design */}
						<div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
							{/* Dithering background */}
							<DitheringSectionBg
								shape="warp"
								type="2x2"
								colorBack="#222222"
								colorFront="#f2f1e8"
								size={2}
								speed={0.12}
								scale={0.7}
								opacity={0.25}
							/>
							{/* Decorative border */}
							<div className="absolute inset-3 border-2 border-neutral-300 rounded-lg pointer-events-none" />
							<div className="absolute inset-4 border border-neutral-200 rounded-lg pointer-events-none" />

							{/* Header */}
							<div className="mb-4">
								<h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-neutral-800 uppercase">
									Certificado de Participação
								</h1>
								<div className="mt-2 w-24 h-0.5 bg-neutral-400 mx-auto" />
							</div>

							{/* Body */}
							<div className="space-y-3 max-w-md">
								<p className="text-sm text-neutral-600">
									Certificamos que
								</p>

								<p className="text-xl sm:text-2xl font-semibold text-neutral-900 border-b border-neutral-300 pb-1 px-4">
									{guestName}
								</p>

								<p className="text-sm text-neutral-600">
									participou do evento
								</p>

								<p className="text-xl sm:text-2xl font-bold text-neutral-800 tracking-wide">
									CAFE CURSOR CURITIBA
								</p>

								<p className="text-sm text-neutral-600">
									realizado em <strong>27 de Janeiro de 2026</strong>
								</p>

								<p className="text-sm text-neutral-600">
									Curitiba, PR - Brasil
								</p>
							</div>

							{/* Footer */}
							<div className="mt-6 pt-4 border-t border-neutral-200 w-full max-w-xs">
								<p className="text-xs text-neutral-500 mt-1">
									{guestEmail}
								</p>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="relative z-10 flex-row justify-center gap-2 sm:justify-center">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="flex-1 sm:flex-none"
					>
						Fechar
					</Button>
					<Button
						variant="default"
						onClick={downloadPdf}
						disabled={isDownloading}
						className="flex-1 sm:flex-none"
					>
						<DownloadIcon className="size-4 mr-2" />
						{isDownloading ? "Gerando PDF..." : "Baixar PDF"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function CursorIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86h8.29a.5.5 0 0 0 .35-.85L5.85 3.21a.5.5 0 0 0-.35.01Z" />
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
