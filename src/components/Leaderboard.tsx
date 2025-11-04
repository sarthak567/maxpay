import { useEffect, useMemo, useState } from "react";
import { Trophy, Crown, Flame } from "lucide-react";

type Leader = {
  id: string;
  name: string;
  avatarColor: string;
  nftCount: number;
  weeklyChange: number; // percentage
  streakDays: number;
};

function generateMockLeaders(): Leader[] {
  const names = [
    "Ava Chen",
    "Ravi Kapoor",
    "Noah Lee",
    "Mia Rodriguez",
    "Zoe Park",
    "Leo Martins",
    "Yara Ali",
    "Omar Khan",
  ];
  const colors = [
    "bg-gradient-to-br from-yellow-500 to-amber-600",
    "bg-gradient-to-br from-cyan-500 to-blue-600",
    "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-rose-500 to-orange-500",
  ];
  return names.map((n, i) => ({
    id: `${i}`,
    name: n,
    avatarColor: colors[i % colors.length],
    nftCount: Math.floor(20 + Math.random() * 180),
    weeklyChange: Math.round((-5 + Math.random() * 15) * 10) / 10,
    streakDays: Math.floor(1 + Math.random() * 21),
  }));
}

export function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  useEffect(() => {
    // Placeholder: replace with Supabase query when NFT data exists
    setLeaders(generateMockLeaders());
  }, []);

  const sorted = useMemo(
    () => [...leaders].sort((a, b) => b.nftCount - a.nftCount).slice(0, 10),
    [leaders]
  );

  const top = sorted[0];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="absolute -right-10 -top-10 opacity-20">
          <Trophy className="w-40 h-40 text-yellow-400" />
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> Leaderboard
            </h2>
            <p className="text-slate-400 mt-1">
              Celebrate top NFT earners and keep the momentum going!
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-slate-300">
              Daily streaks boost your rank.
            </span>
          </div>
        </div>
        {top && (
          <div className="px-6 pb-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${top.avatarColor} grid place-items-center text-white font-semibold`}
              >
                {top.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")}
              </div>
              <div className="flex-1">
                <p className="text-slate-300 text-sm">This week’s MVP</p>
                <p className="text-white font-semibold">{top.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{top.nftCount}</p>
                <p className="text-xs text-slate-400">Total NFTs earned</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
        <table className="w-full">
          <thead className="bg-white/5 text-slate-300 text-sm">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Rank</th>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">NFTs Earned</th>
              <th className="text-left px-4 py-3 font-medium">Weekly</th>
              <th className="text-left px-4 py-3 font-medium">Streak</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((l, idx) => {
              const positive = l.weeklyChange >= 0;
              return (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-semibold ${
                        idx === 0
                          ? "bg-yellow-500/20 text-yellow-300"
                          : idx === 1
                          ? "bg-slate-500/20 text-slate-200"
                          : idx === 2
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-white/5 text-slate-300"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg ${l.avatarColor} grid place-items-center text-white text-sm font-semibold`}
                      >
                        {l.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-white font-medium">{l.name}</p>
                        <p className="text-xs text-slate-400">
                          Keeping the streak alive!
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-semibold">
                    {l.nftCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        positive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {l.weeklyChange}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-orange-300">
                      <Flame className="w-4 h-4" /> {l.streakDays}d
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 to-cyan-600 p-5 text-white">
        <p className="text-lg font-semibold">
          Keep pushing — your next NFT is one action away.
        </p>
        <p className="text-sm opacity-90">
          Complete a trade or automation today to climb the board.
        </p>
      </div>
    </div>
  );
}
