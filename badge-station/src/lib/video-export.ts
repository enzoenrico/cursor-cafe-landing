import {
	BufferTarget,
	canEncodeVideo,
	CanvasSource,
	Mp4OutputFormat,
	Output,
	QUALITY_HIGH,
} from "mediabunny";
import { toCanvas } from "html-to-image";

export type RecordBadgeVideoOptions = {
	durationMs?: number;
	fps?: number;
	pixelRatio?: number;
	onProgress?: (progress: number) => void;
};

function isShaderNode(node: HTMLElement): boolean {
	if (node instanceof HTMLCanvasElement) return true;
	// Paper-design shader wrappers are aria-hidden absolute fills.
	if (
		node.getAttribute("aria-hidden") === "true" &&
		node.querySelector("canvas")
	) {
		return true;
	}
	return false;
}

function toEven(value: number): number {
	const rounded = Math.max(2, Math.round(value));
	return rounded % 2 === 0 ? rounded : rounded + 1;
}

/**
 * Capture one frame of the full badge card:
 * 1) animated shader canvases as the background
 * 2) DOM chrome/text (name, tags, location, activated) composited on top
 */
async function captureFrame(
	element: HTMLElement,
	pixelRatio: number
): Promise<HTMLCanvasElement> {
	const rect = element.getBoundingClientRect();
	const width = toEven(rect.width * pixelRatio);
	const height = toEven(rect.height * pixelRatio);
	const composite = document.createElement("canvas");
	composite.width = width;
	composite.height = height;
	const ctx = composite.getContext("2d");
	if (!ctx) throw new Error("Não foi possível criar o contexto do canvas");

	// Opaque card back so transparent areas don't show checkerboard.
	ctx.fillStyle = "#0a0a0a";
	ctx.fillRect(0, 0, width, height);

	const glCanvases = [
		...element.querySelectorAll("canvas"),
	] as HTMLCanvasElement[];

	// 1) Animated shader layer (behind the card chrome)
	for (const source of glCanvases) {
		const sourceRect = source.getBoundingClientRect();
		if (sourceRect.width < 1 || sourceRect.height < 1) continue;
		const x = (sourceRect.left - rect.left) * pixelRatio;
		const y = (sourceRect.top - rect.top) * pixelRatio;
		const w = Math.max(1, sourceRect.width * pixelRatio);
		const h = Math.max(1, sourceRect.height * pixelRatio);
		try {
			ctx.drawImage(source, x, y, w, h);
		} catch {
			// tainted / lost context — skip this canvas for the frame
		}
	}

	// 2) Card chrome + text on top (name, tags, location, activated, punch, scrims)
	//    Shader canvases are filtered out so they don't cover the overlay.
	try {
		const domFrame = await toCanvas(element, {
			pixelRatio,
			cacheBust: true,
			quality: 1,
			filter: (node) => {
				if (!(node instanceof HTMLElement)) return true;
				return !isShaderNode(node);
			},
			style: {
				backgroundColor: "transparent",
			},
		});
		ctx.drawImage(domFrame, 0, 0, width, height);
	} catch (err) {
		console.error("Falha ao capturar overlay da badge; usando fallback de texto", err);
		const scrim = ctx.createLinearGradient(0, 0, 0, height);
		scrim.addColorStop(0, "rgba(0,0,0,0.28)");
		scrim.addColorStop(0.45, "rgba(0,0,0,0.18)");
		scrim.addColorStop(1, "rgba(0,0,0,0.55)");
		ctx.fillStyle = scrim;
		ctx.fillRect(0, 0, width, height);
		drawTextFallback(ctx, element, width, height, pixelRatio);
	}

	return composite;
}

