"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

import { RafflePanel } from "@/components/raffle-panel";
import { SiteHeader } from "@/components/site-header";

export default function RafflePage() {
	const [viewport, setViewport] = useState<{
		width: number;
		height: number;
	} | null>(null);

	useEffect(() => {
		const update = () =>
			setViewport({ width: window.innerWidth, height: window.innerHeight });
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	return (
		<div className="relative min-h-screen">
			<div className="fixed inset-0 -z-10">
				{viewport ? (
					<GrainGradient
						width={viewport.width}
						height={viewport.height}
						colors={["#f2f1e8", "#222222"]}
						colorBack="#000000"
						softness={0.4}
						intensity={0.5}
						noise={0.75}
						shape="corners"
						speed={0.75}
						className="absolute inset-0 overflow-hidden opacity-50"
					/>
				) : null}
			</div>

			<main className="relative px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto mb-8 max-w-3xl">
					<SiteHeader />
				</div>
				<RafflePanel />
			</main>
		</div>
	);
}
