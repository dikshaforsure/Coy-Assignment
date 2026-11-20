import { useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';

const SWIPE_THRESHOLD = 105;

const cardVariants = {
  enter: { opacity: 0, scale: 0.96, y: 16 },
  center: { opacity: 1, scale: 1, y: 0 },
  exit: (direction) => ({
    x: direction === 'like' ? 520 : -520,
    opacity: 0,
    rotate: direction === 'like' ? 18 : -18,
    transition: { duration: 0.28, ease: 'easeOut' },
  }),
};

function getInterests(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  return value.split(',').map((interest) => interest.trim()).filter(Boolean);
}

function ProfileImage({ profile }) {
  const fallback = useMemo(
    () => `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=f3dce4&color=573847&size=512`,
    [profile.name]
  );

  return (
    <img
      src={profile.photo_url}
      alt={`${profile.name}'s profile`}
      draggable="false"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallback;
      }}
    />
  );
}

export default function SwipeCard({ profile, onSwipe, exitDirection = 'like', disabled = false }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-13, 13]);
  const likeOpacity = useTransform(x, [25, 115], [0, 1]);
  const passOpacity = useTransform(x, [-115, -25], [1, 0]);
  const interests = getInterests(profile.interests);

  const handleDragEnd = (_event, info) => {
    if (disabled) return;
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 650) {
      onSwipe('like');
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -650) {
      onSwipe('pass');
    }
  };

  return (
    <motion.article
      className="profile-card"
      style={{ x, rotate }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.82}
      onDragEnd={handleDragEnd}
      whileTap={disabled ? undefined : { cursor: 'grabbing' }}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      custom={exitDirection}
      transition={{ type: 'spring', stiffness: 280, damping: 25 }}
      aria-label={`${profile.name}, age ${profile.age}`}
    >
      <div className="profile-photo">
        <ProfileImage profile={profile} />
        <div className="photo-shade" />
        <motion.div className="swipe-stamp like-stamp" style={{ opacity: likeOpacity }}>LIKE</motion.div>
        <motion.div className="swipe-stamp pass-stamp" style={{ opacity: passOpacity }}>PASS</motion.div>
        <div className="profile-photo-copy">
          <span className="profile-status"><span /> READY TO CONNECT</span>
          <h2>{profile.name}<span>, {profile.age}</span></h2>
          <p><MapPin size={15} /> {profile.location}</p>
        </div>
      </div>
      <div className="profile-content">
        <p className="profile-bio">{profile.bio}</p>
        <div className="interest-heading">A FEW THINGS I LIKE</div>
        <div className="interest-list">
          {interests.map((interest) => (
            <span className="interest-chip" key={interest}><Sparkles size={12} />{interest}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
