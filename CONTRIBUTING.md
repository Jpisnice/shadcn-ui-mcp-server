# Contributing to Shadcn UI MCP Server

Thank you for your interest in contributing! 🎉

We welcome contributions of all kinds—bug reports, feature requests, code, tests, and documentation. Please read these guidelines to help us maintain a collaborative and productive environment.

---

## 📚 Table of Contents
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

---

## How to Contribute

### 1. Reporting Issues
- Use [GitHub Issues](https://github.com/Jpisnice/shadcn-ui-mcp-server/issues) for bugs, feature requests, or questions.
- Please include:
  - A clear, descriptive title
  - Steps to reproduce (for bugs)
  - Expected and actual behavior
  - Screenshots or logs if helpful

### 2. Suggesting Enhancements
- Open an issue describing your idea and why it would be useful.
- Be open to discussion and feedback.

### 3. Submitting Pull Requests
1. **Fork the repository** and clone your fork.
2. **Create a new branch** for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and add tests if applicable.
4. **Run tests** to ensure nothing is broken.
5. **Commit with a clear message** (see below).
6. **Push your branch** and open a Pull Request (PR) against `main`.
7. **Describe your changes** in the PR and reference any related issues.
8. Be responsive to feedback and update your PR as needed.

---

## Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Build the project**
   ```bash
   npm run build
   ```
3. **Run tests**
   ```bash
   npm test
   ```
4. **Start the dev server** (Streamable HTTP, restarts on save)
   ```bash
   npm run dev
   ```
   This runs `src/` directly with `tsx watch` and serves MCP at
   `http://127.0.0.1:7423/mcp`, bound to localhost only. It runs with
   `--protocol modern`, so only the 2026-07-28 handshake is accepted: set your
   client's protocol era (e.g. in the Inspector) to **Modern**. The published
   default (`--protocol any`) also serves 2025-era clients; if your client
   can't speak 2026-07-28 yet, run `npm run dev -- --protocol any`. Because the protocol
   is stateless, connected clients keep working across restarts with no
   reconnect. `tsx` does not type-check, so run `npm run typecheck` (or
   `npm run dev:watch` in a second terminal) to catch type errors.

5. **Connect a client to the dev server**
   ```bash
   # Claude Code (local scope: only you, only this repo, not committed)
   claude mcp add --transport http --scope local shadcn-ui-dev http://127.0.0.1:7423/mcp

   # MCP Inspector: choose "Streamable HTTP" and enter the URL above
   npx @modelcontextprotocol/inspector
   ```
   Don't point the committed `.mcp.json` at localhost. It ships with the
   Codex plugin and must keep referencing the published package.

   To test the stdio transport instead, use `npm run dev:stdio`.

---

## Coding Standards
- Use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) for formatting and linting.
- Write clear, concise comments and documentation.
- Keep functions and files focused and modular.
- Add or update tests for new features or bug fixes.
- Use TypeScript best practices.

---

## Commit Messages
- Use clear, descriptive commit messages.
- Recommended format:
  - `Fix: short description of the fix`
  - `Add: new feature description`
  - `Update: what was updated`
  - `Refactor: what was refactored`
  - `Docs: documentation changes`
- Reference issues or PRs when relevant (e.g., `Fixes #123`).

---

## Code of Conduct

We are committed to a welcoming and inclusive environment. Please be respectful, constructive, and supportive. Harassment or discrimination of any kind will not be tolerated.

For details, see the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for helping make this project better! 🙏 