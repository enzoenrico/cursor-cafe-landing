import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { RafflePanel } from "@/components/raffle-panel";
import { BRAND } from "@/lib/branding";

export default function RafflePage() {
	return (
		<PageShell>
			<main className="min-h-screen px-4 py-12 sm:px-6">
				<div className="mb-8 flex items-center justify-between">
					<Link
						href="/"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						← {BRAND.namePt}
					</Link>
					<Link
						href="/host"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						QR da estação
					</Link>
				</div>
				<RafflePanel />
			</main>
		</PageShell>
	);
}
