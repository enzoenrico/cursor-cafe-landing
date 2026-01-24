"use client";

import { cn } from '@/lib/utils';
import { HalftoneDots } from '@paper-design/shaders-react';
import { useEffect, useState } from 'react';

export function PaperHalftone({ image, inverted, colors, className }: { image: string, inverted: boolean, colors: { back: string, front: string }, className?: string }) {
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({ width: window.innerWidth, height: window.innerHeight });
		};

		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, []);

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
				type="gooey"
				grid="hex"
				inverted={inverted}
			/>
		</div>
	)
}