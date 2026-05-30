import { AuditIssue } from "../types";

export function checkHeadings(rewriter: HTMLRewriter, issues: AuditIssue[]): void {
    const headingLevels: number[] = [];

    rewriter.on("h1, h2, h3, h4, h5, h6", {
        element(el) {
            const level = parseInt(el.tagName.replace("h", ""));
            headingLevels.push(level);

            if (headingLevels.length === 1 && level !== 1) {
                issues.push({
                    type: "missing-h1",
                    severity: "serious",
                    element: `<${el.tagName}>`,
                    message: `Page does not start with an h1. First heading found is h${level}.`,
                });
            }

            if (headingLevels.length > 1) {
                const prev = headingLevels[headingLevels.length - 2];
                if (level > prev + 1) {
                    issues.push({
                        type: "skipped-heading-level",
                        severity: "moderate",
                        element: `<${el.tagName}>`,
                        message: `Heading level skipped from h${prev} to h${level}. This breaks document outline structure.`,
                    });
                }
            }
        },
    });
}