
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// GET: Fetch profiles that haven't been swiped on
app.get('/feed', (req, res) => {
  try {
    const profiles = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.age,
        p.photo_url,
        p.bio,
        p.location,
        p.interests
      FROM profiles p
      LEFT JOIN swipes s ON p.id = s.profile_id
      WHERE s.profile_id IS NULL
    `).all();

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Save a swipe
app.post('/swipe', (req, res) => {
  try {
    const { profileId, direction } = req.body;

    if (!Number.isInteger(profileId) ||
        !['like', 'pass'].includes(direction)) {
      return res.status(400).json({
        error: 'Invalid profileId or direction'
      });
    }

    const profile = db.prepare(
      'SELECT * FROM profiles WHERE id = ?'
    ).get(profileId);

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      });
    }

    const result = db.prepare(`
      INSERT OR IGNORE INTO swipes (profile_id, direction)
      VALUES (?, ?)
    `).run(profileId, direction);

    if (result.changes === 0) {
      return res.status(409).json({
        error: 'Profile already swiped'
      });
    }

    const isMatch =
      direction === 'like' &&
      profile.liked_current_user === 1;

    res.json({
      success: true,
      isMatch,
      message: isMatch ? "It's a match!" : 'Swipe saved'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch mutual matches
app.get('/matches', (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT
        p.id,
        p.name,
        p.age,
        p.photo_url,
        p.bio,
        p.location,
        p.interests
      FROM profiles p
      INNER JOIN swipes s ON p.id = s.profile_id
      WHERE s.direction = 'like'
      AND p.liked_current_user = 1
    `).all();

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
