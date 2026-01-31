import { VerticalCarousel } from "./vertical-carousel";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { DitheringSectionBg } from "./dithering-section-bg";
import { Button } from "./ui/button";

export function ThankSection() {
	return (
		<section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
			{/* Dithering background */}
			<DitheringSectionBg
				shape="warp"
				type="2x2"
				colorBack="#222222"
				colorFront="#f2f1e8"
				size={2}
				speed={0.12}
				scale={0.7}
				opacity={0.25}
			/>

			{/* Left column: Title + Content */}
			<div className="relative z-10 w-full flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
				{/* Title */}
				<h2 className="animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
					<span className="text-foreground">O evento foi </span>
					<span className="text-primary">incrível</span>
					<span className="text-foreground">, graças a todos vocês!</span>
				</h2>

				{/* Text content */}
				<div className="space-y-6">
					<Card className="animate-fade-up delay-200 border-border/50 bg-card/50">
						<CardContent className="py-6 sm:py-8">
							<p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
								Com mais de <span className="text-foreground font-semibold">150 inscrições</span>, diversos desenvolvedores, designers e project managers, estamos criando uma comunidade multi-modal, diversa e engajada!
							</p>
						</CardContent>
					</Card>

					<Separator className="animate-fade-in delay-400 my-6 bg-border/30" />

					<Card>
						<CardContent className="gap-5 flex flex-col items-center justify-center">
							<p className="animate-fade-up delay-500 text-base sm:text-lg text-foreground leading-relaxed">
								Aqui, podem links para adicionar as fotos que tiraram, gerar a sua badge e certificado de participação e se conectar com outros participantes.
							</p>

							<div className="flex flex-row items-center justify-center gap-4">
								<Button
									variant="default"
								>
									Sua badge e certificado de participação
								</Button>
								<Button
									variant="secondary"
								>
									Adicionar suas fotos
								</Button>
								<Button
									variant="default"
								>
									Entrar no grupo do WhatsApp
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Right column: Full-height Carousel */}
			<div className="relative z-10 w-full md:w-1/2 h-screen  top-0">
				<div className="animate-scale-in delay-400 h-full">
					<VerticalCarousel
						className="h-full"
						images={[
							{
								src: "/Images/IMG_2885.jpg",
								alt: "Foto 1",
							},
							{
								src: "/Images/IMG_2924.jpg",
								alt: "Foto 3",
							},
							{
								src: "/Images/IMG_3020.jpg",
								alt: "Foto 4",
							},
							{
								src: "/Images/IMG_3039.jpg",
								alt: "Foto 5",
							},
							{
								src: "/Images/IMG_3099.jpg",
								alt: "Foto 6",
							},
						]}
					/>
				</div>
			</div>
		</section>
	);
}
