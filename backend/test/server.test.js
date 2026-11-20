const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'coy-discover-test-'));
process.env.COY_DB_PATH = path.join(tempDirectory, 'test.db');

const app = require('../server');
const db = require('../db');

let server;
let baseUrl;

function startServer() {
  return new Promise((resolve) => {
    const instance = app.listen(0, () => {
      const address = instance.address();
      resolve({ instance, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function stopServer(instance) {
  if (!instance) return;
  await new Promise((resolve, reject) => {
    instance.close((error) => (error ? reject(error) : resolve()));
  });
}

before(async () => {
  const started = await startServer();
  server = started.instance;
  baseUrl = started.url;
});

after(async () => {
  await stopServer(server);
  db.close();
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test('feed, swipe validation, mutual matching, privacy, and persistence', async () => {
  const feedResponse = await fetch(`${baseUrl}/feed`);
  assert.equal(feedResponse.status, 200);
  const feed = await feedResponse.json();

  assert.equal(feed.length, 30, 'the demo database should seed at least 30 profiles');
  assert.ok(feed.every((profile) =>
    ['id', 'name', 'age', 'photo_url', 'bio', 'location', 'interests']
      .every((field) => Object.hasOwn(profile, field))
  ));
  assert.ok(feed.every((profile) => !Object.hasOwn(profile, 'liked_current_user')),
    'the feed must never reveal incoming one-sided likes');

  const invalidDirection = await fetch(`${baseUrl}/swipe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profileId: 1, direction: 'maybe' })
  });
  assert.equal(invalidDirection.status, 400);

  const missingProfile = await fetch(`${baseUrl}/swipe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profileId: 99999, direction: 'like' })
  });
  assert.equal(missingProfile.status, 404);

  const passResponse = await fetch(`${baseUrl}/swipe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profileId: 3, direction: 'pass' })
  });
  assert.equal(passResponse.status, 201);
  assert.equal((await passResponse.json()).isMatch, false);

  const duplicateSwipe = await fetch(`${baseUrl}/swipe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profileId: 3, direction: 'like' })
  });
  assert.equal(duplicateSwipe.status, 409);

  const matchResponse = await fetch(`${baseUrl}/swipe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profileId: 1, direction: 'like' })
  });
  assert.equal(matchResponse.status, 201);
  const matchResult = await matchResponse.json();
  assert.equal(matchResult.isMatch, true);
  assert.match(matchResult.message, /match/i);

  const matchesResponse = await fetch(`${baseUrl}/matches`);
  const matches = await matchesResponse.json();
  assert.deepEqual(matches.map((profile) => profile.id), [1]);
  assert.ok(matches.every((profile) => !Object.hasOwn(profile, 'liked_current_user')));

  const updatedFeed = await fetch(`${baseUrl}/feed`).then((response) => response.json());
  assert.equal(updatedFeed.length, 28);
  assert.ok(!updatedFeed.some((profile) => [1, 3].includes(profile.id)));

  // Restart the HTTP listener: persisted swipes and mutual matches remain available.
  await stopServer(server);
  const restarted = await startServer();
  server = restarted.instance;
  baseUrl = restarted.url;

  const persistedMatches = await fetch(`${baseUrl}/matches`).then((response) => response.json());
  const persistedFeed = await fetch(`${baseUrl}/feed`).then((response) => response.json());
  assert.deepEqual(persistedMatches.map((profile) => profile.id), [1]);
  assert.equal(persistedFeed.length, 28);
  assert.ok(!persistedFeed.some((profile) => [1, 3].includes(profile.id)));
});
