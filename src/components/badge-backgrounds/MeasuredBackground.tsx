"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type MeasuredBackgroundProps = {
	children: (size: { width: number; height: number }) => ReactNode;
	className?: string;
};

/**
 * A wrapper component that measures its container size using ResizeObserver
 * and provides the dimensions to children via a render prop.
 *
 * Only renders children when width and height are both > 0.
 */
export function MeasuredBackground({
	children,
	className = "absolute inset-0 h-full w-full pointer-events-none",
}: MeasuredBackgroundProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = wrapperRef.current;
		if (!el) return;

		let raf = 0;
		const measure = () => {
			const rect = el.getBoundingClientRect();
			const width = Math.max(0, Math.round(rect.width));
			const height = Math.max(0, Math.round(rect.height));
			setSize((prev) =>
				prev.width === width && prev.height === height ? prev : { width, height }
			);
		};

		measure();
		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(measure);
		});
		ro.observe(el);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, []);

	return (
		<div ref={wrapperRef} aria-hidden className={className}>
			{size.width > 0 && size.height > 0 ? children(size) : null}
		</div>
	);
}
