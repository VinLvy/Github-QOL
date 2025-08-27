#!/usr/bin/env node
import minimist from "minimist";
import { IgApiClient } from "instagram-private-api";
import fs from "fs/promises";

async function loginInstagram(username, password) {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);

  // session reuse
  try {
    const cookies = await fs.readFile("./session.json", "utf8");
    await ig.state.deserialize(cookies);
    console.error("✅ Reused saved session");
  } catch {
    console.error("🔑 Logging in with username & password...");
    await ig.account.login(username, password);
    const serialized = await ig.state.serialize();
    delete serialized.constants; // save space
    await fs.writeFile("./session.json", JSON.stringify(serialized));
    console.error("💾 Saved new session");
  }

  return ig;
}

async function getFollowers(ig, userId) {
  const feed = ig.feed.accountFollowers(userId);
  const followers = [];
  do {
    const items = await feed.items();
    followers.push(...items.map((u) => ({ username: u.username, followerCount: u.follower_count })));
  } while (feed.isMoreAvailable());
  return followers;
}

async function getFollowing(ig, userId) {
  const feed = ig.feed.accountFollowing(userId);
  const following = [];
  do {
    const items = await feed.items();
    following.push(...items.map((u) => ({ username: u.username, followerCount: u.follower_count })));
  } while (feed.isMoreAvailable());
  return following;
}

async function main() {
  const args = minimist(process.argv.slice(2), {
    alias: { u: "username", p: "password", j: "json", h: "help" },
    boolean: ["json", "help"],
    string: ["username", "password"],
  });

  if (args.help) {
    console.log(`
Usage:
  node scripts/nonfollowers.mjs -u <ig_username> -p <ig_password>

Options:
  -u, --username   Instagram username (required)
  -p, --password   Instagram password (required)
  -j, --json       Output JSON
  -h, --help       Show this help
`);
    process.exit(0);
  }

  const { username, password } = args;
  if (!username || !password) {
    console.error("❌ Username & password IG wajib diisi");
    process.exit(1);
  }

  const ig = await loginInstagram(username, password);
  const me = await ig.account.currentUser();

  console.error(`📡 Fetching followers & following for @${me.username} ...`);

  const [followers, following] = await Promise.all([getFollowers(ig, me.pk), getFollowing(ig, me.pk)]);

  const followerSet = new Set(followers.map((u) => u.username));
  const nonFollowers = following.filter((u) => !followerSet.has(u.username));

  // filter: hanya akun yg followers < 1000
  const smallAccounts = nonFollowers.filter((u) => u.followerCount < 1000);

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          username: me.username,
          counts: {
            following: following.length,
            followers: followers.length,
            nonFollowers: nonFollowers.length,
            under1kNonFollowers: smallAccounts.length,
          },
          users: smallAccounts,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Accounts you follow that don't follow back (under 1k followers): ${smallAccounts.length}\n`);
    for (const u of smallAccounts) {
      console.log(`- ${u.username} (${u.followerCount} followers) https://instagram.com/${u.username}`);
    }
  }
}

main().catch((err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
