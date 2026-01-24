"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { PaperHalftone } from "@/components/paper-halftone";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { GrainGradient } from "@paper-design/shaders-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreditosPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const emailTrimmed = email.trim();
	const isEmailValid = useMemo(
		() => EMAIL_RE.test(emailTrimmed),
		[emailTrimmed]
	);

	const panelBase =
		"overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]";
	const panelShown = "max-h-[520px] opacity-100 translate-y-0 scale-100";
	const panelHidden =
		"max-h-0 opacity-0 -translate-y-2 scale-[0.985] pointer-events-none";

	return (
		<div className="relative h-screen overflow-y-hidden">
			<GrainGradient
				width={window.innerWidth}
				height={window.innerHeight}
				colors={["#7300ff", "#eba8ff", "#00bfff", "#2b00ff"]}
				colorBack="#000000"
				softness={0.8}
				intensity={0.6}
				noise={0.35}
				shape="corners"
				speed={0.5}
				className="absolute inset-0 -z-10 overflow-hidden opacity-50"
			/>



			<main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
				<div className="w-full max-w-3xl mx-auto text-center">
					<SiteHeader className="mb-6" />

					<h1 className="animate-fade-up delay-100 text-4xl sm:text-6xl font-bold tracking-tight">
						Créditos
					</h1>

					<p className="animate-fade-up delay-200 mt-4 text-base sm:text-lg text-muted-foreground">
						Confirme seu e-mail para receber os créditos do evento.
					</p>

					<div className="animate-scale-in delay-300 mt-10 mx-auto w-full max-w-lg text-left">
						<div className="relative">
							<div
								data-state={submitted ? "hidden" : "shown"}
								className={[
									panelBase,
									submitted ? panelHidden : panelShown,
								].join(" ")}
							>
								<Card className="border-border/50 bg-transparent">
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
												if (!isEmailValid) return;
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
												disabled={!isEmailValid}
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
									panelBase,
									submitted ? panelShown : panelHidden,
								].join(" ")}
							>
								<Card className="border-border/50 bg-transparent">
									<CardHeader className="space-y-2">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="size-5 text-primary" />
											<CardTitle>Obrigado!</CardTitle>
										</div>
										<CardDescription>
											Recebemos seu email. Em breve você receberá a confirmação.
										</CardDescription>
									</CardHeader>

									<CardContent className="pt-0">
										<Button asChild variant="secondary" className="w-full">
											<Link href="/">Voltar para Home</Link>
										</Button>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

