"use client";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaperHalftone } from "@/components/paper-halftone";
import { SiteHeader } from "@/components/site-header";
import { MessageCircle, MessageSquarePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
	return (
		<section className="relative h-screen overflow-hidden">
			{/* Background (image + halftone shader) */}
			<PaperHalftone
				image="/manana.png"
				inverted
				colors={{ back: "#222222", front: "#f2f1e8" }}
				className="opacity-30"
			/>

			<main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
				<div className="w-full max-w-3xl mx-auto text-center">
					<SiteHeader className="mb-6" />

					{/* Title */}
					<h1 className="animate-fade-up delay-100 text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight">
						<span className="text-primary">Cafe </span>
						<span className="text-foreground">Cursor</span>
					</h1>

					{/* Location */}
					<p className="animate-fade-up delay-200 mt-4 sm:mt-6 text-lg sm:text-xl text-foreground">
						Curitiba, Paraná
					</p>
					{/*TODO: real url*/}
					<HoverCard>
						<HoverCardTrigger asChild>
							<p
								className="animate-fade-up delay-300 mt-1 text-base sm:text-lg text-primary cursor-help"
							>
								@Manana Cafés Bigorrilho
							</p>
						</HoverCardTrigger>
						<HoverCardContent className="animate-fade" side="bottom">
							<Link href="https://www.google.com/maps?client=safari&rls=en&oe=UTF-8&um=1&ie=UTF-8&fb=1&gl=br&sa=X&geocode=KRNL6fwo49yUMdSjb6X_gFwK&daddr=R.+Des.+Otávio+do+Amaral,+67+-+Bigorrilho,+Curitiba+-+PR,+80730-400">
								<div className="space-y-3">
									<div className="space-y-0.5">
										<p className="text-sm font-medium text-foreground">Manana Cafés - Bigorrilho</p>
										<p className="text-xs text-muted-foreground">Bigorrilho · Curitiba, PR</p>
									</div>

									<div className="overflow-hidden rounded-md border bg-muted/20">
										<Image src="/manana.png" alt="Manana Café Bigorrilho" width={320} height={180} />
									</div>
								</div>
							</Link>
						</HoverCardContent>
					</HoverCard>

					{/* Countdown Card */}
					<Card className="animate-scale-in delay-400 mt-10 sm:mt-14 backdrop-blur-md border-border/50 bg-transparent">
						<CardContent className="py-8 sm:py-10 bg-transparent">
							<p className="text-center text-2xl font-bold">Obrigado pela presença de todos! O evento foi incrível!</p>
						</CardContent>
					</Card>

					{/* Separator */}
					<Separator className="animate-fade-in delay-500 my-10 sm:my-14 bg-border/30" />

					{/* Links */}
					<div className="animate-fade-up delay-600 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">

						<Button
							variant="default"
							size="lg"
							className="w-full sm:w-auto gap-2 cursor-pointer"
							onClick={() => window.open("https://chat.whatsapp.com/I9YhGre6aoC9Wt6ZOFz1qt", "_blank")}
						>
							<MessageCircle className="size-4" />
							Entre no grupo do WhatsApp
						</Button>

						<Button asChild size="lg" className="w-full sm:w-auto gap-2" variant="secondary">
							<a
								href="https://cursor.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								{/*<ExternalLink className="size-4" />*/}
								<Image src="/cursor.svg" alt="Cursor" width={20} height={20} className="invert" />
								cursor.com
							</a>
						</Button>

						<Button
							asChild
							variant="default"
							size="lg"
							className="w-full sm:w-auto gap-2"
						>
							<a
								href="https://forms.gle/iKovWxB932UN8YTB9"
								target="_blank"
								rel="noopener noreferrer"
							>
								<MessageSquarePlus className="size-4" />
								Deixe seu feedback
							</a>
						</Button>
					</div>

				</div>
			</main>
		</section>
	);
}
