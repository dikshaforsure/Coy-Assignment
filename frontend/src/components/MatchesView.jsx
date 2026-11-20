import { Heart, MapPin, Sparkles } from 'lucide-react';

function getInterests(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  return value.split(',').map((interest) => interest.trim()).filter(Boolean);
}

export default function MatchesView({ matches }) {
  if (matches.length === 0) {
    return (
      <div className="empty-state matches-empty">
        <div className="empty-icon"><Heart size={27} /></div>
        <p className="eyebrow">GOOD THINGS TAKE TIME</p>
        <h2>No mutual matches yet.</h2>
        <p>When you like each other, you’ll find that person here. We’ll never show one-sided likes.</p>
      </div>
    );
  }

  return (
    <div className="matches-grid">
      {matches.map((person) => (
        <article className="match-card" key={person.id}>
          <div className="match-photo">
            <img
              src={person.photo_url}
              alt={person.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=f3dce4&color=573847`;
              }}
            />
            <span className="mutual-label"><Heart size={12} fill="currentColor" /> It’s mutual</span>
          </div>
          <div className="match-copy">
            <h3>{person.name}, {person.age}</h3>
            <p className="match-location"><MapPin size={14} />{person.location}</p>
            <p className="match-bio">{person.bio}</p>
            <div className="match-interests">
              {getInterests(person.interests).slice(0, 3).map((interest) => (
                <span key={interest}><Sparkles size={11} />{interest}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
