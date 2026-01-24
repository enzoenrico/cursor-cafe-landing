"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { BadgeCard } from "@/components/badge-card";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { GrainGradient, LiquidMetal } from "@paper-design/shaders-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreditosPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [badgeBackground, setBadgeBackground] = useState<"abstract" | "liquid">(
		"liquid"
	);
	const [viewport, setViewport] = useState<{ width: number; height: number } | null>(
		null
	);

	const emailTrimmed = email.trim();
	const isEmailValid = useMemo(
		() => EMAIL_RE.test(emailTrimmed),
		[emailTrimmed]
	);

	useEffect(() => {
		const update = () =>
			setViewport({ width: window.innerWidth, height: window.innerHeight });

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	const panelBase =
		"overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]";
	const panelShown = "opacity-100 translate-y-0 scale-100";
	const panelHidden =
		"max-h-0 opacity-0 -translate-y-2 scale-[0.985] pointer-events-none";

	const swapBadgeBackground = () => {
		setBadgeBackground((prev) => (prev === "liquid" ? "abstract" : "liquid"));
	};

	return (
		<div className="relative h-screen ">
			{viewport ? (
				<GrainGradient
					width={viewport.width}
					height={viewport.height}
					colors={["#f2f1e8", "#222222"]}
					colorBack="#000000"
					softness={0.4}
					intensity={0.5}
					noise={0.75}
					shape="corners"
					speed={0.75}
					className="absolute inset-0 -z-10 overflow-hidden opacity-50"
				/>
			) : null}

			<main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
				<div className="w-full max-w-3xl mx-auto text-center">
					<SiteHeader className="mb-6" />

					<h1 className="animate-fade-up delay-100 text-4xl sm:text-6xl font-bold tracking-tight">
						Sua badge
					</h1>

					<p className="animate-fade-up delay-200 mt-4 text-base sm:text-lg text-muted-foreground">
						Uma forma de sempre lembrar do Cursor Café Curitiba!
					</p>

					<div className="animate-scale-in delay-300 mt-10 mx-auto w-full max-w-lg text-left  rounded-4xl backdrop-blur-xl">
						<div className="relative">
							<div
								data-state={submitted ? "hidden" : "shown"}
								className={[
									panelBase,
									submitted ? panelHidden : panelShown,
								].join(" ")}
							>
								<Card className="border-border/50 bg-transparent rounded-4xl ">
									<CardHeader>
										<CardTitle>Seu e-mail</CardTitle>
										<CardDescription>
											Usamos apenas para enviar a confirmação.
										</CardDescription>
									</CardHeader>

									<CardContent>
										<form
											className="space-y-4"
											onSubmit={(e) => {
												e.preventDefault();
												setSubmitted(true);
											}}
										>
											<div className="space-y-2">
												<label
													htmlFor="email"
													className="text-sm font-medium text-foreground"
												>
													Email
												</label>
												<input
													id="email"
													name="email"
													type="email"
													inputMode="email"
													autoComplete="email"
													placeholder="voce@exemplo.com"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													className="w-full rounded-md border border-border/50 bg-background/40 px-4 py-2.5 text-sm text-foreground shadow-xs backdrop-blur-md placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
												/>
											</div>

											<Button
												type="submit"
												size="lg"
												className="w-full"
											>
												Confirmar email
											</Button>
										</form>
									</CardContent>
								</Card>
							</div>

							<div
								data-state={submitted ? "shown" : "hidden"}
								className={[
									submitted ? panelShown : panelHidden,
									"flex items-center justify-center",
								].join(" ")}
							>
								{createBadge({
									background:
										badgeBackground === "liquid" ? (
											<LiquidMetalFill />
										) : (
											<AbstractBackground />
										),
									onSwapBackground: swapBadgeBackground,
								})}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}


function createBadge({
	background,
	onSwapBackground,
}: {
	background: React.ReactNode;
	onSwapBackground: () => void;
}) {
	return (
		<BadgeCard
			name="enzoenrico"
			tags={["ALPHA USER", "#54801"]}
			location="Curitiba, BR • UTC-3"
			activatedAt="Jan 23, 2026 • 09:45"
			background={background}
			cta={
				<Button
					asChild
					variant="secondary"
					className="w-full"
					onClick={(e) => {
						e.preventDefault();
						onSwapBackground();
					}}
				>
					<Link href="/">Compartilhar!</Link>
				</Button>
			}
		/>
	);
}

function AbstractBackground() {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = wrapperRef.current;
		if (!el) return;

		let raf = 0;
		const measure = () => {
			const rect = el.getBoundingClientRect();
			const width = Math.max(0, Math.round(rect.width));
			const height = Math.max(0, Math.round(rect.height));
			setSize((prev) =>
				prev.width === width && prev.height === height ? prev : { width, height }
			);
		};

		measure();
		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(measure);
		});
		ro.observe(el);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, []);

	return (
		<div
			ref={wrapperRef}
			aria-hidden
			className="absolute inset-0 h-full w-full pointer-events-none"
		>
			{size.width > 0 && size.height > 0 ? (
				<GrainGradient
					width={size.width}
					height={size.height}
					colors={["#ff14dc", "#69671c", "#69ff67"]}
					colorBack="#000000"
					softness={0.2}
					intensity={0.75}
					noise={0.5}
					shape="corners"
					speed={1}
					className="absolute inset-0 overflow-hidden opacity-50"
				/>
			) : null}
		</div>
	);
}

function LiquidMetalFill() {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const el = wrapperRef.current;
		if (!el) return;

		let raf = 0;
		const measure = () => {
			const rect = el.getBoundingClientRect();
			const width = Math.max(0, Math.round(rect.width));
			const height = Math.max(0, Math.round(rect.height));
			setSize((prev) =>
				prev.width === width && prev.height === height ? prev : { width, height }
			);
		};

		measure();
		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(measure);
		});
		ro.observe(el);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, []);

	return (
		<div
			ref={wrapperRef}
			aria-hidden
			className="absolute inset-0 h-full w-full pointer-events-none"
		>
			{size.width > 0 && size.height > 0 ? (
				<LiquidMetal
					width={size.width}
					height={size.height}
					image="/cursor.svg"
					colorBack="#222222"
					colorTint="#ffffff"
					shape={"circle"}
					repetition={4.16}
					softness={0.92}
					shiftRed={0.28}
					shiftBlue={0.42}
					distortion={0.6}
					contour={0.7}
					angle={142}
					speed={0.44}
					scale={0.5}
					fit="cover"
					className="h-full w-full"
				/>
			) : null}
		</div>
	);
}