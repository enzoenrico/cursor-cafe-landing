"use client";

import { HeroSection } from "@/components/hero-section";
import { ThankSection } from "@/components/thank-section";

export default function Home() {
	return (
		<div className="relative">
			<HeroSection />
			<ThankSection />
			{/*<Footer />*/}
		</div>
	);
}
