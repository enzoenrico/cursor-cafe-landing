import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
	children: ReactNode;
	className?: string;
};

/**
 * Keeps the decorative background on its own fixed layer so page content
 * stays in normal stacking order and can receive pointer events.
 */
export function PageShell({ children, className }: PageShellProps) {
	return (
		<div className={cn("relative min-h-screen", className)}>
			<div className="bg-animated pointer-events-none" aria-hidden />
			<div className="relative z-10">{children}</div>
		</div>
	);
}
