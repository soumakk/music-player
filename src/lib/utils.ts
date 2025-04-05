import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function convertTimeToString(time: number) {
	const minutes = Math.floor(time / 60)
	const seconds = Math.floor(time % 60)
	const minStr = minutes?.toString().padStart(2, '0')
	const secStr = seconds?.toString().padStart(2, '0')
	return `${minStr}:${secStr}`
}
