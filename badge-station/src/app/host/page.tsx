import Link from "next/link";

import { HostStation } from "@/components/host-station";

export default function HostPage() {
	return (
		<main className="bg-animated relative min-h-screen">
			<div className="absolute top-4 left-4 z-10">
				<Link
					href="/"
					className="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					← Badge Station
				</Link>
			</div>
			<HostStation />
		</main>
	);
}
