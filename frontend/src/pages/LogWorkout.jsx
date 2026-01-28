import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Dumbbell, Clock, Flame, Save, Calendar, 
  CheckCircle, ChevronLeft, AlertCircle, Zap
} from 'lucide-react';

const LogWorkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data State
  const [plan, setPlan] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    workoutDay: '', // e.g. "Push Day"
    duration: 60,
    calories: 300,
    mood: 'Great', // Great, Good, Hard, Exhausted
    notes: '',
    exercises: [] // Will be populated from plan
  });

  const moods = ['Great', 'Good', 'Hard', 'Tired'];

  // 1. Fetch AI Plan & Auto-Fill Today
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get('/ai/plan');
        if (res.data && res.data.plan) {
          setPlan(res.data.plan);
          findTodayWorkout(res.data.plan);
        }
      } catch (err) {
        console.log("No active plan found, defaulting to freestyle.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  // Helper: Find which workout corresponds to "Today"
  const findTodayWorkout = (currentPlan) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];

    // Try to find exact day match
    const match = currentPlan.schedule.find(d => d.day === todayName);
    
    if (match) {
      setTodayWorkout(match);
      setFormData(prev => ({
        ...prev,
        workoutDay: `${match.day} - ${match.focus}`,
        exercises: match.exercises || []
      }));
    } else {
      // If no match (e.g. Rest Day), just default to first available or empty
      setFormData(prev => ({
        ...prev,
        workoutDay: 'Freestyle Workout'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Calculate estimated calories if not set manually (approx 5 cals/min for lifting)
      const finalCals = formData.calories > 0 ? formData.calories : formData.duration * 5;

      const payload = {
        ...formData,
        calories: finalCals,
        date: new Date()
      };

      await api.post('/tracking/log', payload);
      
      toast.success("Workout Logged! Heatmap Updated. 🔥");
      navigate('/dashboard'); // Redirect to dashboard to see the heatmap update
    } catch (err) {
      console.error(err);
      toast.error("Failed to log workout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <Zap className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 relative overflow-hidden flex items-center justify-center">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="p-6 bg-slate-950/50 border-b border-white/5 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-full transition">
            <ChevronLeft className="text-slate-400" />
          </button>
          <h1 className="text-xl font-black italic tracking-wide uppercase">Log Session</h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* 1. Workout Name Display */}
          <div className="text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Today's Focus</p>
            <input 
              type="text" 
              value={formData.workoutDay}
              onChange={(e) => setFormData({...formData, workoutDay: e.target.value})}
              className="w-full bg-transparent text-center text-3xl font-extrabold text-white border-none focus:ring-0 placeholder-slate-600"
              placeholder="Name your workout..."
            />
            {!todayWorkout && (
              <p className="text-xs text-orange-400 mt-2 flex items-center justify-center gap-1">
                <AlertCircle size={12} /> No AI plan scheduled for today. Logging as freestyle.
              </p>
            )}
          </div>

          {/* 2. Key Stats Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between mb-4">
                <label className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                  <Clock size={14} className="text-teal-400"/> Duration
                </label>
                <span className="text-xl font-bold text-white">{formData.duration} <span className="text-sm text-slate-500">mins</span></span>
              </div>
              <input 
                type="range" 
                min="10" max="180" step="5"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Calories (Optional Override) */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between mb-4">
                <label className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                  <Flame size={14} className="text-orange-500"/> Intensity / Burn
                </label>
                <span className="text-xl font-bold text-white">{formData.calories} <span className="text-sm text-slate-500">cals</span></span>
              </div>
              <input 
                type="range" 
                min="50" max="1000" step="10"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: Number(e.target.value)})}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>

          {/* 3. Mood Selector */}
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 block">How did it feel?</label>
            <div className="grid grid-cols-4 gap-3">
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({...formData, mood: m})}
                  className={`py-3 rounded-xl text-sm font-bold transition border ${
                    formData.mood === m 
                    ? 'bg-teal-500 text-slate-900 border-teal-500' 
                    : 'bg-slate-900 text-slate-400 border-white/5 hover:border-teal-500/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Exercise List (Read Only / Confirmation) */}
          {formData.exercises.length > 0 && (
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                <Dumbbell size={14} /> Exercises Completed
              </h3>
              <ul className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {formData.exercises.map((ex, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-teal-500/50" />
                    <span>{ex.name || ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Action */}
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            {submitting ? 'Saving...' : (
              <>
                Finish Workout <Save size={20} />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LogWorkout;