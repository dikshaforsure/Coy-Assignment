const Database = require('better-sqlite3');
const path = require('path');

const databasePath = process.env.COY_DB_PATH || path.join(__dirname, 'coy.db');
const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    photo_url TEXT,
    bio TEXT,
    location TEXT,
    interests TEXT,
    liked_current_user INTEGER NOT NULL DEFAULT 0 CHECK (liked_current_user IN (0, 1))
  );

  CREATE TABLE IF NOT EXISTS swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL UNIQUE,
    direction TEXT NOT NULL CHECK (direction IN ('like', 'pass')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_swipes_direction ON swipes(direction);
`);

const profileCount = db.prepare('SELECT COUNT(*) AS count FROM profiles').get().count;

if (profileCount === 0) {
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

  const insertProfile = db.prepare(`
    INSERT INTO profiles
      (name, age, photo_url, bio, location, interests, liked_current_user)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seedProfiles = db.transaction(() => {
    for (let index = 0; index < names.length; index += 1) {
      const gender = index % 2 === 0 ? 'men' : 'women';
      const photoNumber = (index % 50) + 1;
      const photoUrl = `https://randomuser.me/api/portraits/${gender}/${photoNumber}.jpg`;

      insertProfile.run(
        names[index],
        20 + (index % 7),
        photoUrl,
        bios[index % bios.length],
        locations[index % locations.length],
        interests[index % interests.length],
        index % 5 < 2 ? 1 : 0
      );
    }
  });

  seedProfiles();
  console.log('Seeded 30 mock profiles.');
}

module.exports = db;
