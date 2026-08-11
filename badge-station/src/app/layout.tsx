import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BRAND } from "@/lib/branding";

import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: `Estação de Badge — ${BRAND.namePt}`,
	description:
		"Escaneie um QR code para receber sua badge animada do evento. Personalize o nome, o estilo e exporte um vídeo para compartilhar.",
	icons: {
		icon: [{ url: "/favicon.ico" }],
	},
	openGraph: {
		title: `Estação de Badge — ${BRAND.namePt}`,
		description:
			"Escaneie um QR code para receber sua badge animada do evento. Personalize o nome, o estilo e exporte um vídeo para compartilhar.",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" className="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
