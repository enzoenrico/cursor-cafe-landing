import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/branding";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: `${BRAND.namePt} — Curitiba, ${BRAND.eventDateLabel}`,
	description: `Participe do ${BRAND.namePt} em Curitiba, Paraná! Um encontro da comunidade Cursor no Manana Cafés Bigorrilho.`,
	icons: {
		icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
	},
	openGraph: {
		title: `${BRAND.namePt} — Curitiba`,
		description: `Participe do ${BRAND.namePt} em Curitiba, Paraná! Um encontro da comunidade Cursor no Manana Cafés Bigorrilho.`,
		type: "website",
		locale: "pt_BR",
	},
	twitter: {
		card: "summary_large_image",
		title: `${BRAND.namePt} — Curitiba`,
		description: `Participe do ${BRAND.namePt} em Curitiba, Paraná! Um encontro da comunidade Cursor.`,
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
