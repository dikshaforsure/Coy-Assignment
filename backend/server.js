const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '10kb' }));

const profileFields = `
  p.id,
  p.name,
  p.age,
  p.photo_url,
  p.bio,
  p.location,
  p.interests
`;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Return only undiscovered profiles. The one-sided-like flag is intentionally
// excluded: clients must never learn who liked them unless the like is mutual.
app.get('/feed', (_req, res, next) => {
  try {
    const profiles = db.prepare(`
      SELECT ${profileFields}
      FROM profiles AS p
      WHERE NOT EXISTS (
        SELECT 1 FROM swipes AS s WHERE s.profile_id = p.id
      )
      ORDER BY p.id ASC
    `).all();

    res.json(profiles);
  } catch (error) {
    next(error);
  }
});

app.post('/swipe', (req, res, next) => {
  try {
    const { profileId, direction } = req.body || {};

    if (!Number.isSafeInteger(profileId) || profileId <= 0 ||
        !['like', 'pass'].includes(direction)) {
      return res.status(400).json({ error: 'A valid profileId and direction (like or pass) are required.' });
    }

    const saveSwipe = db.transaction((targetProfileId, swipeDirection) => {
      const profile = db.prepare(
        'SELECT id, liked_current_user FROM profiles WHERE id = ?'
      ).get(targetProfileId);

      if (!profile) return { notFound: true };

      const result = db.prepare(`
        INSERT OR IGNORE INTO swipes (profile_id, direction)
        VALUES (?, ?)
      `).run(targetProfileId, swipeDirection);

      if (result.changes === 0) return { alreadySwiped: true };

      const isMatch = swipeDirection === 'like' && profile.liked_current_user === 1;
      return { success: true, isMatch };
    });

    const result = saveSwipe(profileId, direction);

    if (result.notFound) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    if (result.alreadySwiped) {
      return res.status(409).json({ error: 'This profile has already been swiped on.' });
    }

    return res.status(201).json({
      success: true,
      isMatch: result.isMatch,
      message: result.isMatch ? "It's a match!" : 'Swipe saved.'
    });
  } catch (error) {
    return next(error);
  }
});

// This endpoint is the only place where the seeded incoming-like flag is used.
// Only mutual likes are returned; one-sided likes are never exposed.
app.get('/matches', (_req, res, next) => {
  try {
    const matches = db.prepare(`
      SELECT ${profileFields}
      FROM profiles AS p
      INNER JOIN swipes AS s ON s.profile_id = p.id
      WHERE s.direction = 'like'
        AND p.liked_current_user = 1
      ORDER BY s.created_at DESC, p.id ASC
    `).all();

    res.json(matches);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error('API error:', error);
  if (res.headersSent) return;
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Coy API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
