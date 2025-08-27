# Github-QOL

CLI to list GitHub accounts you follow that don't follow you back.

## Usage

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run with a username (without a token):

   ```bash
   node scripts/github.mjs --username <your_username>
   ```

   Or use a token to avoid rate limits and auto-detect your username:

   ```bash
   # Windows PowerShell
   setx GITHUB_TOKEN "ghp_xxx"  # set environment variable persistently
   $env:GITHUB_TOKEN = "ghp_xxx" # or only for the current session
   node scripts/github.mjs
   ```

3. JSON output (optional):

   ```bash
   node scripts/github.mjs -j --username <your_username>
   ```

## Options

- **-u, --username**: GitHub username (required if no token)
- **-t, --token**: GitHub Personal Access Token (or set `GITHUB_TOKEN`)
- **-j, --json**: Output JSON
- **-h, --help**: Help

## Notes

- Requires Node.js v18+.
- Without a token, you'll hit GitHub public API rate limits. A PAT is recommended (no special scopes needed for public data).

## Overview

This project is a small CLI tool that helps you clean up your GitHub following list. It fetches your "following" and "followers" lists from the GitHub REST API, then prints the accounts you follow who do not follow you back.

### What problem does it solve?

- Quickly identify non-mutual follows.
- Export results in JSON for further processing.
- Avoid manual scrolling through profile pages.

## How it works

- The script is located at `scripts/github.mjs`.
- It calls the GitHub REST API endpoints:
  - `GET /users/{username}/following`
  - `GET /users/{username}/followers`
- It automatically paginates using the `Link` header until all pages are retrieved.
- It normalizes usernames to lowercase and computes a simple set difference: `following - followers`.
- If you provide a token (or `GITHUB_TOKEN`), it includes an `Authorization: Bearer <token>` header to raise rate limits and optionally auto-detect your username via `GET /user`.

## Authentication & security

- You can run the tool without a token, but a Personal Access Token (PAT) is recommended to avoid rate limits.
- The tool does not store your token anywhere; it only reads it from the environment or the `--token` flag at runtime.
- For public data, no special scopes are required. A classic token with default public scopes is enough.

## Rate limits & limitations

- Without a token, GitHub API rate limits are very strict and you may see HTTP 403 errors after a few requests.
- With a token, you typically get a significantly higher limit suitable for personal use.
- If an account is blocked, suspended, or otherwise restricted, API responses may omit or hide it.
- The tool reads public profile relationships. It won't access any private data.

## Troubleshooting

- 401 Unauthorized: Your token is invalid or expired. Create a new PAT and try again.
- 403 Forbidden with rate-limit headers: You hit the rate limit. Wait for the reset time or use a token.
- 404 Not Found: The username doesn't exist or there's a temporary API issue. Double-check the username.
- Empty results but you expect more: Re-run with a token to ensure pagination isn't limited by anonymous rate limits.

## Examples

### Windows PowerShell

```powershell
# One-off run without token:
node scripts/github.mjs --username yourname

# Use a token for this session only:
$env:GITHUB_TOKEN = "ghp_xxx"
node scripts/github.mjs

# JSON output
node scripts/github.mjs -j --username yourname
```

### macOS/Linux (bash/zsh)

```bash
# One-off run without token:
node scripts/github.mjs --username yourname

# Use a token for this session only:
GITHUB_TOKEN=ghp_xxx node scripts/github.mjs

# JSON output
node scripts/github.mjs -j --username yourname
```

## Contributing

Issues and pull requests are welcome. If you have ideas for features (e.g., exporting CSV, ignoring specific users, or marking verified/org accounts), feel free to propose them.
