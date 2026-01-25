"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { MeasuredBackground } from "../MeasuredBackground";
import { useEffect, useState } from "react";
import { AbstractShape, getRandomColors, getRandomShape } from "../utils/getRandomProperties";


/**
 * Abstract gradient background with grain effect for badge cards.
 */
export function AbstractBadgeBackground() {
	const [shape, setShape] = useState<AbstractShape>(getRandomShape());
	const [colors] = useState(() => getRandomColors(Math.floor(Math.random() * 10) + 1));
	return (
		<MeasuredBackground>
			{({ width, height }) => (
				<GrainGradient
					width={width}
					height={height}
					colors={colors}
					colorBack="#000000"
					softness={0.2}
					intensity={0.75}
					noise={0.5}
					shape={shape}
					speed={1}
					className="absolute inset-0 overflow-hidden opacity-50"
				/>
			)}
		</MeasuredBackground>
	);
}
