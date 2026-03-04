"use client";

import { HeroSection } from "@/components/hero-section";
import { ThankSection } from "@/components/thank-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
	return (
		<div className="relative">
			<HeroSection />
			<ThankSection />
			<SiteFooter />
		</div>
	);
}
