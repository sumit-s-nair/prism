import { AuditIssue } from '../types';

// Parse hex color to RGB
function hexToRgb(hex: string): [number, number, number] | null {
	const clean = hex.replace('#', '');
	if (clean.length !== 3 && clean.length !== 6) return null;

	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;

	const num = parseInt(full, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Calculate relative luminance per WCAG 2.1
function luminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio per WCAG 2.1
function contrastRatio(l1: number, l2: number): number {
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrast(rewriter: HTMLRewriter, issues: AuditIssue[]): void {
	rewriter.on('[style]', {
		element(el) {
			const style = el.getAttribute('style') ?? '';

			const colorMatch = style.match(/(?<![a-z-])color\s*:\s*(#[0-9a-fA-F]{3,6})/);
			const bgMatch = style.match(/background-color\s*:\s*(#[0-9a-fA-F]{3,6})/);

			if (!colorMatch || !bgMatch) return;

			const fg = hexToRgb(colorMatch[1]);
			const bg = hexToRgb(bgMatch[1]);

			if (!fg || !bg) return;

			const ratio = contrastRatio(luminance(...fg), luminance(...bg));

			if (ratio < 4.5) {
				issues.push({
					type: 'low-contrast',
					severity: ratio < 3 ? 'critical' : 'serious',
					element: `<${el.tagName} style="${style}">`,
					message: `Contrast ratio is ${ratio.toFixed(2)}:1, below the WCAG AA minimum of 4.5:1 for normal text.`,
				});
			}
		},
	});
}
