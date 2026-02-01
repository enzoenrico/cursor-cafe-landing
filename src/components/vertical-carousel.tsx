"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CarouselImage {
	src: string;
	alt: string;
}

interface VerticalCarouselProps {
	images?: CarouselImage[];
	autoScrollSpeed?: number; // ms per image transition
	className?: string;
}

// Default placeholder images using picsum.photos
const defaultImages: CarouselImage[] = Array.from({ length: 8 }, (_, i) => ({
	src: `https://picsum.photos/seed/${i + 1}/400/300`,
	alt: `Placeholder image ${i + 1}`,
}));

export function VerticalCarousel({
	images = defaultImages,
	autoScrollSpeed = 3000,
	className,
}: VerticalCarouselProps) {
	const imageHeight = 200; // Base height for each image slot
	const totalHeight = images.length * imageHeight;

	// Start in the "middle" of the duplicated array so images appear above and below
	const [scrollPosition, setScrollPosition] = useState(totalHeight);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const lastTimeRef = useRef<number>(0);
	const animationRef = useRef<number>(0);

	// Calculate which image is currently "active" based on scroll position
	const scrollActiveIndex = Math.floor(scrollPosition / imageHeight) % images.length;

	// Effective active is hovered image or scroll-determined active
	const effectiveActive = hoveredIndex ?? scrollActiveIndex;

	// Get style properties based on distance from active image
	const getImageStyles = useCallback(
		(index: number) => {
			// Calculate circular distance (for infinite loop effect)
			const distance = Math.abs(index - effectiveActive);
			const circularDistance = Math.min(distance, images.length - distance);

			let scale: number;
			let opacity: number;

			switch (circularDistance) {
				case 0:
					scale = 1;
					opacity = 1;
					break;
				case 1:
					scale = 0.85;
					opacity = 0.7;
					break;
				case 2:
					scale = 0.7;
					opacity = 0.4;
					break;
				default:
					scale = 0.6;
					opacity = 0.2;
					break;
			}

			return {
				transform: `scale(${scale})`,
				opacity,
				transition: "transform 300ms ease-out, opacity 300ms ease-out",
			};
		},
		[effectiveActive, images.length]
	);

	// Auto-scroll animation loop
	useEffect(() => {
		const animate = (currentTime: number) => {
			if (lastTimeRef.current === 0) {
				lastTimeRef.current = currentTime;
			}

			const deltaTime = currentTime - lastTimeRef.current;
			lastTimeRef.current = currentTime;

			// Calculate scroll increment based on speed
			// Move one image height over autoScrollSpeed ms
			const scrollIncrement = (imageHeight / autoScrollSpeed) * deltaTime;

			setScrollPosition((prev) => {
				const newPosition = prev + scrollIncrement;
				// Seamless wrap: when exceeding 2x total, wrap back to 1x (staying in middle copy)
				if (newPosition >= totalHeight * 2) {
					return newPosition - totalHeight;
				}
				return newPosition;
			});

			animationRef.current = requestAnimationFrame(animate);
		};

		animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [autoScrollSpeed, totalHeight, imageHeight]);

	// Duplicate images for seamless infinite scroll effect
	const displayImages = [...images, ...images, ...images];

	// Calculate the offset to center the active image area
	const scrollOffset = -scrollPosition + imageHeight * 2;

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative h-full w-full max-w-md overflow-hidden",
				className
			)}
		>

			{/* Scrolling container */}
			<div
				className="absolute inset-x-0 flex flex-col items-center"
				style={{
					transform: `translateY(${scrollOffset}px)`,
				}}
			>
				{displayImages.map((image, displayIndex) => {
					// Map displayIndex back to original image index
					const originalIndex = displayIndex % images.length;

					return (
						<div
							key={`${originalIndex}-${displayIndex}`}
							className="flex h-[200px] w-full shrink-0 items-center justify-center px-4"
							onMouseEnter={() => setHoveredIndex(originalIndex)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							<div
								className="relative h-full w-full cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg transition-all duration-300"
								style={getImageStyles(originalIndex)}
							>
								<Image
									src={image.src}
									alt={image.alt}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 400px"
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
