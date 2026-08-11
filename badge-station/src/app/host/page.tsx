import Link from "next/link";

import { HostStation } from "@/components/host-station";
import { PageShell } from "@/components/page-shell";
import { BRAND } from "@/lib/branding";

export default function HostPage() {
	return (
		<PageShell>
			<main className="min-h-screen">
				<div className="absolute top-4 left-4 z-20">
					<Link
						href="/"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						← {BRAND.namePt}
					</Link>
				</div>
				<HostStation />
			</main>
		</PageShell>
	);
}
