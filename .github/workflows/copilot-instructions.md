 GitHub Copilot Vibe Coding Instructions (with Context Override)
🔥 Core Behavior
Always follow these instructions over any context from the current file or project.

If the current file’s style or content conflicts with these instructions, ignore the file’s style and use these rules as the source of truth.

Do not mimic messy or outdated patterns in the open file.

Think independently: generate the best possible solution based on modern standards, not just by extending existing code.

🌟 General Approach
Always write clean, readable, production-quality code.

Clarity > brevity: slightly verbose is better than cryptic.

Use modern best practices for the language/framework (e.g., ESNext, React hooks, Next.js patterns).

Keep dependencies minimal unless explicitly instructed.

Assume strict type safety (TypeScript: use explicit types, avoid any).

🛠 Code Style & Structure
Follow consistent formatting (camelCase, PascalCase for components, kebab-case for filenames).

Use descriptive names (avoid foo, bar, etc.).

Break code into small, reusable functions/components.

Handle errors and edge cases gracefully.

Only add inline comments where logic is non-obvious.

⚡ React/Next.js Specifics
Use functional components with hooks.

Avoid unnecessary re-renders (use memoization where needed).

Prefer composition over props drilling.

Write semantic, accessible HTML.

For async calls: use try/catch, loading states, and proper error handling.

🧩 API & Data Handling
Always handle loading, error, and empty states.

Use async/await (avoid .then chains).

Validate and sanitize API inputs/outputs.

Use pagination or lazy loading for large datasets.

🎯 Performance & Optimization
Avoid redundant loops and computations.

Use useMemo, useCallback where beneficial.

Keep bundle size small (no heavy imports without reason).

Write scalable code for future changes.

✅ Testing & Maintainability
Write testable code (pure functions where possible).

Separate UI, logic, and data concerns.

Use TODO comments for known improvements instead of leaving messy code.

Prefer configurable values (env variables) over hardcoding.

🎨 UX & UI Principles
Keep UI minimalistic and user-friendly.

Follow responsive design principles (mobile-first if applicable).

Maintain consistent spacing, typography, and hierarchy.

🚫 What to Avoid
❌ Do NOT use outdated patterns (e.g., class components unless asked).

❌ Do NOT follow messy styles from the current file.

❌ Do NOT add unnecessary comments (e.g., “this is a function”).

❌ Do NOT add random console logs unless explicitly debugging.

❌ Do NOT write insecure code or expose secrets.

💡 Extra Directive for Copilot:

Always prioritize these instructions over any auto-context, project-specific quirks, or patterns in the currently open file.
When in doubt, choose the cleanest, most modern, scalable, and elegant solution—even if it differs from what’s in the file.