/** Last-resort overlay if html-to-image fails on the card chrome. */
function drawTextFallback(
	ctx: CanvasRenderingContext2D,
	element: HTMLElement,
	width: number,
	height: number,
	pixelRatio: number
) {
	const name =
		element.querySelector("[data-badge-name]")?.textContent?.trim() ||
		element.querySelector(".font-bold")?.textContent?.trim() ||
		"Convidado";
	const tags = [...element.querySelectorAll("[data-slot='badge']")].map((n) =>
		(n.textContent || "").trim()
	);
	const labels = [...element.querySelectorAll(".tracking-widest")].map((n) =>
		(n.textContent || "").trim()
	);
	const values = [...element.querySelectorAll(".text-sm.font-medium")].map((n) =>
		(n.textContent || "").trim()
	);

	const pad = 24 * pixelRatio;
	ctx.fillStyle = "#ffffff";
	ctx.font = `700 ${Math.round(36 * pixelRatio)}px system-ui, sans-serif`;
	ctx.textBaseline = "top";
	ctx.fillText(name, pad, pad * 2.2, width - pad * 2);

	ctx.font = `600 ${Math.round(12 * pixelRatio)}px system-ui, sans-serif`;
	let tagX = pad;
	const tagY = pad * 4.2;
	for (const tag of tags.slice(0, 2)) {
		const tw = ctx.measureText(tag).width + 16 * pixelRatio;
		ctx.fillStyle = "rgba(255,255,255,0.12)";
		roundRect(ctx, tagX, tagY, tw, 22 * pixelRatio, 999);
		ctx.fill();
		ctx.fillStyle = "rgba(255,255,255,0.9)";
		ctx.fillText(tag, tagX + 8 * pixelRatio, tagY + 5 * pixelRatio);
		tagX += tw + 8 * pixelRatio;
	}

	const bottomY = height - pad * 3.2;
	ctx.fillStyle = "rgba(255,255,255,0.65)";
	ctx.font = `500 ${Math.round(10 * pixelRatio)}px system-ui, sans-serif`;
	ctx.fillText(labels[0] || "LOCAL", pad, bottomY);
	ctx.fillText(labels[1] || "ATIVADA EM", width / 2, bottomY);
	ctx.fillStyle = "rgba(255,255,255,0.95)";
	ctx.font = `600 ${Math.round(13 * pixelRatio)}px system-ui, sans-serif`;
	ctx.fillText(values[0] || "", pad, bottomY + 16 * pixelRatio);
	ctx.fillText(values[1] || "", width / 2, bottomY + 16 * pixelRatio);
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	const radius = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + w, y, x + w, y + h, radius);
	ctx.arcTo(x + w, y + h, x, y + h, radius);
	ctx.arcTo(x, y + h, x, y, radius);
	ctx.arcTo(x, y, x + w, y, radius);
	ctx.closePath();
}

async function recordWithMediabunny(
	element: HTMLElement,
	options: Required<
		Pick<RecordBadgeVideoOptions, "durationMs" | "fps" | "pixelRatio">
	> &
		Pick<RecordBadgeVideoOptions, "onProgress">
): Promise<Blob> {
	const canEncode = await canEncodeVideo("avc");
	if (!canEncode) {
		throw new Error("Este navegador não suporta gravação de vídeo MP4 (H.264).");
	}

	const { durationMs, fps, pixelRatio, onProgress } = options;
	const frameCount = Math.max(1, Math.round((durationMs / 1000) * fps));
	const frameDuration = 1 / fps;

	const first = await captureFrame(element, pixelRatio);
	const canvas = document.createElement("canvas");
	canvas.width = first.width;
	canvas.height = first.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Não foi possível criar o contexto do canvas");

	const target = new BufferTarget();
	const output = new Output({
		format: new Mp4OutputFormat({ fastStart: "in-memory" }),
		target,
	});

	const videoSource = new CanvasSource(canvas, {
		codec: "avc",
		bitrate: QUALITY_HIGH,
		keyFrameInterval: 1,
		latencyMode: "quality",
	});
	output.addVideoTrack(videoSource);
	await output.start();

	ctx.drawImage(first, 0, 0);
	await videoSource.add(0, frameDuration, { keyFrame: true });
	onProgress?.(1 / frameCount);

	for (let i = 1; i < frameCount; i++) {
		// Pace roughly with realtime so shader animation has time to advance.
		await wait(1000 / fps);
		const frame = await captureFrame(element, pixelRatio);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
		await videoSource.add(i * frameDuration, frameDuration, {
			keyFrame: i % Math.max(1, Math.round(fps)) === 0,
		});
		onProgress?.((i + 1) / frameCount);
	}

	videoSource.close();
	await output.finalize();

	const buffer = target.buffer;
	if (!buffer || buffer.byteLength < 1) {
		throw new Error("A gravação gerou um vídeo vazio.");
	}

	return new Blob([buffer], { type: "video/mp4" });
}

