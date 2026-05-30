import { AuditIssue, AuditResult } from './types';
import { checkAltText } from './checks/alt-text';
import { checkHeadings } from './checks/headings';
import { checkAria } from './checks/aria';
import { checkContrast } from './checks/contrast';

function calculateScore(issues: AuditIssue[]): number {
	if (issues.length === 0) return 100;

	const penalty = issues.reduce((total, issue) => {
		switch (issue.severity) {
			case 'critical':
				return total + 15;
			case 'serious':
				return total + 10;
			case 'moderate':
				return total + 5;
			case 'minor':
				return total + 2;
			default:
				return total;
		}
	}, 0);

	return Math.max(0, 100 - penalty);
}

export async function auditUrl(url: string, mode: 'on-demand' | 'proxy'): Promise<AuditResult> {
	const response = await fetch(url, {
		headers: {
			'User-Agent': 'Prism-Accessibility-Auditor/1.0',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}

	const issues: AuditIssue[] = [];
	const rewriter = new HTMLRewriter();

	checkAltText(rewriter, issues);
	checkHeadings(rewriter, issues);
	checkAria(rewriter, issues);
	checkContrast(rewriter, issues);

	await rewriter.transform(response).text();

	const score = calculateScore(issues);

	return {
		url,
		score,
		totalIssues: issues.length,
		issues,
		mode,
		createdAt: Date.now(),
	};
}
