#!/usr/bin/env node
import minimist from 'minimist';
import fetch from 'node-fetch';

const GITHUB_API_BASE = 'https://api.github.com';

function assertNodeVersion() {
    const major = Number(process.versions.node.split('.')[0]);
    if (Number.isNaN(major) || major < 18) {
        console.error('This tool requires Node.js v18 or newer.');
        process.exit(1);
    }
}

function buildHeaders(token) {
    const headers = {
        'accept': 'application/vnd.github+json',
        'user-agent': 'github-qol-nonfollowers-cli'
    };
    if (token && token.trim().length > 0) {
        headers['authorization'] = `Bearer ${token}`;
    }
    return headers;
}

function parseLinkHeader(linkHeader) {
    if (!linkHeader) return {};
    return linkHeader.split(',').reduce((acc, part) => {
        const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
        if (match) acc[match[2]] = match[1];
        return acc;
    }, {});
}

async function fetchWithHandling(url, headers) {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        let message = `HTTP ${response.status} ${response.statusText}`;
        try {
            const data = await response.json();
            if (data && data.message) message += `: ${data.message}`;
        } catch { }
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        const rateLimitReset = response.headers.get('x-ratelimit-reset');
        if (response.status === 403 && rateLimitRemaining === '0') {
            const resetTs = rateLimitReset ? new Date(Number(rateLimitReset) * 1000) : null;
            message += resetTs ? ` (rate limit resets at ${resetTs.toLocaleString()})` : '';
        }
        throw new Error(message);
    }
    return response;
}

async function fetchPaginated(url, headers) {
    let results = [];
    let nextUrl = url;
    while (nextUrl) {
        const res = await fetchWithHandling(nextUrl, headers);
        const pageItems = await res.json();
        if (Array.isArray(pageItems)) results = results.concat(pageItems);
        const links = parseLinkHeader(res.headers.get('link'));
        nextUrl = links.next || null;
    }
    return results;
}

async function getAuthenticatedUser(headers) {
    const res = await fetchWithHandling(`${GITHUB_API_BASE}/user`, headers);
    return res.json();
}

async function getFollowingUsernames(username, headers) {
    const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/following?per_page=100`;
    const items = await fetchPaginated(url, headers);
    return items.map(u => u.login.toLowerCase());
}

async function getFollowersUsernames(username, headers) {
    const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/followers?per_page=100`;
    const items = await fetchPaginated(url, headers);
    return items.map(u => u.login.toLowerCase());
}

function computeNonFollowers(following, followers) {
    const followerSet = new Set(followers);
    return following.filter(login => !followerSet.has(login));
}

async function main() {
    assertNodeVersion();
    const args = minimist(process.argv.slice(2), {
        alias: { u: 'username', t: 'token', j: 'json', h: 'help' },
        boolean: ['json', 'help'],
        string: ['username', 'token']
    });

    if (args.help) {
        printHelp();
        process.exit(0);
    }

    const token = (args.token || process.env.GITHUB_TOKEN || '').trim();
    const headers = buildHeaders(token);

    let username = args.username;
    if (!username && token) {
        const me = await getAuthenticatedUser(headers);
        username = me.login;
    }
    if (!username) {
        console.error('Username is required. Provide with --username <name> or set GITHUB_TOKEN to infer your account.');
        printHelp();
        process.exit(1);
    }

    process.stderr.write(`Fetching followers data for @${username}...\n`);
    const [following, followers] = await Promise.all([
        getFollowingUsernames(username, headers),
        getFollowersUsernames(username, headers)
    ]);

    const nonFollowers = computeNonFollowers(following, followers);
    if (args.json) {
        const payload = {
            username,
            counts: { following: following.length, followers: followers.length, nonFollowers: nonFollowers.length },
            users: nonFollowers
        };
        console.log(JSON.stringify(payload, null, 2));
        return;
    }

    console.log(`Accounts you follow that don't follow back (${nonFollowers.length}):`);
    for (const login of nonFollowers) {
        console.log(`- ${login} https://github.com/${login}`);
    }
}

function printHelp() {
    console.log(`List GitHub accounts you follow who don't follow you back\n\n` +
        `Usage:\n` +
        `  node scripts/github.mjs --username <your_github_username>\n` +
        `  GITHUB_TOKEN=ghp_xxx node scripts/github.mjs            # infer username from token\n\n` +
        `Options:\n` +
        `  -u, --username   GitHub username (required if no token)\n` +
        `  -t, --token      GitHub token (or set env GITHUB_TOKEN)\n` +
        `  -j, --json       Output JSON\n` +
        `  -h, --help       Show this help\n`);
}

main().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});


