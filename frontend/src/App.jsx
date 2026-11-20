
import { useEffect, useState, useCallback } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMatchModal, setActiveMatchModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [swiping, setSwiping] = useState(false);

  // Fetch profiles from backend
  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/feed`);

      if (!response.ok) {
        throw new Error('Could not fetch profiles');
      }

      const data = await response.json();

      setProfiles(data);
      setCurrentIndex(0);
    } catch (err) {
      setError('Unable to connect to server. Make sure your backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch mutual matches
  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/matches`);

      if (!response.ok) {
        throw new Error('Could not fetch matches');
      }

      const data = await response.json();
      setMatches(data);
    } catch (err) {
      console.error('Match fetching error:', err);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchMatches();
  }, []);

  // Handle Like and Pass
  const handleSwipe = useCallback(async (direction) => {
    if (swiping || currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];

    try {
      setSwiping(true);

      const response = await fetch(`${API_URL}/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profile.id,
          direction,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Swipe failed');
      }

      setProfiles(prev => prev.filter(p => p.id !== profile.id));

      if (result.isMatch) {
        setActiveMatchModal(profile);
      }

      await fetchMatches();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSwiping(false);
    }
  }, [profiles, currentIndex, swiping]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        activeTab !== 'discover' ||
        activeMatchModal ||
        swiping
      ) return;

      if (e.key === 'ArrowLeft') {
        handleSwipe('pass');
      }

      if (e.key === 'ArrowRight') {
        handleSwipe('like');
      }

      if (e.key === 'Escape') {
        setActiveMatchModal(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, activeMatchModal, swiping, handleSwipe]);

  const currentProfile = profiles[currentIndex];

  // Loading screen
  if (loading) {
    return (
      <div className="app-container">
        <div className="status-message">
          <h2>Loading Coy Discover...</h2>
          <p>Finding interesting people near you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* Navbar */}
      <header className="navbar">
        <h1 className="logo">coy<span>.</span></h1>

        <nav>
          <button
            className={activeTab === 'discover' ? 'nav-active' : ''}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>

          <button
            className={activeTab === 'matches' ? 'nav-active' : ''}
            onClick={() => setActiveTab('matches')}
          >
            Matches ({matches.length})
          </button>
        </nav>
      </header>

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => {
            setError('');
            fetchFeed();
            fetchMatches();
          }}>
            Retry
          </button>
        </div>
      )}

      {/* Discover Page */}
      {activeTab === 'discover' && (
        <main className="discover-container">

          <div className="section-heading">
            <h2>Discover people</h2>
            <p>Find someone who shares your vibe.</p>
          </div>

          {currentProfile ? (
            <div className="profile-card">

              <div className="profile-image-container">
                <img
                  src={currentProfile.photo_url}
                  alt={currentProfile.name}
                  className="profile-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.name)}&background=f2d5df&color=543746`;
                  }}
                />

                <div className="image-overlay">
                  <h2>
                    {currentProfile.name}, {currentProfile.age}
                  </h2>

                  <p>📍 {currentProfile.location}</p>
                </div>
              </div>

              <div className="profile-details">
                <p className="profile-bio">{currentProfile.bio}</p>

                <h4>Interests</h4>

                <div className="interests">
                  {currentProfile.interests
                    .split(',')
                    .map((interest, index) => (
                      <span key={index} className="interest-tag">
                        {interest.trim()}
                      </span>
                    ))}
                </div>
              </div>

              <div className="swipe-actions">
                <button
                  className="pass-button"
                  onClick={() => handleSwipe('pass')}
                  disabled={swiping}
                  aria-label="Pass profile"
                >
                  ✕
                </button>

                <button
                  className="like-button"
                  onClick={() => handleSwipe('like')}
                  disabled={swiping}
                  aria-label="Like profile"
                >
                  ♥
                </button>
              </div>

              <p className="keyboard-hint">
                ← Pass &nbsp; | &nbsp; Like →
              </p>
            </div>
          ) : (
            <div className="status-message">
              <h2>You're all caught up! 💗</h2>
              <p>You've viewed all available profiles.</p>
              <button onClick={fetchFeed}>
                Refresh Feed
              </button>
            </div>
          )}
        </main>
      )}

      {/* Matches Page */}
      {activeTab === 'matches' && (
        <main className="matches-container">
          <h2>Your Matches 💗</h2>
          <p>People who liked you back.</p>

          {matches.length > 0 ? (
            <div className="matches-grid">
              {matches.map(match => (
                <div className="match-card" key={match.id}>
                  <img
                    src={match.photo_url}
                    alt={match.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name)}`;
                    }}
                  />
                  <h3>{match.name}, {match.age}</h3>
                  <p>{match.location}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="status-message">
              <h3>No matches yet!</h3>
              <p>Keep discovering people. Your matches will appear here.</p>
            </div>
          )}
        </main>
      )}

      {/* Match Modal */}
      {activeMatchModal && (
        <div className="modal-overlay">
          <div className="match-modal">
            <h1>It's a Match! 💗</h1>

            <img
              src={activeMatchModal.photo_url}
              alt={activeMatchModal.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(activeMatchModal.name)}`;
              }}
            />

            <h2>You and {activeMatchModal.name} liked each other!</h2>

            <button onClick={() => {
              setActiveMatchModal(null);
              setActiveTab('matches');
            }}>
              See Your Matches
            </button>

            <button
              className="close-modal"
              onClick={() => setActiveMatchModal(null)}
            >
              Keep Discovering
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;