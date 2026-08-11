import Link from "next/link";

import { HostStation } from "@/components/host-station";
import { PageShell } from "@/components/page-shell";
import { BRAND } from "@/lib/branding";

export default function HostPage() {
	return (
		<PageShell>
			<main className="min-h-screen">
				<div className="absolute top-4 left-4 z-20 flex items-center gap-4">
					<Link
						href="/"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						← {BRAND.namePt}
					</Link>
					<Link
						href="/raffle"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Sorteio
					</Link>
				</div>
				<HostStation />
			</main>
		</PageShell>
	);
}
