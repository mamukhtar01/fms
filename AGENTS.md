<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ant Design 6 — no deprecated APIs

This project uses **antd ^6.x**. Many props were renamed or removed from antd 5.x → 6.x. Always use the v6 API. Never use the props in the left column below.

| Component | Removed / deprecated prop | Use instead |
|-----------|--------------------------|-------------|
| `Space` | `direction="vertical"` / `direction="horizontal"` | `orientation="vertical"` / `orientation="horizontal"` |
| `Alert` | `message="…"` (title slot) | `description="…"` (or a React element child) |
| `Typography.Link` | Wrapping inside Next.js `<Link>` | Use Next.js `<Link style={{ color: "#1677ff" }}>text</Link>` directly — both render `<a>`, nesting them is invalid HTML |
| Any component | Wrapping `<Link>` around any Ant Design element that itself renders an `<a>` | Put the `href` on the outer element only; style with `color: "#1677ff"` |

When in doubt, grep the antd 6 source in `node_modules/antd/` or look for TypeScript `@deprecated` hints (TS code 6385) in IDE diagnostics before writing component props.
