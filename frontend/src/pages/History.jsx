import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  CheckCircle2, ChevronLeft, Clock, Zap, Flame, AlignLeft 
} from 'lucide-react';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tracking/history');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Helper to format date nicely (e.g., "Mon, Jan 23")
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <Zap className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-6 relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-900"></div>

      <div className="max-w-3xl w-full relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/dashboard" className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic">TRAINING <span className="text-teal-400">LOG</span></h1>
            <p className="text-slate-400">Your journey, documented.</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
          
          {logs.length === 0 ? (
            <div className="text-center p-10 bg-slate-800/50 rounded-2xl border border-white/5 ml-10 md:ml-0">
              <p className="text-slate-400">No workouts recorded yet.</p>
              <Link to="/log" className="text-teal-400 font-bold hover:underline mt-2 block">Log your first workout</Link>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Dot on Line */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shadow text-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                   log.mood === 'Great' ? 'bg-teal-500' : 'bg-slate-500'
                }`}>
                  <CheckCircle2 size={16} />
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-6 rounded-xl border border-white/5 shadow-lg hover:border-teal-500/30 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-white uppercase tracking-wide">{log.workoutDay || log.focus || "Workout"}</span>
                    <time className="font-mono text-xs text-slate-500">{formatDate(log.date)}</time>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-slate-300 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-500" />
                      <span>{log.duration} min</span>
                    </div>
                    {log.calories > 0 && (
                       <div className="flex items-center gap-1">
                         <Flame size={14} className="text-orange-500" />
                         <span>{log.calories} kcal</span>
                       </div>
                    )}
                    <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                            log.mood === 'Great' ? 'bg-teal-500/10 text-teal-400' :
                            log.mood === 'Hard' ? 'bg-red-500/10 text-red-400' :
                            'bg-blue-500/10 text-blue-400'
                        }`}>
                            {log.mood}
                        </span>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {log.notes && (
                    <div className="pt-3 border-t border-white/5 flex gap-2">
                        <AlignLeft size={14} className="text-slate-600 mt-1 shrink-0" />
                        <p className="text-slate-400 text-sm italic leading-relaxed">"{log.notes}"</p>
                    </div>
                  )}

                </div>

              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
};

export default History;