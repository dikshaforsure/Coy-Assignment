import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, House, Sparkles, Users } from 'lucide-react';
import SwipeCard from './components/SwipeCard.jsx';
import MatchModal from './components/MatchModal.jsx';
import MatchesView from './components/MatchesView.jsx';
import { getFeed, getMatches, swipeProfile } from './api.js';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [discoverView, setDiscoverView] = useState('profiles');
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [exitDirection, setExitDirection] = useState('like');
  const [error, setError] = useState('');
  const swipeLock = useRef(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [feed, mutualMatches] = await Promise.all([getFeed(), getMatches()]);
      setProfiles(feed);
      setMatches(mutualMatches);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load Discover right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true);
    try {
      setMatches(await getMatches());
    } catch (requestError) {
      setError(requestError.message || 'Unable to load your matches.');
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleSwipe = useCallback(async (direction) => {
    const profile = profiles[0];
    if (!profile || swipeLock.current || swiping) return;

    swipeLock.current = true;
    setSwiping(true);
    setError('');

    try {
      const result = await swipeProfile(profile.id, direction);
      setExitDirection(direction);
      setProfiles((current) => current.filter((item) => item.id !== profile.id));

      if (result.isMatch) setActiveMatch(profile);
      try {
        setMatches(await getMatches());
      } catch (refreshError) {
        setError(refreshError.message || 'Your swipe was saved, but matches could not refresh.');
      }
    } catch (requestError) {
      setError(requestError.message || 'Your swipe could not be saved. Please try again.');
    } finally {
      swipeLock.current = false;
      setSwiping(false);
    }
  }, [profiles, swiping]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (activeTab !== 'discover' || activeMatch || swiping || discoverView !== 'profiles') return;
      if (event.key === 'ArrowLeft') handleSwipe('pass');
      if (event.key === 'ArrowRight') handleSwipe('like');
      if (event.key === 'Escape') setActiveMatch(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, activeMatch, swiping, discoverView, handleSwipe]);

  const currentProfile = profiles[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Coy home" onClick={(event) => event.preventDefault()}>
          coy<span>.</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button
            type="button"
            className={activeTab === 'home' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveTab('home')}
          >
            <House size={17} strokeWidth={2.2} />
            <span>Home</span>
          </button>
          <button
            type="button"
            className={activeTab === 'discover' ? 'nav-link active' : 'nav-link'}
            onClick={() => setActiveTab('discover')}
          >
            <Sparkles size={17} strokeWidth={2.2} />
            <span>Discover</span>
          </button>
        </nav>
        <div className="privacy-note"><span className="privacy-dot" /> Mutual likes only</div>
      </header>

      {activeTab === 'home' ? (
        <main className="home-placeholder" aria-label="Home tab" />
      ) : (
        <main className="discover-page">
          <section className="page-intro">
            <div>
              <p className="eyebrow">GOOD CONNECTIONS START HERE</p>
              <h1>Find your kind of <span>people.</span></h1>
              <p className="intro-copy">A little curiosity can lead to something lovely.</p>
            </div>
            <div className="intro-decoration" aria-hidden="true"><Heart size={25} fill="currentColor" /></div>
          </section>

          <div className="discover-tabs" role="tablist" aria-label="Discover views">
            <button
              type="button"
              role="tab"
              aria-selected={discoverView === 'profiles'}
              className={discoverView === 'profiles' ? 'discover-tab selected' : 'discover-tab'}
              onClick={() => setDiscoverView('profiles')}
            >
              <Sparkles size={16} /> Discover
              <span className="tab-count">{profiles.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={discoverView === 'matches'}
              className={discoverView === 'matches' ? 'discover-tab selected' : 'discover-tab'}
              onClick={() => {
                setDiscoverView('matches');
                loadMatches();
              }}
            >
              <Users size={16} /> Matches
              <span className="tab-count">{matches.length}</span>
            </button>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button type="button" onClick={loadFeed}>Try again</button>
            </div>
          )}

          {discoverView === 'profiles' ? (
            <section className="discovery-layout" aria-label="Profile discovery">
              <div className="discovery-heading">
                <div>
                  <h2>Today’s picks</h2>
                  <p>Take your time. Swipe only when it feels right.</p>
                </div>
                <span className="remaining-count">{profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} left</span>
              </div>

              {loading ? (
                <div className="loading-card" aria-label="Loading profiles">
                  <div className="loading-photo" />
                  <div className="loading-line long" />
                  <div className="loading-line short" />
                </div>
              ) : currentProfile ? (
                <>
                  <div className="card-stage">
                    {profiles[1] && <div className="card-shadow card-shadow-back" />}
                    <AnimatePresence custom={exitDirection} mode="popLayout">
                      <SwipeCard
                        key={currentProfile.id}
                        profile={currentProfile}
                        onSwipe={handleSwipe}
                        exitDirection={exitDirection}
                        disabled={swiping}
                      />
                    </AnimatePresence>
                  </div>
                  <div className="action-row">
                    <button
                      type="button"
                      className="action-button pass-action"
                      onClick={() => handleSwipe('pass')}
                      disabled={swiping}
                      aria-label="Pass on this profile"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                    <button
                      type="button"
                      className="action-button like-action"
                      onClick={() => handleSwipe('like')}
                      disabled={swiping}
                      aria-label="Like this profile"
                    >
                      <Heart size={27} fill="currentColor" />
                    </button>
                  </div>
                  <p className="gesture-hint">Drag the card or use the buttons · <kbd>←</kbd> pass <kbd>→</kbd> like</p>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><Heart size={27} /></div>
                  <p className="eyebrow">YOU’RE ALL CAUGHT UP</p>
                  <h2>You’ve seen everyone for now.</h2>
                  <p>Every profile you’ve viewed stays out of your feed. Check your mutual matches while you’re here.</p>
                  <button type="button" className="primary-button" onClick={() => { setDiscoverView('matches'); loadMatches(); }}>
                    View your matches
                  </button>
                </div>
              )}
            </section>
          ) : (
            <section className="matches-layout" aria-label="Your mutual matches">
              <div className="discovery-heading">
                <div>
                  <h2>Your matches</h2>
                  <p>Only people you’ve both liked appear here.</p>
                </div>
                <span className="remaining-count">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</span>
              </div>
              {matchesLoading ? (
                <div className="matches-loading">Loading your mutual matches…</div>
              ) : (
                <MatchesView matches={matches} />
              )}
            </section>
          )}
        </main>
      )}

      {activeMatch && (
        <MatchModal
          profile={activeMatch}
          onClose={() => setActiveMatch(null)}
          onViewMatches={() => {
            setActiveMatch(null);
            setDiscoverView('matches');
            loadMatches();
          }}
        />
      )}
      <footer className="site-footer">Coy Discover <span>·</span> Meaningful connections, mutual by design.</footer>
    </div>
  );
}

export default App;
