import { AuditIssue } from "../types";

export function checkAria(rewriter: HTMLRewriter, issues: AuditIssue[]): void {
    // Check buttons have accessible labels
    rewriter.on("button", {
        element(el) {
            const ariaLabel = el.getAttribute("aria-label");
            const ariaLabelledBy = el.getAttribute("aria-labelledby");

            if (!ariaLabel && !ariaLabelledBy) {
                issues.push({
                    type: "button-missing-label",
                    severity: "critical",
                    element: `<button>`,
                    message: `Button has no aria-label or aria-labelledby. Screen readers cannot identify its purpose.`,
                });
            }
        },
    });

    // Check inputs have labels
    rewriter.on("input", {
        element(el) {
            const type = el.getAttribute("type") ?? "text";
            const ariaLabel = el.getAttribute("aria-label");
            const ariaLabelledBy = el.getAttribute("aria-labelledby");
            const id = el.getAttribute("id");

            if (
                type !== "hidden" &&
                type !== "submit" &&
                type !== "button" &&
                !ariaLabel &&
                !ariaLabelledBy &&
                !id
            ) {
                issues.push({
                    type: "input-missing-label",
                    severity: "critical",
                    element: `<input type="${type}">`,
                    message: `Input field has no associated label, aria-label, or aria-labelledby.`,
                });
            }
        },
    });

    // Check links have descriptive text
    rewriter.on("a", {
        element(el) {
            const ariaLabel = el.getAttribute("aria-label");
            const href = el.getAttribute("href") ?? "#";

            if (!ariaLabel) {
                issues.push({
                    type: "link-missing-label",
                    severity: "serious",
                    element: `<a href="${href}">`,
                    message: `Link has no aria-label. Ensure link text is descriptive enough for screen readers.`,
                });
            }
        },
    });
}