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
	title: "Badge Station — Claim your event badge",
	description:
		"Scan a QR code to claim an animated event badge. Customize it, reroll styles, and export a shareable video.",
	icons: {
		icon: [{ url: "/favicon.ico" }],
	},
	openGraph: {
		title: "Badge Station — Claim your event badge",
		description:
			"Scan a QR code to claim an animated event badge. Customize it, reroll styles, and export a shareable video.",
		type: "website",
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
