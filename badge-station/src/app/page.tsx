import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<main className="bg-animated relative min-h-screen overflow-hidden">
			<div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
				<p className="animate-fade-up text-xs tracking-[0.3em] text-muted-foreground uppercase">
					Standalone badge service
				</p>
				<h1 className="animate-fade-up delay-100 mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
					Badge Station
				</h1>
				<p className="animate-fade-up delay-200 mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
					Guests scan a QR code, get assigned an animated badge, customize their
					name and style, then share it as a video of the live badge.
				</p>
				<div className="animate-fade-up delay-300 mt-8">
					<Button asChild size="lg">
						<Link href="/host">Open host QR station</Link>
					</Button>
				</div>
				<p className="animate-fade-in delay-500 mt-8 max-w-md text-xs text-muted-foreground">
					Deploy the `badge-station` folder as its own Vercel project (Root
					Directory: <code className="text-foreground/80">badge-station</code>).
				</p>
			</div>
		</main>
	);
}
