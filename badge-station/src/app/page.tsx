import { PageShell } from "@/components/page-shell";
import { BRAND } from "@/lib/branding";

export default function HomePage() {
	return (
		<PageShell className="overflow-hidden">
			<main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
				<p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
					{BRAND.nameEn}
				</p>
				<h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
					{BRAND.namePt}
				</h1>
				<p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
					Escaneie um QR code, receba sua badge animada, personalize o nome e o
					estilo e compartilhe um vídeo da badge ao vivo.
				</p>
				<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
					<a
						href="/host"
						className="relative z-20 inline-flex h-11 min-w-[14rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Abrir estação com QR
					</a>
					<a
						href="/raffle"
						className="relative z-20 inline-flex h-11 min-w-[14rem] items-center justify-center rounded-md border border-white/15 bg-black/30 px-6 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
					>
						Abrir sorteio Luma
					</a>
				</div>
			</main>
		</PageShell>
	);
}
