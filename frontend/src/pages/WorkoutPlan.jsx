import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { 
  Calendar, Dumbbell, Clock, AlertCircle, ChevronLeft, 
  CheckCircle2, Flame, RefreshCcw, X 
} from 'lucide-react';

const WorkoutPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0); 

  // --- MODAL STATE (The Fix) ---
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logData, setLogData] = useState({
    duration: 45, // Default so it's not empty
    calories: 300,
    mood: 'Good',
    notes: ''
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get('/ai/plan');
        setPlan(res.data.plan); 
      } catch (err) {
        console.error("Error fetching plan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  // 1. Open Modal instead of submitting immediately
  const handleOpenLog = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setLogData({ ...logData, [e.target.name]: e.target.value });
  };

  // 2. Submit Logic (With Duration)
  const handleSubmitLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dayName = plan.schedule[activeDay].day; 
      
      const payload = {
        workoutDay: dayName,
        duration: Number(logData.duration),
        calories: Number(logData.calories),
        mood: logData.mood,
        notes: logData.notes,
        date: new Date()
      };

      await api.post('/tracking/log', payload);
      
      toast.success("Workout Logged! Keep it up! 🔥");
      setShowModal(false);
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to log workout. Ensure duration is filled.");
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

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      {/* --- LEFT SIDEBAR: DAYS NAV --- */}
      <div className="w-full md:w-80 bg-slate-950 border-r border-white/10 flex flex-col h-auto md:h-screen overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition">
            <ChevronLeft size={20} />
          </Link>
          <span className="font-bold tracking-wider uppercase text-sm text-slate-400">Training Schedule</span>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {schedule.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                activeDay === index 
                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-lg shadow-teal-900/20' 
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm">{day.day}</span>
                {activeDay === index && <Flame size={14} className="animate-pulse" />}
              </div>
              <div className="text-xs opacity-70 truncate">{day.focus}</div>
            </button>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: EXERCISES --- */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-900 relative">
        <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500 via-slate-900 to-slate-900"></div>

        <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10">
          
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20 text-xs font-bold uppercase tracking-wider">
               <Calendar size={14} /> Day {activeDay + 1} Protocol
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white mb-2">{currentDay.focus}</h1>
            <p className="text-slate-400 flex items-center gap-2">
              <Clock size={16} /> Est. Time: {plan.timePerSession || 45} mins
            </p>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {currentDay.exercises.map((exercise, i) => (
              <div key={i} className="group bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-teal-500/30 transition-all hover:bg-slate-800/60">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl font-black text-slate-600 group-hover:text-teal-500 group-hover:border-teal-500/30 transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-teal-100 transition">{exercise.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
                      <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                        <RefreshCcw size={14} className="text-teal-500" /> {exercise.sets} Sets
                      </span>
                      <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                        <Dumbbell size={14} className="text-teal-500" /> {exercise.reps} Reps
                      </span>
                    </div>
                  </div>
                  {exercise.notes && (
                    <div className="md:max-w-xs w-full bg-teal-500/5 border border-teal-500/10 p-4 rounded-xl text-sm text-teal-200/80 italic">
                      <div className="flex items-center gap-2 mb-1 text-teal-400 font-bold text-xs uppercase not-italic">
                        <AlertCircle size={12} /> Coach Tip
                      </div>
                      "{exercise.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Completion Button */}
          <div className="mt-12 flex justify-center pb-10">
            <button 
              onClick={handleOpenLog} // <-- Opens Modal Now
              className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-slate-900 font-bold text-lg rounded-xl hover:bg-teal-400 hover:scale-105 transition shadow-xl shadow-teal-500/20"
            >
              <CheckCircle2 size={24} /> Mark Workout Complete
            </button>
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
                <input 
                  type="number" 
                  name="duration" 
                  required 
                  value={logData.duration} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-teal-500 outline-none font-bold text-lg"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Calories Burned (Approx)</label>
                <input 
                  type="number" 
                  name="calories" 
                  value={logData.calories} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1">Mood</label>
                   <select name="mood" value={logData.mood} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-teal-500 outline-none">
                     <option>Great</option>
                     <option>Good</option>
                     <option>Hard</option>
                     <option>Tired</option>
                   </select>
                </div>
              </div>

              <textarea 
                name="notes" 
                value={logData.notes} 
                onChange={handleInputChange}
                placeholder="How did it go? (Optional)"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-teal-500 outline-none h-24 resize-none"
              ></textarea>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black uppercase rounded-xl shadow-lg shadow-teal-500/20 transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm & Log'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default WorkoutPlan;