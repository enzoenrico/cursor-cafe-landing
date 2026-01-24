"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

type Vec3 = readonly [number, number, number];

export type HalftoneBackgroundProps = {
	src: ImageProps["src"];
	alt?: string;
	priority?: boolean;
	className?: string;
	/**
	 * Approx dot cell size in CSS pixels (at DPR=1).
	 * Smaller = more detail, more GPU work.
	 */
	dotSize?: number;
	/**
	 * Dot strength multiplier. 0 = no dots, 1 = full.
	 */
	intensity?: number;
	/**
	 * Ink (dot) color in linear-ish RGB 0..1.
	 */
	ink?: Vec3;
	/**
	 * Background color behind dots in linear-ish RGB 0..1.
	 * Use near-black for dark mode.
	 */
	background?: Vec3;
	/**
	 * Overall opacity of the shader result.
	 */
	opacity?: number;
};

const VERT = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_dotSize;
uniform float u_intensity;
uniform float u_opacity;

varying vec2 v_uv;

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
  vec2 st = v_uv * u_resolution;

  // Grid in pixel space.
  float ds = max(2.0, u_dotSize);
  vec2 cell = floor(st / ds);
  vec2 cellCenter = (cell + 0.5) * ds;
  vec2 uvCell = cellCenter / u_resolution;

  vec3 tex = texture2D(u_tex, uvCell).rgb;
  float lum = luma(tex);

  // Monochrome halftone (high contrast):
  // Brighter areas -> bigger WHITE dots on BLACK background.
  float radius = lum * (ds * 0.5) * clamp(u_intensity, 0.0, 2.0);
  float dist = length(st - cellCenter);

  // Soft edge for nicer dots.
  float aa = 1.0;
  float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, dist);

  vec3 color = mix(vec3(0.0), vec3(1.0), dotMask);

  gl_FragColor = vec4(color, clamp(u_opacity, 0.0, 1.0));
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) {
	const v = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
	const f = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
	if (!v || !f) return null;

	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, v);
	gl.attachShader(program, f);
	gl.linkProgram(program);

	gl.deleteShader(v);
	gl.deleteShader(f);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

function clamp01(x: number) {
	return Math.max(0, Math.min(1, x));
}

export function HalftoneBackground({
	src,
	alt = "",
	priority,
	className,
	dotSize = 7,
	intensity = 1,
	ink: _ink = [0.86, 0.95, 0.98],
	background: _background = [0.03, 0.03, 0.035],
	opacity = 0.55,
}: HalftoneBackgroundProps) {
	const wrapperRef = React.useRef<HTMLDivElement | null>(null);
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const glRef = React.useRef<WebGLRenderingContext | null>(null);
	const programRef = React.useRef<WebGLProgram | null>(null);
	const textureRef = React.useRef<WebGLTexture | null>(null);
	const imgRef = React.useRef<HTMLImageElement | null>(null);
	const [webglOk, setWebglOk] = React.useState(true);
	// Reserved for future shader controls; keep in props without lint noise.
	void _ink;
	void _background;

	const draw = React.useCallback(() => {
		const canvas = canvasRef.current;
		const gl = glRef.current;
		const program = programRef.current;
		const img = imgRef.current;
		if (!canvas || !gl || !program || !img) return;

		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const w = Math.max(1, Math.floor(rect.width * dpr));
		const h = Math.max(1, Math.floor(rect.height * dpr));

		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
			gl.viewport(0, 0, w, h);
		}

		gl.useProgram(program);

		// Upload texture from the Next.js image element.
		const tex = textureRef.current;
		if (!tex) return;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

		const uTex = gl.getUniformLocation(program, "u_tex");
		const uResolution = gl.getUniformLocation(program, "u_resolution");
		const uDotSize = gl.getUniformLocation(program, "u_dotSize");
		const uIntensity = gl.getUniformLocation(program, "u_intensity");
		const uOpacity = gl.getUniformLocation(program, "u_opacity");

		gl.uniform1i(uTex, 0);
		gl.uniform2f(uResolution, w, h);
		gl.uniform1f(uDotSize, dotSize * dpr);
		gl.uniform1f(uIntensity, intensity);
		gl.uniform1f(uOpacity, clamp01(opacity));

		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}, [dotSize, intensity, opacity]);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl", {
			alpha: true,
			antialias: true,
			powerPreference: "low-power",
		});
		if (!gl) {
			setWebglOk(false);
			return;
		}

		const program = createProgram(gl, VERT, FRAG);
		if (!program) {
			setWebglOk(false);
			return;
		}

		const buffer = gl.createBuffer();
		if (!buffer) {
			setWebglOk(false);
			return;
		}

		// Fullscreen quad (two triangles), interleaved position (x,y) + uv (u,v).
		const data = new Float32Array([
			-1, -1, 0, 0,
			1, -1, 1, 0,
			-1, 1, 0, 1,
			-1, 1, 0, 1,
			1, -1, 1, 0,
			1, 1, 1, 1,
		]);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		gl.useProgram(program);

		const aPos = gl.getAttribLocation(program, "a_position");
		const aUv = gl.getAttribLocation(program, "a_uv");

		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
		gl.enableVertexAttribArray(aUv);
		gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

		const tex = gl.createTexture();
		if (!tex) {
			setWebglOk(false);
			return;
		}
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// 1x1 placeholder until the image loads.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array([0, 0, 0, 255])
		);

		glRef.current = gl;
		programRef.current = program;
		textureRef.current = tex;

		const ro = new ResizeObserver(() => draw());
		if (wrapperRef.current) ro.observe(wrapperRef.current);
		draw();

		return () => {
			ro.disconnect();
			try {
				glRef.current = null;
				programRef.current = null;
				textureRef.current = null;
				gl.deleteTexture(tex);
				gl.deleteProgram(program);
				gl.deleteBuffer(buffer);
			} catch {
				// ignore cleanup issues on some drivers
			}
		};
	}, [draw]);

	return (
		<div
			ref={wrapperRef}
			aria-hidden="true"
			className={cn("pointer-events-none fixed inset-0 -z-10", className)}
		>
			{/* Use Next/Image for loading/optimization; we use its underlying <img> as a WebGL texture. */}
			<Image
				src={src}
				alt={alt}
				fill
				priority={priority}
				sizes="100vw"
				className={cn(
					"object-cover opacity-0",
					webglOk ? "select-none" : "opacity-25"
				)}
				onLoadingComplete={(img) => {
					imgRef.current = img;
					// Ensure we redraw once the texture is ready.
					queueMicrotask(() => draw());
				}}
			/>

			{webglOk ? (
				<canvas
					ref={canvasRef}
					className="absolute inset-0 h-full w-full"
					style={{ contain: "layout paint size", willChange: "transform" }}
				/>
			) : (
				// Non-WebGL fallback: show the image faintly + dark overlay.
				<div className="absolute inset-0">
					<div className="absolute inset-0 bg-black/55" />
				</div>
			)}

			{/* Soft vignette/overlay to match the current aesthetic. */}
			<div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-black/40 to-black/70" />
		</div>
	);
}

