import { AuditIssue } from "../types";

export function checkAltText(rewriter: HTMLRewriter, issues: AuditIssue[]): void {
    rewriter.on("img", {
        element(el) {
            const alt = el.getAttribute("alt");
            const src = el.getAttribute("src") ?? "unknown";

            if (alt === null) {
                issues.push({
                    type: "missing-alt-text",
                    severity: "critical",
                    element: `<img src="${src}">`,
                    message: `Image is missing an alt attribute entirely.`,
                });
            } else if (alt.trim() === "") {
                issues.push({
                    type: "empty-alt-text",
                    severity: "serious",
                    element: `<img src="${src}">`,
                    message: `Image has an empty alt attribute. Use a descriptive alt or alt="" only for decorative images.`,
                });
            }
        },
    });
}