/**
 * Fallback for browsers without WebCodecs H.264 encode (e.g. some Safari builds).
 * Only used when MediaRecorder can emit a real MP4 container.
 */
async function recordWithMediaRecorderMp4(
	element: HTMLElement,
	options: Required<
		Pick<RecordBadgeVideoOptions, "durationMs" | "fps" | "pixelRatio">
	> &
		Pick<RecordBadgeVideoOptions, "onProgress">
): Promise<Blob> {
	const mimeCandidates = [
		"video/mp4;codecs=avc1.42E01E",
		"video/mp4;codecs=avc1",
		"video/mp4",
	];
	const mimeType =
		typeof MediaRecorder !== "undefined"
			? mimeCandidates.find((type) => MediaRecorder.isTypeSupported(type))
			: undefined;

	if (!mimeType) {
		throw new Error(
			"Este navegador não suporta gravação de vídeo MP4. Use Chrome, Edge ou Safari recente."
		);
	}

	const { durationMs, fps, pixelRatio, onProgress } = options;
	const frameCount = Math.max(1, Math.round((durationMs / 1000) * fps));
	const frameDelay = 1000 / fps;

	const first = await captureFrame(element, pixelRatio);
	const canvas = document.createElement("canvas");
	canvas.width = first.width;
	canvas.height = first.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Não foi possível criar o contexto do canvas");

	const stream = canvas.captureStream(fps);
	const recorder = new MediaRecorder(stream, {
		mimeType,
		videoBitsPerSecond: 5_000_000,
	});

	const chunks: BlobPart[] = [];
	recorder.ondataavailable = (event) => {
		if (event.data.size > 0) chunks.push(event.data);
	};

	const stopped = new Promise<Blob>((resolve, reject) => {
		recorder.onerror = () => reject(new Error("Falha no MediaRecorder"));
		recorder.onstop = () => {
			const blob = new Blob(chunks, { type: "video/mp4" });
			if (blob.size < 1) {
				reject(new Error("A gravação gerou um vídeo vazio."));
				return;
			}
			resolve(blob);
		};
	});

	recorder.start(100);
	ctx.drawImage(first, 0, 0);
	onProgress?.(1 / frameCount);

	for (let i = 1; i < frameCount; i++) {
		await wait(frameDelay);
		const frame = await captureFrame(element, pixelRatio);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
		onProgress?.((i + 1) / frameCount);
	}

	await wait(frameDelay);
	if (recorder.state !== "inactive") recorder.stop();
	for (const track of stream.getTracks()) track.stop();

	return stopped;
}

/**
 * Records the live badge DOM (full card + animated shader canvases) into an MP4 video.
 */
export async function recordBadgeVideo(
	element: HTMLElement,
	options: RecordBadgeVideoOptions = {}
): Promise<Blob> {
	const resolved = {
		durationMs: options.durationMs ?? 2800,
		fps: options.fps ?? 16,
		pixelRatio: options.pixelRatio ?? 1.5,
		onProgress: options.onProgress,
	};

	try {
		return await recordWithMediabunny(element, resolved);
	} catch (primaryError) {
		console.warn("Exportação MP4 via WebCodecs falhou, tentando MediaRecorder", primaryError);
		try {
			return await recordWithMediaRecorderMp4(element, resolved);
		} catch (fallbackError) {
			if (primaryError instanceof Error) throw primaryError;
			throw fallbackError;
		}
	}
}

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

function wait(ms: number) {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, ms);
	});
}
