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
	return "video/webm";
}

/**
 * Records the live badge DOM (including animated shader canvases) into a WebM video
 * by sampling frames with html-to-image and encoding via MediaRecorder.
 */
export async function recordBadgeVideo(
	element: HTMLElement,
	options: RecordBadgeVideoOptions = {}
): Promise<Blob> {
	const durationMs = options.durationMs ?? 3200;
	const fps = options.fps ?? 20;
	const pixelRatio = options.pixelRatio ?? 2;
	const frameCount = Math.max(1, Math.round((durationMs / 1000) * fps));
	const frameDelay = 1000 / fps;

	const first = await toCanvas(element, {
		pixelRatio,
		cacheBust: true,
		quality: 1,
	});

	const canvas = document.createElement("canvas");
	canvas.width = first.width;
	canvas.height = first.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not create canvas context");

	const stream = canvas.captureStream(fps);
	const mimeType = pickMimeType();
	const recorder = new MediaRecorder(stream, {
		mimeType,
		videoBitsPerSecond: 6_000_000,
	});

	const chunks: BlobPart[] = [];
	recorder.ondataavailable = (event) => {
		if (event.data.size > 0) chunks.push(event.data);
	};

	const stopped = new Promise<Blob>((resolve, reject) => {
		recorder.onerror = () => reject(new Error("MediaRecorder failed"));
		recorder.onstop = () => {
			resolve(new Blob(chunks, { type: mimeType }));
		};
	});

	recorder.start();
	ctx.drawImage(first, 0, 0);
	options.onProgress?.(1 / frameCount);

	for (let i = 1; i < frameCount; i++) {
		await wait(frameDelay);
		const frame = await toCanvas(element, {
			pixelRatio,
			cacheBust: true,
			quality: 1,
		});
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(frame, 0, 0);
		options.onProgress?.((i + 1) / frameCount);
	}

	// Hold the last frame briefly so the encoder flushes motion
	await wait(frameDelay);
	recorder.stop();
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
