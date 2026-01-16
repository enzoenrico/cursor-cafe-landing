"use client";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Countdown } from "@/components/countdown";
import { HalftoneBackground } from "@/components/halftone-background";
import { CreditCard, ExternalLink, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
	return (
		<div className="h-screen overflow-y-hidden">
			{/* Background (image + halftone shader) */}
			<HalftoneBackground
				src="/manana.png"
				priority
				dotSize={5}
				intensity={0.4}
				opacity={0.25}
				ink={[0.86, 0.95, 0.98]}
				background={[0.08, 0.08, 0.08]}
			/>
			<div className="absolute inset-0 bg-linear-to-b from-transparent via-gray-900/30 to-gray-900/50" />

			<main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
				<div className="w-full max-w-3xl mx-auto text-center">
					{/* Badge */}
					<div className="animate-fade-up">
						<Badge
							variant="outline"
							className="mb-6 px-4 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-md"
						>
							January 30, 2026
						</Badge>
					</div>

					{/* Title */}
					<h1 className="animate-fade-up delay-100 text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight">
						<span className="text-foreground">Cursor</span>
						<span className="text-primary"> Café</span>
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
							<Countdown />
						</CardContent>
					</Card>

					<HoverCard openDelay={100} closeDelay={200}>
						<HoverCardTrigger asChild>
							<span className="animate-fade-up delay-500 inline-block mt-6 cursor-help">
								<Button variant="outline" size="lg" className="pointer-events-none opacity-70">
									Vagas esgotadas
								</Button>
							</span>
						</HoverCardTrigger>
						<HoverCardContent className="animate-fade" side="bottom">
							<p className="text-sm text-muted-foreground leading-relaxed">
								As vagas estão esgotadas, mas venha tomar um café e conhecer a nossa comunidade.
								Espaço limitado a 60 pessoas — disponibilidade de mesas não garantida.
							</p>
						</HoverCardContent>
					</HoverCard>

					{/* Separator */}
					<Separator className="animate-fade-in delay-500 my-10 sm:my-14 bg-border/30" />

					{/* Links */}
					<div className="animate-fade-up delay-600 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
						<Button asChild size="lg" className="w-full sm:w-auto gap-2">
							<a
								href="https://cursor.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								{/*<ExternalLink className="size-4" />*/}
								<Image src="/cursor.svg" alt="Cursor" width={20} height={20} />
								cursor.com
							</a>
						</Button>

						<Button
							variant="secondary"
							size="lg"
							className="w-full sm:w-auto gap-2"
							disabled
						>
							<CreditCard className="size-4" />
							Créditos
						</Button>

						<Button
							variant="secondary"
							size="lg"
							className="w-full sm:w-auto gap-2 cursor-pointer"
							onClick={() => window.open("https://chat.whatsapp.com/I9YhGre6aoC9Wt6ZOFz1qt", "_blank")}
						>
							<MessageCircle className="size-4" />
							WhatsApp
						</Button>
					</div>

				</div>
			</main >
		</div>
	);
}
