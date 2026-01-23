import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Clipboard, Clock, Flame, AlignLeft, CheckCircle, ChevronLeft 
} from 'lucide-react';

const LogWorkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workoutDay: 'Full Body',
    duration: '',
    calories: '',
    mood: 'Good',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tracking/log', formData);
      toast.success("Workout Logged! Leaderboard updated. 🚀");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-900 to-slate-900"></div>

      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
        
        <Link to="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-wider">
          <ChevronLeft size={16} /> Cancel
        </Link>

        <header className="mb-8">
          <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mb-4 text-teal-400">
            <CheckCircle size={24} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tight">LOG <span className="text-teal-500">SESSION</span></h1>
          <p className="text-slate-400">Record your effort. Build your streak.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Workout Focus */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
              <Clipboard size={14} /> Workout Name
            </label>
            <select 
              value={formData.workoutDay}
              onChange={(e) => setFormData({...formData, workoutDay: e.target.value})}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 focus:border-teal-500 transition outline-none appearance-none"
            >
              <option>Push Day</option>
              <option>Pull Day</option>
              <option>Leg Day</option>
              <option>Full Body</option>
              <option>Cardio</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
                <Clock size={14} /> Duration (min)
              </label>
              <input 
                type="number" required
                placeholder="45"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 focus:border-teal-500 transition outline-none"
              />
            </div>

            {/* Calories */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
                <Flame size={14} /> Calories
              </label>
              <input 
                type="number"
                placeholder="300"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 focus:border-teal-500 transition outline-none"
              />
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">How did it feel?</label>
            <div className="grid grid-cols-4 gap-2">
              {['Great', 'Good', 'Hard', 'Tired'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({...formData, mood: m})}
                  className={`p-2 rounded-lg text-xs font-bold border transition ${
                    formData.mood === m 
                      ? 'bg-teal-500 text-slate-900 border-teal-500' 
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2 mb-2">
              <AlignLeft size={14} /> Notes
            </label>
            <textarea 
              rows="3"
              placeholder="Hit a PR on bench press..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 focus:border-teal-500 transition outline-none resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-teal-500 text-slate-900 font-black rounded-xl hover:bg-teal-400 transition shadow-lg shadow-teal-500/20 disabled:opacity-50 mt-4"
          >
            {loading ? "Saving..." : "CONFIRM LOG"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogWorkout;