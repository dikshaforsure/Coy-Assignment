import { motion } from 'framer-motion';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';

export default function MatchModal({ profile, onClose, onViewMatches }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="max-w-sm w-full space-y-6"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto">
          <Heart className="w-7 h-7 fill-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            It’s a match!
          </h2>
          <p className="text-sm text-zinc-300">
            You and <span className="font-semibold text-white">{profile.name}</span> liked each other.
          </p>
        </div>

        <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-500 to-rose-500 shadow-xl">
          <img
            src={profile.photoUrl}
            alt={profile.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onViewMatches}
            className="w-full py-3.5 px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            View All Matches
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            Keep Discovering
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}