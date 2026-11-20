import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';

export default function SwipeCard({ profile, isTop, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -30], [1, 0]);

  const handleDragEnd = (_, info) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      onSwipe('like');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('pass');
    }
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: isTop ? 20 : 10,
      }}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className={`absolute inset-0 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl ${
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
    >
      {/* Profile Image */}
      <img
        src={profile.photoUrl}
        alt={profile.name}
        draggable={false}
        onError={(e) => {
          e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${profile.name}`;
        }}
        className="w-full h-full object-cover"
      />

      {/* Dark Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

      {/* Dynamic Drag Feedback Stamps */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-6 border-4 border-emerald-400 text-emerald-400 font-extrabold text-3xl px-4 py-1 rounded-xl -rotate-12 tracking-widest pointer-events-none"
          >
            LIKE
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-8 right-6 border-4 border-rose-500 text-rose-500 font-extrabold text-3xl px-4 py-1 rounded-xl rotate-12 tracking-widest pointer-events-none"
          >
            PASS
          </motion.div>
        </>
      )}

      {/* Profile Details */}
      <div className="absolute bottom-0 inset-x-0 p-5 space-y-2.5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
          <span className="text-xl text-zinc-300 font-light">{profile.age}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{profile.location}</span>
        </div>

        <p className="text-sm text-zinc-200 leading-snug line-clamp-2">{profile.bio}</p>

        {/* Interest Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-zinc-100 border border-white/10"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}