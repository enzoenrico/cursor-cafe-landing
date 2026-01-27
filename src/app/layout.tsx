import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
	title: "Cursor Cafe — Curitiba, Jan 30 2026",
	description:
		"Join us at Cafe Cursor in Curitiba, Paraná! A community meetup for Cursor enthusiasts at Manana Café Bigorrilho.",
	icons: {
		icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
	},
	openGraph: {
		title: "Cursor Cafe — Curitiba, Jan 30 2026",
		description:
			"Join us at Cafe Cursor in Curitiba, Paraná! A community meetup for Cursor enthusiasts at Manana Café Bigorrilho.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Cursor Cafe — Curitiba, Jan 30 2026",
		description:
			"Join us at Cafe Cursor in Curitiba, Paraná! A community meetup for Cursor enthusiasts.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
