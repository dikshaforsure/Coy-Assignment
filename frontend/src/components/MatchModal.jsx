import { motion } from 'framer-motion';
import { Heart, Users, X } from 'lucide-react';

export default function MatchModal({ profile, onClose, onViewMatches }) {
  return (
    <motion.div
      className="match-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        className="match-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        initial={{ opacity: 0, scale: 0.88, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close match dialog">
          <X size={19} />
        </button>
        <div className="match-celebration"><Heart size={30} fill="currentColor" /></div>
        <p className="eyebrow">A LOVELY LITTLE BEGINNING</p>
        <h2 id="match-title">It’s a match!</h2>
        <p className="match-subtitle">You and <strong>{profile.name}</strong> liked each other.</p>
        <div className="match-avatar-wrap">
          <img
            src={profile.photo_url}
            alt={profile.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=f3dce4&color=573847`;
            }}
          />
        </div>
        <button className="primary-button modal-primary" type="button" onClick={onViewMatches}>
          <Users size={17} /> See your matches
        </button>
        <button className="text-button" type="button" onClick={onClose}>Keep discovering</button>
      </motion.section>
    </motion.div>
  );
}
