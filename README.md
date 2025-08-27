# Social-QOL

CLI tools for social media quality-of-life improvements.  
Helps you analyze and manage your following lists across different platforms.

## Supported Platforms

- **GitHub** → List accounts you follow that don’t follow you back.  
- **Instagram** → List accounts you follow that don’t follow you back, with filters such as accounts under 1k followers.  

## Usage

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run one of the tools:

Github:
```bash
   node scripts/github.mjs --username <your_username>
```

Instagram:
```bash
   node scripts/instagram.mjs -u <ig_username> -p <ig_password>
```

### GitHub
Check non-followers on GitHub using username or token.

### Instagram
Check non-followers on Instagram with optional filters.

## Options

Each platform has its own set of options. Common examples:

- **-u, --username**: Account username  
- **-p, --password**: Account password (Instagram only)  
- **-t, --token**: Token (GitHub only)  
- **-j, --json**: Output results in JSON format  
- **-h, --help**: Show help  

## Notes

- Requires Node.js v18+.  
- Tokens/sessions are only read at runtime and never stored permanently.  
- For Instagram, sessions are cached locally to reduce login prompts.  
- Use responsibly to avoid API rate limits or temporary account restrictions.  

## Overview

This project is a small set of CLI tools designed to make social media management easier.  
It fetches your following and followers list from supported platforms and highlights non-mutual connections.

### Problems it solves

- Quickly identify non-mutual follows.  
- Filter results (e.g., only small accounts).  
- Export data in JSON for further processing.  
- Avoid manual scrolling through follower lists.  

## Roadmap

- Add support for Twitter/X.  
- Export results to CSV.  
- Custom ignore lists and filters (e.g., verified accounts, organizations).  

## Contributing

Issues and pull requests are welcome. If you have ideas for features or additional platforms, feel free to propose them.
