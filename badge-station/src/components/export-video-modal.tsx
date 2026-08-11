"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { downloadBlob, recordBadgeVideo } from "@/lib/video-export";

type ExportVideoModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Live studio badge element that already has the animated WebGL background. */
	captureTargetRef: RefObject<HTMLElement | null>;
	fileName: string;
};

export function ExportVideoModal({
	open,
	onOpenChange,
	captureTargetRef,
	fileName,
}: ExportVideoModalProps) {
	const recordingRef = useRef(false);
	const previewUrlRef = useRef<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	useEffect(() => {
		previewUrlRef.current = previewUrl;
	}, [previewUrl]);

	const clearPreview = useCallback(() => {
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current);
			previewUrlRef.current = null;
		}
		setPreviewUrl(null);
		setProgress(0);
		setError(null);
	}, []);

	const close = useCallback(() => {
		clearPreview();
		recordingRef.current = false;
		setIsRecording(false);
		onOpenChange(false);
	}, [clearPreview, onOpenChange]);

	const exportVideo = useCallback(async () => {
		if (recordingRef.current) return;
		recordingRef.current = true;
		setIsRecording(true);
		setError(null);
		setProgress(0);
		clearPreview();

		try {
			await new Promise<void>((resolve) => {
				requestAnimationFrame(() => resolve());
			});
			await new Promise<void>((resolve) => {
				window.setTimeout(() => resolve(), 150);
			});

			const target = captureTargetRef.current;
			if (!target) {
				throw new Error("A badge da tela ainda não está pronta para gravação.");
			}

			const blob = await recordBadgeVideo(target, {
				durationMs: 2800,
				fps: 16,
				pixelRatio: 1.5,
				onProgress: setProgress,
			});
			const url = URL.createObjectURL(blob);
			previewUrlRef.current = url;
			setPreviewUrl(url);
			downloadBlob(blob, `${fileName}.mp4`);
		} catch (err) {
			console.error(err);
			setError(
				err instanceof Error
					? err.message
					: "Falha ao exportar o vídeo neste navegador. Tente Chrome ou Edge no computador."
			);
		} finally {
			recordingRef.current = false;
			setIsRecording(false);
		}
	}, [captureTargetRef, clearPreview, fileName]);

	useEffect(() => {
		if (!open) return;
		const timer = window.setTimeout(() => {
			void exportVideo();
		}, 350);
		return () => window.clearTimeout(timer);
	}, [open, exportVideo]);

	useEffect(() => {
		if (!open) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !recordingRef.current) close();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, close]);

	const shareVideo = async () => {
		if (!previewUrl) return;
		try {
			const response = await fetch(previewUrl);
			const blob = await response.blob();
			const file = new File([blob], `${fileName}.mp4`, {
				type: blob.type || "video/mp4",
			});
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: "Minha badge do evento",
					text: "Olha minha badge animada do Cursor Além do Código!",
				});
				return;
			}
			downloadBlob(blob, `${fileName}.mp4`);
		} catch (err) {
			console.error(err);
			setError("O compartilhamento foi cancelado ou não está disponível.");
		}
	};

	if (!open || !mounted) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-labelledby="export-video-title"
			data-testid="export-video-modal"
			onClick={(event) => {
				if (event.target === event.currentTarget && !recordingRef.current) {
					close();
				}
			}}
		>
			<div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border/50 bg-background p-6 shadow-2xl">
				<div className="mb-4 space-y-1">
					<h2 id="export-video-title" className="text-lg font-semibold">
						Exportar badge animada
					</h2>
					<p className="text-sm text-muted-foreground">
						Gravando a badge ao vivo da tela — fundo animado, nome, tags e
						dados — em um MP4 para compartilhar.
					</p>
				</div>

				{isRecording ? (
					<div className="mt-2 space-y-2">
						<div className="h-2 overflow-hidden rounded-full bg-secondary">
							<div
								className="h-full bg-primary transition-[width] duration-150"
								style={{ width: `${Math.round(progress * 100)}%` }}
							/>
						</div>
						<p className="text-center text-xs text-muted-foreground">
							Capturando animação… {Math.round(progress * 100)}%
						</p>
					</div>
				) : null}

				{previewUrl ? (
					<video
						src={previewUrl}
						className="mx-auto mt-4 max-h-80 w-full rounded-xl border border-white/10"
						autoPlay
						loop
						muted
						playsInline
						controls
					/>
				) : !isRecording ? (
					<p className="mt-4 text-center text-sm text-muted-foreground">
						A prévia aparece aqui depois da gravação.
					</p>
				) : null}

				{error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

				<div className="mt-5 flex gap-2">
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						onClick={() => void exportVideo()}
						disabled={isRecording}
					>
						{isRecording
							? "Gravando…"
							: previewUrl
								? "Gravar de novo"
								: "Gravar vídeo"}
					</Button>
					<Button
						type="button"
						className="flex-1"
						onClick={() => void shareVideo()}
						disabled={!previewUrl || isRecording}
					>
						Compartilhar
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={close}
						disabled={isRecording}
					>
						Fechar
					</Button>
				</div>
			</div>
		</div>,
		document.body
	);
}
