"use client";

import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { BadgeCard, type BadgeCardProps } from "@/components/badge-card";
import { ShareBadgeModal } from "@/components/share-badge-modal";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { GrainGradient } from "@paper-design/shaders-react";

import {
	type BadgeBackgroundId,
	type BadgeBackgroundConfig,
	badgeBackgroundById,
	getNextBadgeBackgroundId,
	generateBackgroundConfig,
} from "@/components/badge-backgrounds/registry";

type Guest = {
	name: string;
	first_name: string;
	last_name: string;
	email: string;
	api_id: string;
};

export default function CreditosPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [guest, setGuest] = useState<Guest | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [badgeBackground, setBadgeBackground] =
		useState<BadgeBackgroundId>("liquid");
	const [backgroundConfig, setBackgroundConfig] = useState<BadgeBackgroundConfig>(
		() => generateBackgroundConfig("liquid")
	);
	const [backgroundKey, setBackgroundKey] = useState(0);
	const [viewport, setViewport] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [capturedBadgeProps, setCapturedBadgeProps] = useState<
		Omit<BadgeCardProps, "cta" | "className"> | null
	>(null);

	useEffect(() => {
		const update = () =>
			setViewport({ width: window.innerWidth, height: window.innerHeight });

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	const swapBadgeBackground = () => {
		const nextId = getNextBadgeBackgroundId(badgeBackground);
		setBadgeBackground(nextId);
		setBackgroundConfig(generateBackgroundConfig(nextId));
		setBackgroundKey((k) => k + 1);
	};

	const shareBadge = () => {
		setCapturedBadgeProps({
			...badgeConfig,
			background: <Background key={backgroundKey} config={backgroundConfig.config} />,
		});
		setIsShareModalOpen(true);
	};

	const handleShareModalClose = (open: boolean) => {
		setIsShareModalOpen(open);
		if (!open) {
			setCapturedBadgeProps(null);
		}
	};

	const Background = badgeBackgroundById[badgeBackground];

	// Badge configuration - shared between display and share modal
	const badgeConfig = {
		name: guest?.first_name || guest?.name || "Convidado",
		tags: ["CAFE CURSOR", "CURITIBA"] as const,
		location: "Curitiba, PR",
		activatedAt: "Jan 27, 2026",
	};

	return (
		<div className="relative h-screen ">
			<div className="fixed h-screen w-screen">
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
			</div>

			<main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 overflow-y-auto">
				<div className="w-full max-w-3xl mx-auto text-center">
					<SiteHeader className="mb-6" />

					<h1 className="animate-fade-up delay-100 text-4xl sm:text-6xl font-bold tracking-tight">
						Sua badge
					</h1>

					<p className="animate-fade-up delay-200 mt-4 text-base sm:text-lg text-muted-foreground">
						Grave sua badge e marque presença no Cafe Cursor Curitiba!
					</p>

					{/* Fixed-size container to prevent layout shift */}
					<div className="animate-scale-in delay-300 mt-10 mx-auto w-full max-w-sm min-h-[480px] flex items-center justify-center">
						{submitted ? (
							<BadgeCard
								{...badgeConfig}
								background={<Background key={backgroundKey} config={backgroundConfig.config} />}
								className="animate-fade-up w-full"
								cta={
									<Button
										variant="secondary"
										onClick={swapBadgeBackground}
									>
										Trocar estilo
									</Button>
								}
							/>
						) : (
							<Card className="border-border/50 bg-transparent rounded-4xl backdrop-blur-xl w-full">
								<CardHeader>
									<CardTitle className="text-left">Seu e-mail</CardTitle>
									<CardDescription className="text-left">
										Usamos apenas para confirmar sua presença.
									</CardDescription>
								</CardHeader>

								<CardContent>
									<form
										className="space-y-4"
										onSubmit={async (e) => {
											e.preventDefault();
											setError(null);
											setIsLoading(true);

											try {
												const response = await fetch("/Cafe Cursor Curitiba - Guests - 2026-01-27-13-20-21.csv");
												const csvText = await response.text();

												const lines = csvText.split("\n");
												const headers = lines[0].split(",");

												const emailIndex = headers.indexOf("email");
												const nameIndex = headers.indexOf("name");
												const firstNameIndex = headers.indexOf("first_name");
												const lastNameIndex = headers.indexOf("last_name");
												const apiIdIndex = headers.indexOf("api_id");

												const normalizedEmail = email.toLowerCase().trim();

												for (let i = 1; i < lines.length; i++) {
													const line = lines[i];
													if (!line.trim()) continue;

													// Simple CSV parsing (handles basic cases)
													const values = line.split(",");
													const rowEmail = values[emailIndex]?.toLowerCase().trim();

													if (rowEmail === normalizedEmail) {
														setGuest({
															name: values[nameIndex] || "",
															first_name: values[firstNameIndex] || "",
															last_name: values[lastNameIndex] || "",
															email: values[emailIndex] || "",
															api_id: values[apiIdIndex] || "",
														});
														setSubmitted(true);
														setIsLoading(false);
														return;
													}
												}

												setError("E-mail não encontrado na lista de convidados.");
											} catch (err) {
												setError("Erro ao verificar e-mail. Tente novamente.");
												console.error(err);
											} finally {
												setIsLoading(false);
											}
										}}
									>
										<div className="space-y-2 text-left">
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
												onChange={(e) => {
													setEmail(e.target.value);
													setError(null);
												}}
												className="w-full rounded-md border border-border/50 bg-background/40 px-4 py-2.5 text-sm text-foreground shadow-xs backdrop-blur-md placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
											/>
											{error && (
												<p className="text-sm text-red-500 mt-1">{error}</p>
											)}
										</div>

										<Button
											type="submit"
											size="lg"
											className="w-full"
											disabled={isLoading || !email}
										>
											{isLoading ? "Verificando..." : "Confirmar email"}
										</Button>
									</form>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</main>

		</div>
	);
}
