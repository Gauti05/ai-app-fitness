import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  Trophy, Medal, Crown, TrendingUp, Zap, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/tracking/leaderboard');
        setLeaders(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <Zap className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center relative overflow-hidden p-6">
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-slate-900 to-slate-900"></div>

      <div className="max-w-3xl w-full relative z-10">
        <div className="mt-4 mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition text-sm font-bold uppercase">
             <ChevronLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 mb-4 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <Trophy size={32} />
          </div>
          <h1 className="text-4xl font-black italic tracking-tight">GLOBAL <span className="text-yellow-400">RANKINGS</span></h1>
          <p className="text-slate-400 mt-2">Join the top tier. Your ranking updates with every session logged.</p>
        </div>

        <div className="space-y-4">
          {leaders.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No workouts logged yet. Be the first!</div>
          ) : (
            leaders.map((user, index) => (
              <LeaderRow key={user._id} rank={index + 1} user={user} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const LeaderRow = ({ rank, user }) => {
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  let rankIcon = <span className="font-bold text-slate-500">#{rank}</span>;
  let borderClass = "border-white/5";
  let bgClass = "bg-slate-800/40";

  if (isGold) {
    rankIcon = <Crown size={24} className="text-yellow-400 fill-yellow-400/20" />;
    borderClass = "border-yellow-500/50";
    bgClass = "bg-gradient-to-r from-yellow-500/10 to-slate-800/40";
  } else if (isSilver) {
    rankIcon = <Medal size={24} className="text-slate-300" />;
    borderClass = "border-slate-300/30";
  } else if (isBronze) {
    rankIcon = <Medal size={24} className="text-orange-400" />;
    borderClass = "border-orange-400/30";
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${borderClass} ${bgClass} backdrop-blur-md transition hover:scale-[1.02]`}>
      <div className="w-10 flex justify-center">{rankIcon}</div>

      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${isGold ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
        {user.name ? user.name[0].toUpperCase() : "A"}
      </div>

      <div className="flex-1">
        <h3 className={`font-bold text-lg ${isGold ? 'text-yellow-100' : 'text-white'}`}>{user.name}</h3>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp size={12} /> Status: {user.totalWorkouts >= 10 ? 'Elite Athlete' : 'Rising Star'}
        </p>
      </div>

      <div className="text-right">
        <p className="text-2xl font-black text-white">{user.totalWorkouts || 0}</p>
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sessions</p>
      </div>
    </div>
  );
};

export default Leaderboard;