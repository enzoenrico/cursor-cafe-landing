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

async function captureFrame(
	element: HTMLElement,
	pixelRatio: number
): Promise<HTMLCanvasElement> {
	// Prefer compositing live WebGL canvases when present (shader badges).
	const glCanvases = [
		...element.querySelectorAll("canvas"),
	] as HTMLCanvasElement[];

	if (glCanvases.length > 0) {
		const rect = element.getBoundingClientRect();
		const width = Math.max(1, Math.round(rect.width * pixelRatio));
		const height = Math.max(1, Math.round(rect.height * pixelRatio));
		const composite = document.createElement("canvas");
		composite.width = width;
		composite.height = height;
		const ctx = composite.getContext("2d");
		if (!ctx) throw new Error("Could not create canvas context");

		// Draw DOM snapshot first (text/chrome), then overlay live canvases.
		try {
			const domFrame = await toCanvas(element, {
				pixelRatio,
				cacheBust: true,
				quality: 1,
			});
			ctx.drawImage(domFrame, 0, 0, width, height);
		} catch {
			ctx.fillStyle = "#0a0a0a";
			ctx.fillRect(0, 0, width, height);
		}

		for (const source of glCanvases) {
			const sourceRect = source.getBoundingClientRect();
			const x = (sourceRect.left - rect.left) * pixelRatio;
			const y = (sourceRect.top - rect.top) * pixelRatio;
			const w = sourceRect.width * pixelRatio;
			const h = sourceRect.height * pixelRatio;
			try {
				ctx.drawImage(source, x, y, w, h);
			} catch {
				// tainted / zero-size canvas — ignore
			}
		}
		return composite;
	}

	return toCanvas(element, {
		pixelRatio,
		cacheBust: true,
		quality: 1,
	});
}

/**
 * Records the live badge DOM (including animated shader canvases) into a WebM video.
 */
export async function recordBadgeVideo(
	element: HTMLElement,
	options: RecordBadgeVideoOptions = {}
): Promise<Blob> {
	if (typeof MediaRecorder === "undefined") {
		throw new Error("MediaRecorder is not available in this browser.");
	}

	const mimeType = pickMimeType();
	if (!mimeType) {
		throw new Error("This browser does not support WebM video recording.");
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
	if (!ctx) throw new Error("Could not create canvas context");

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
		recorder.onerror = () => reject(new Error("MediaRecorder failed"));
		recorder.onstop = () => {
			const blob = new Blob(chunks, { type: mimeType });
			if (blob.size < 1) {
				reject(new Error("Recording produced an empty video."));
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
