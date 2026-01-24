"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EVENT_DATE_LABEL = "January 30, 2026";

function HeaderLink({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Button
			asChild
			variant="ghost"
			size="sm"
			className={cn(
				"h-8 rounded-full px-3 text-sm text-foreground/80 backdrop-blur-md hover:bg-white/5 hover:text-foreground",
				isActive && "text-primary"
			)}
		>
			<Link href={href} aria-current={isActive ? "page" : undefined}>
				{children}
			</Link>
		</Button>
	);
}

export function SiteHeader({ className }: { className?: string }) {
	return (
		<header className={cn("animate-fade-up", className)}>
			<div className="flex flex-row items-center justify-center gap-3">

				<nav
					aria-label="Primary"
					className="flex items-center justify-center gap-1.5"
				>
					<HeaderLink href="/">Home</HeaderLink>
					<Badge
						variant="outline"
						className="px-4 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-md"
					>
						{EVENT_DATE_LABEL}
					</Badge>
					<HeaderLink href="/creditos">Badge</HeaderLink>
				</nav>
			</div>
		</header>
	);
}

