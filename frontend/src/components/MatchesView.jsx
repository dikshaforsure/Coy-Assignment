import { Heart, MapPin } from 'lucide-react';

export default function MatchesView({ matches }) {
  if (matches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
          <Heart className="w-5 h-5" />
        </div>
        <p className="text-base font-semibold text-zinc-200">No mutual matches yet</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          When someone you like also likes you back, they’ll appear right here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
        Mutual Matches ({matches.length})
      </p>
      <div className="grid grid-cols-2 gap-3">
        {matches.map((person) => (
          <div
            key={person.id}
            className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col"
          >
            <div className="relative aspect-[3/4]">
              <img
                src={person.photoUrl}
                alt={person.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <p className="text-sm font-bold text-white truncate">
                  {person.name}, {person.age}
                </p>
                <p className="text-[11px] text-zinc-300 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  {person.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}