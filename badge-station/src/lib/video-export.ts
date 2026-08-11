import { toCanvas } from "html-to-image";

export type RecordBadgeVideoOptions = {
	durationMs?: number;
	fps?: number;
	pixelRatio?: number;
	onProgress?: (progress: number) => void;
};

function pickMimeType(): string {
	const candidates = [
		"video/webm;codecs=vp9",
		"video/webm;codecs=vp8",
		"video/webm",
	];
	for (const type of candidates) {
		if (
			typeof MediaRecorder !== "undefined" &&
			MediaRecorder.isTypeSupported(type)
		) {
			return type;
		}
	}
	return "";
}

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
	const width = Math.max(1, Math.round(rect.width * pixelRatio));
	const height = Math.max(1, Math.round(rect.height * pixelRatio));
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
		console.error("DOM badge overlay capture failed, drawing text fallback", err);
		// Keep a readable scrim + text if DOM snapshot fails
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

/**
 * Records the live badge DOM (full card + animated shader canvases) into a WebM video.
 */
export async function recordBadgeVideo(
	element: HTMLElement,
	options: RecordBadgeVideoOptions = {}
): Promise<Blob> {
	if (typeof MediaRecorder === "undefined") {
		throw new Error("MediaRecorder não está disponível neste navegador.");
	}

	const mimeType = pickMimeType();
	if (!mimeType) {
		throw new Error("Este navegador não suporta gravação de vídeo WebM.");
	}

	const durationMs = options.durationMs ?? 2800;
	const fps = options.fps ?? 16;
	const pixelRatio = options.pixelRatio ?? 1.5;
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
			const blob = new Blob(chunks, { type: mimeType });
			if (blob.size < 1) {
				reject(new Error("A gravação gerou um vídeo vazio."));
				return;
			}
			resolve(blob);
		};
	});

	recorder.start(100);
	ctx.drawImage(first, 0, 0);
	options.onProgress?.(1 / frameCount);

	for (let i = 1; i < frameCount; i++) {
		await wait(frameDelay);
		const frame = await captureFrame(element, pixelRatio);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
		options.onProgress?.((i + 1) / frameCount);
	}

	await wait(frameDelay);
	if (recorder.state !== "inactive") recorder.stop();
	for (const track of stream.getTracks()) track.stop();

	return stopped;
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
