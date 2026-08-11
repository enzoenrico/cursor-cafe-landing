import { PageShell } from "@/components/page-shell";

export default function HomePage() {
	return (
		<PageShell className="overflow-hidden">
			<main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
				<p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
					Standalone badge service
				</p>
				<h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
					Badge Station
				</h1>
				<p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
					Guests scan a QR code, get assigned an animated badge, customize their
					name and style, then share it as a video of the live badge.
				</p>
				<div className="mt-8">
					{/* Plain anchor avoids client-nav edge cases on cold loads */}
					<a
						href="/host"
						className="relative z-20 inline-flex h-11 min-w-[14rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Open host QR station
					</a>
				</div>
			</main>
		</PageShell>
	);
}
