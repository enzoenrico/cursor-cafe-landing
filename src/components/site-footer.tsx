import Link from "next/link";
import { MapPin, Calendar, MessageCircle, ExternalLink, MessageSquarePlus, BadgeIcon } from "lucide-react";

export function SiteFooter() {
	return (
		<footer className="bg-black text-white">
			<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				{/* Main Content */}
				<div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
					{/* Event Info - Large Column */}
					<div className="lg:col-span-2">
						<h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
							Cursor Além do Código
						</h2>
						<p className="text-sm tracking-[0.2em] text-white/50 uppercase mb-3">
							Cursor Beyond Coding
						</p>
						<p className="text-lg sm:text-xl text-white/80 mb-6 leading-relaxed">
							Comunidade de desenvolvedores, designers e project managers em Curitiba, Paraná.
						</p>
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<MapPin className="size-5 mt-0.5 shrink-0" />
								<div>
									<p className="font-bold text-white">Manana Cafés - Bigorrilho</p>
									<Link
										href="https://www.google.com/maps?client=safari&rls=en&oe=UTF-8&um=1&ie=UTF-8&fb=1&gl=br&sa=X&geocode=KRNL6fwo49yUMdSjb6X_gFwK&daddr=R.+Des.+Otávio+do+Amaral,+67+-+Bigorrilho,+Curitiba+-+PR,+80730-400"
										target="_blank"
										rel="noopener noreferrer"
										className="text-white/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors underline underline-offset-4"
									>
										R. Des. Otávio do Amaral, 67 - Bigorrilho, Curitiba - PR
									</Link>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Calendar className="size-5 mt-0.5 shrink-0" />
								<p className="font-bold text-white">30 de Janeiro de 2026</p>
							</div>
						</div>
					</div>

					{/* Links Column */}
					<div>
						<h3 className="text-xl font-black mb-4 tracking-tight">Links</h3>
						<nav className="space-y-3" aria-label="Footer navigation">
							<Link
								href="/badge"
								className="flex items-center gap-2 text-white/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors font-medium"
							>
								<BadgeIcon className="size-4" />
								Badge e certificado
							</Link>
							<Link
								href="/raffle"
								className="flex items-center gap-2 text-white/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors font-medium"
							>
								Sorteio Luma
							</Link>
							<a
								href="https://cursor.com"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-white/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors font-medium"
							>
								<ExternalLink className="size-4" />
								cursor.com
							</a>
							<a
								href="https://forms.gle/iKovWxB932UN8YTB9"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-white/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors font-medium"
							>
								<MessageSquarePlus className="size-4" />
								Deixe seu feedback
							</a>
						</nav>
					</div>

					{/* Contact Column */}
					<div>
						<h3 className="text-xl font-black mb-4 tracking-tight">Contato</h3>
						<nav className="space-y-3" aria-label="Contact links">
							<a
								href="https://chat.whatsapp.com/I9YhGre6aoC9Wt6ZOFz1qt"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-white/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors font-medium"
							>
								<MessageCircle className="size-4" />
								Grupo WhatsApp
							</a>
						</nav>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 pt-8 border-t border-white/10">
					<p className="text-sm text-white/60 text-center">
						© 2026 Cursor Além do Código · Curitiba. Todos os direitos reservados.
					</p>
				</div>
			</div>
		</footer>
	);
}
