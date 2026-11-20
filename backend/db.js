
const Database = require('better-sqlite3');
const path = require('path');

// Create database file
const db = new Database(path.join(__dirname, 'coy.db'));

db.pragma('journal_mode = WAL');

// Create profiles table
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    photo_url TEXT,
    bio TEXT,
    location TEXT,
    interests TEXT,
    liked_current_user INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL UNIQUE,
    direction TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(profile_id) REFERENCES profiles(id)
  );
`);

// Seed profiles only when database is empty
const count = db.prepare(
  'SELECT COUNT(*) AS count FROM profiles'
).get().count;

if (count === 0) {
  const names = [
    'Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir',
    'Ishita', 'Aditya', 'Meera', 'Arjun', 'Sneha',
    'Vihaan', 'Aisha', 'Reyansh', 'Kavya', 'Dev',
    'Riya', 'Krish', 'Diya', 'Ayaan', 'Nisha',
    'Rahul', 'Tara', 'Samar', 'Kiara', 'Vivaan',
    'Anika', 'Manav', 'Myra', 'Neil', 'Sara'
  ];

  const bios = [
    'Coffee lover and weekend explorer.',
    'Always looking for new adventures.',
    'Music, books and meaningful conversations.',
    'Foodie who loves travelling.',
    'Building dreams one day at a time.'
  ];

  const locations = [
    'Ranchi, NIAMT',
    'Delhi, DU',
    'Mumbai, IIT Bombay',
    'Bangalore, RVCE',
    'Pune, COEP'
  ];

  const interests = [
    'Music, Travel, Photography',
    'Reading, Coffee, Movies',
    'Coding, Gaming, Technology',
    'Fitness, Dancing, Food',
    'Art, Nature, Travelling'
  ];

  const insert = db.prepare(`
    INSERT INTO profiles
    (name, age, photo_url, bio, location, interests, liked_current_user)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seed = db.transaction(() => {
    for (let idx = 0; idx < 30; idx++) {
      const gender = idx % 2 === 0 ? 'men' : 'women';
      const photoNumber = (idx % 50) + 1;

      const photo_url =
        `https://randomuser.me/api/portraits/${gender}/${photoNumber}.jpg`;

      insert.run(
        names[idx],
        20 + (idx % 7),
        photo_url,
        bios[idx % bios.length],
        locations[idx % locations.length],
        interests[idx % interests.length],
        idx % 5 < 2 ? 1 : 0
      );
    }
  });

  seed();
  console.log('30 profiles seeded successfully!');
}

module.exports = db;
