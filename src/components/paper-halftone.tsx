"use client";

import { cn } from '@/lib/utils';
import { HalftoneDots } from '@paper-design/shaders-react';
import { useEffect, useRef, useState } from 'react';

export function PaperHalftone({ image, inverted, colors, className }: { image: string, inverted: boolean, colors: { back: string, front: string }, className?: string }) {
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [size, setSize] = useState(0.4);
	const backwardsRef = useRef(false);

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({ width: window.innerWidth, height: window.innerHeight });
		};

		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, []);



	useEffect(() => {
		const MIN = 0.4;
		const MAX = 0.8;
		const STEP = 0.05;

		const interval = setInterval(() => {
			setSize((prev) => {
				let next = prev + (backwardsRef.current ? -STEP : STEP);

				if (next >= MAX) {
					next = MAX;
					backwardsRef.current = true;
				} else if (next <= MIN) {
					next = MIN;
					backwardsRef.current = false;
				}

				return next;
			});
		}, 250);
		return () => clearInterval(interval);
	}, [])

	if (dimensions.width === 0) return null;

	return (
		<div className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
			<HalftoneDots
				width={dimensions.width}
				height={dimensions.height}
				image={image}
				colorBack={colors.back}
				colorFront={colors.front}
				originalColors={false}
				size={size}
				type="gooey"
				grid="hex"
				inverted={inverted}
			/>
		</div>
	)
}