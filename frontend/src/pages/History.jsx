import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  Calendar, Flame, Clock, ChevronLeft, Activity, TrendingUp, Loader 
} from 'lucide-react';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCals: 0, totalMins: 0, totalSessions: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tracking/history');
        const data = res.data;
        
        setLogs(data);

        // Calculate Totals
        const totalCals = data.reduce((acc, log) => acc + (log.calories || 0), 0);
        const totalMins = data.reduce((acc, log) => acc + (log.duration || 0), 0);
        
        setStats({
          totalSessions: data.length,
          totalCals,
          totalMins
        });

      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Format Data for Charts (Reverse to show oldest -> newest left to right)
  const chartData = [...logs].reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: log.calories,
    duration: log.duration
  }));

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <Loader className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6 md:p-10 relative overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-900 to-slate-900"></div>

      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic uppercase">Training <span className="text-teal-400">Evolution</span></h1>
            <p className="text-slate-400 text-sm">Visualize your progress over time.</p>
          </div>
        </div>

        {/* 1. Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            icon={<Activity size={20} className="text-blue-400" />} 
            label="Total Sessions" 
            value={stats.totalSessions} 
            sub="Workouts Completed"
          />
          <StatCard 
            icon={<Flame size={20} className="text-orange-500" />} 
            label="Total Burn" 
            value={stats.totalCals.toLocaleString()} 
            sub="Calories Torched"
          />
          <StatCard 
            icon={<Clock size={20} className="text-teal-400" />} 
            label="Total Time" 
            value={Math.floor(stats.totalMins / 60) + "h " + (stats.totalMins % 60) + "m"} 
            sub="Time Under Tension"
          />
        </div>

        {/* 2. Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Calorie Burn Chart */}
          <div className="bg-slate-800/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <Flame size={16} className="text-orange-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Calorie Burn Trend</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fdba74' }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#f97316" fillOpacity={1} fill="url(#colorCals)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Duration Chart */}
          <div className="bg-slate-800/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={16} className="text-teal-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Duration Consistency (Mins)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="duration" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* 3. Detailed History Log */}
        <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-6 md:p-8">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-slate-400" /> Recent Activity Log
          </h3>
          
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No workouts logged yet. Go crush one! 💪</p>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/50 border border-white/5 rounded-xl hover:border-teal-500/30 transition-all">
                  
                  {/* Left Info */}
                  <div className="flex items-center gap-4 mb-2 md:mb-0">
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold border border-teal-500/20">
                      {new Date(log.date).getDate()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-teal-400 transition">{log.workoutDay || "Freestyle Workout"}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Right Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock size={14} className="text-slate-500" /> {log.duration} mins
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Flame size={14} className="text-orange-500" /> {log.calories} cals
                    </div>
                    {log.mood && (
                       <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                         log.mood === 'Great' ? 'bg-green-500/20 text-green-400' : 
                         log.mood === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                       }`}>
                         {log.mood}
                       </span>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-slate-800/60 border border-white/5 p-6 rounded-2xl flex items-center gap-5">
    <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[10px] text-slate-500">{sub}</p>
    </div>
  </div>
);

export default History;