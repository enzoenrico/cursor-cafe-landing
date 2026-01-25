
type AbstractShape = "blob" | "corners" | "sphere" | "ripple" | "dots" | "truchet" | "wave" | undefined

export function getRandomColors(n: number): string[] {
	const colors = [];
	for (let i = 0; i < n; i++) {
		colors.push(getRandomColor());
	}
	return colors;
}

function getRandomColor(): string {
	return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}


export function getRandomSpeed(): number {
	return Math.random() * 2 - 1;
}

export function getRandomShape(): AbstractShape {
	const shapes: AbstractShape[] = ["corners", "blob", "sphere", "ripple", "dots", "truchet", "wave"];
	const selected = shapes[Math.floor(Math.random() * shapes.length)]
	console.log(selected);
	return selected;
}