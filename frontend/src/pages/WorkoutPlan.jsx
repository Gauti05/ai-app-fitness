import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { 
  Calendar, Dumbbell, Clock, AlertCircle, ChevronLeft, 
  CheckCircle2, Flame, RefreshCcw, X, Youtube, ExternalLink, Check 
} from 'lucide-react';

const WorkoutPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0); 
  
  // --- COMPLETION STATE ---
  const [completedDays, setCompletedDays] = useState([]); // Stores ["Monday", "Wednesday"] etc.

  // --- LOGGING MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logData, setLogData] = useState({
    duration: 45, 
    calories: 300,
    mood: 'Good',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Plan AND History in parallel
      const [planRes, historyRes] = await Promise.all([
        api.get('/ai/plan'),
        api.get('/tracking/history')
      ]);

      setPlan(planRes.data.plan); 

      // 2. Calculate Completed Days (Logic: Look at logs from the last 7 days)
      if (historyRes.data) {
        const recentLogs = historyRes.data;
        const now = new Date();
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));

        const doneDays = recentLogs
          .filter(log => new Date(log.date) > oneWeekAgo) // Only check recent history
          .map(log => log.workoutDay); // We stored the day name here (e.g., "Monday")
        
        setCompletedDays(doneDays);
      }

    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: DIRECT YOUTUBE OPENER ---
  const openTutorial = (exerciseName) => {
    const query = encodeURIComponent(`${exerciseName} exercise tutorial proper form`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenLog = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setLogData({ ...logData, [e.target.name]: e.target.value });
  };

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dayName = plan.schedule[activeDay].day; 
      
      const payload = {
        workoutDay: dayName, // This saves "Monday" or "Push Day"
        duration: Number(logData.duration),
        calories: Number(logData.calories),
        mood: logData.mood,
        notes: logData.notes,
        date: new Date()
      };

      await api.post('/tracking/log', payload);
      
      toast.success("Workout Logged! Keep it up! 🔥");
      
      // Update local state immediately so UI turns green
      setCompletedDays(prev => [...prev, dayName]);
      
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to log workout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <RefreshCcw className="w-10 h-10 animate-spin" />
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">No Plan Found</h2>
      <p className="text-slate-400 mb-6">You haven't generated a workout yet.</p>
      <Link to="/setup" className="px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400">
        Generate Plan
      </Link>
    </div>
  );

  const schedule = plan.schedule; 
  const currentDay = schedule[activeDay];
  
  // CHECK: Is the currently selected day already done?
  const isCurrentDayDone = completedDays.includes(currentDay.day);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      {/* --- LEFT SIDEBAR: SCHEDULE --- */}
      <div className="w-full md:w-80 bg-slate-950 border-r border-white/10 flex flex-col h-auto md:h-screen overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition">
            <ChevronLeft size={20} />
          </Link>
          <span className="font-bold tracking-wider uppercase text-sm text-slate-400">Training Schedule</span>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {schedule.map((day, index) => {
            const isDone = completedDays.includes(day.day);
            const isActive = activeDay === index;

            return (
              <button
                key={index}
                onClick={() => setActiveDay(index)}
                className={`w-full text-left p-4 rounded-xl transition-all border relative overflow-hidden ${
                  isActive 
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-lg' 
                    : isDone 
                      ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400 opacity-80' 
                      : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1 relative z-10">
                  <span className="font-bold text-sm flex items-center gap-2">
                    {day.day}
                    {isDone && <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-500/20" />}
                  </span>
                  {isActive && !isDone && <Flame size={14} className="animate-pulse" />}
                </div>
                <div className="text-xs opacity-70 truncate relative z-10">{day.focus}</div>
                
                {/* Visual "Done" Overlay */}
                {isDone && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT SIDE: EXERCISES --- */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-900 relative">
        <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500 via-slate-900 to-slate-900"></div>

        <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10">
          
          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border text-xs font-bold uppercase tracking-wider ${isCurrentDayDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'}`}>
               {isCurrentDayDone ? <Check size={14} /> : <Calendar size={14} />} 
               {isCurrentDayDone ? "Completed" : `Day ${activeDay + 1} Protocol`}
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white mb-2">{currentDay.focus}</h1>
            <p className="text-slate-400 flex items-center gap-2">
              <Clock size={16} /> Est. Time: {plan.timePerSession || 45} mins
            </p>
          </div>

          {/* Exercise List */}
          <div className={`space-y-4 ${isCurrentDayDone ? 'opacity-75 grayscale-[0.5] transition-all' : ''}`}>
            {currentDay.exercises.map((exercise, i) => (
              <div key={i} className="group bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-teal-500/30 transition-all hover:bg-slate-800/60">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl font-black transition-colors ${isCurrentDayDone ? 'bg-emerald-900/20 border-emerald-500/20 text-emerald-500' : 'bg-slate-900 border-white/10 text-slate-600 group-hover:text-teal-500'}`}>
                    {isCurrentDayDone ? <Check size={20} /> : i + 1}
                  </div>
                  <div className="flex-1 w-full">
                    
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-teal-100 transition">{exercise.name}</h3>
                      <button 
                        onClick={() => openTutorial(exercise.name)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition border border-red-500/20 group/btn"
                      >
                         <Youtube size={16} className="group-hover/btn:fill-white" /> Watch
                         <ExternalLink size={12} className="opacity-50" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
                      <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                        <RefreshCcw size={14} className="text-teal-500" /> {exercise.sets} Sets
                      </span>
                      <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                        <Dumbbell size={14} className="text-teal-500" /> {exercise.reps} Reps
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Button (DISABLED IF DONE) */}
          <div className="mt-12 flex justify-center pb-10">
            {isCurrentDayDone ? (
               <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 font-bold text-lg rounded-xl flex items-center gap-3 cursor-default">
                 <CheckCircle2 size={24} /> Day Completed
               </div>
            ) : (
               <button 
                onClick={handleOpenLog} 
                className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-slate-900 font-bold text-lg rounded-xl hover:bg-teal-400 hover:scale-105 transition shadow-xl shadow-teal-500/20"
               >
                <CheckCircle2 size={24} /> Mark Workout Complete
               </button>
            )}
          </div>

        </div>
      </div>

      {/* --- LOGGING MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic">COMPLETE SESSION</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Duration (Mins)</label>
                <input type="number" name="duration" required value={logData.duration} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-teal-500 outline-none font-bold text-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Calories Burned</label>
                <input type="number" name="calories" value={logData.calories} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-teal-500 outline-none" />
              </div>
              <select name="mood" value={logData.mood} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-teal-500 outline-none">
                 <option>Great</option><option>Good</option><option>Hard</option><option>Tired</option>
              </select>
              <textarea name="notes" value={logData.notes} onChange={handleInputChange} placeholder="Notes..." className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white outline-none h-24 resize-none"></textarea>
              <button type="submit" disabled={submitting} className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black uppercase rounded-xl shadow-lg transition disabled:opacity-50">{submitting ? 'Saving...' : 'Confirm & Log'}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkoutPlan;