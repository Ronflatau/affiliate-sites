/**
 * Run once to get your Buffer profile IDs.
 * Usage: BUFFER_ACCESS_TOKEN=your_token node scripts/buffer-profiles.js
 */

const token = process.env.BUFFER_ACCESS_TOKEN;
if (!token) {
  console.error('Set BUFFER_ACCESS_TOKEN first');
  process.exit(1);
}

const res = await fetch(`https://api.bufferapp.com/1/profiles.json?access_token=${token}`);
const profiles = await res.json();

console.log('\nYour Buffer Profile IDs:\n');
for (const p of profiles) {
  console.log(`${p.service.padEnd(12)} @${p.formatted_username.padEnd(20)} → ${p.id}`);
}
console.log('\nCopy the IDs you want to post to and add them to GitHub Secrets as BUFFER_PROFILE_IDS (comma-separated)');
