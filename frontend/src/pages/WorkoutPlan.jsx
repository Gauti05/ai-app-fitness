import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import html2canvas from 'html2canvas'; 
import { 
  Calendar, Dumbbell, Clock, AlertCircle, ChevronLeft, 
  CheckCircle2, Flame, RefreshCcw, X, Youtube, ExternalLink, 
  Check, Share2, Download, Zap, Trophy 
} from 'lucide-react';

const WorkoutPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0); 
  const [completedDays, setCompletedDays] = useState([]);

  // --- LOGGING & SHARE STATE ---
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [logData, setLogData] = useState({
    duration: 45, 
    calories: 300,
    mood: 'Good',
    notes: ''
  });

  const shareCardRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [planRes, historyRes] = await Promise.all([
        api.get('/ai/plan'),
        api.get('/tracking/history')
      ]);

      setPlan(planRes.data.plan); 

      if (historyRes.data) {
        const recentLogs = historyRes.data;
        const now = new Date();
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));

        const doneDays = recentLogs
          .filter(log => new Date(log.date) > oneWeekAgo)
          .map(log => log.workoutDay);
        
        setCompletedDays(doneDays);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const openTutorial = (exerciseName) => {
    const query = encodeURIComponent(`${exerciseName} exercise tutorial proper form`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenLog = () => {
    setShowModal(true);
    setShowSuccess(false); 
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
        workoutDay: dayName,
        duration: Number(logData.duration),
        calories: Number(logData.calories),
        mood: logData.mood,
        notes: logData.notes,
        date: new Date()
      };

      await api.post('/tracking/log', payload);
      
      toast.success("Workout Logged!");
      setCompletedDays(prev => [...prev, dayName]);
      
      setShowSuccess(true); 

    } catch (err) {
      console.error(err);
      toast.error("Failed to log workout.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#0f172a', 
        scale: 2,
        useCORS: true, // Helps with loading external images/fonts
      });

      const image = canvas.toDataURL("image/png");

      const link = document.createElement('a');
      link.href = image;
      link.download = `TrainerAI-Workout-${new Date().toISOString().split('T')[0]}.png`;
      link.click();

      toast.success("Image Saved! Ready to share. 📸");
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Could not generate image.");
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
      <Link to="/setup" className="px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400">
        Generate Plan
      </Link>
    </div>
  );

  const schedule = plan.schedule; 
  const currentDay = schedule[activeDay];
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
                {isDone && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT SIDE: EXERCISES --- */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-900 relative">
        <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500 via-slate-900 to-slate-900"></div>

        <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10 pb-28">
          
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
                      <button onClick={() => openTutorial(exercise.name)} className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition border border-red-500/20 group/btn">
                         <Youtube size={16} className="group-hover/btn:fill-white" /> Watch
                         <ExternalLink size={12} className="opacity-50" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
                      <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/5"><RefreshCcw size={14} className="text-teal-500" /> {exercise.sets} Sets</span>
                      <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/5"><Dumbbell size={14} className="text-teal-500" /> {exercise.reps} Reps</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center pb-10">
            {isCurrentDayDone ? (
               <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 font-bold text-lg rounded-xl flex items-center gap-3 cursor-default">
                 <CheckCircle2 size={24} /> Day Completed
               </div>
            ) : (
               <button onClick={handleOpenLog} className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-slate-900 font-bold text-lg rounded-xl hover:bg-teal-400 hover:scale-105 transition shadow-xl shadow-teal-500/20">
                <CheckCircle2 size={24} /> Mark Workout Complete
               </button>
            )}
          </div>

        </div>
      </div>

      {/* --- HIDDEN SHARE CARD (FIXED) --- */}
      <div className="fixed -left-[9999px]">
        <div ref={shareCardRef} className="w-[400px] h-[600px] bg-slate-900 relative p-8 flex flex-col justify-between border-4 border-teal-500">
           
           {/* DECORATIVE BACKGROUND */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-slate-900 to-slate-900"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-teal-400 font-black text-xl tracking-tighter italic">
                 TRAINER<span className="text-white">AI</span>
              </div>
              
              {/* --- FIXED: Removed 'bg-clip-text', used solid 'text-teal-400' --- */}
              <h1 className="text-5xl font-black text-white italic uppercase leading-none mb-2">
                Workout<br/><span className="text-teal-400">Crushed</span>
              </h1>
              
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{plan?.schedule[activeDay].focus}</p>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 text-center">
                 <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                 <p className="text-3xl font-black text-white">{logData.calories}</p>
                 <p className="text-xs font-bold text-slate-500 uppercase">Calories</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 text-center">
                 <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                 <p className="text-3xl font-black text-white">{logData.duration}</p>
                 <p className="text-xs font-bold text-slate-500 uppercase">Minutes</p>
              </div>
           </div>

           <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20 text-xs font-bold uppercase">
                 <Zap size={12} /> AI Coach Verified
              </div>
              <p className="text-slate-600 text-[10px] mt-4 uppercase font-bold tracking-widest">{new Date().toDateString()}</p>
           </div>
        </div>
      </div>

      {/* --- LOGGING MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl animate-in zoom-in-95">
            
            {!showSuccess ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black italic">COMPLETE SESSION</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X size={20} className="text-slate-400" /></button>
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
              </>
            ) : (
              /* --- SUCCESS VIEW (Uses Trophy) --- */
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/20 animate-bounce">
                  <Trophy size={40} className="text-slate-900" />
                </div>
                <h3 className="text-3xl font-black italic text-white mb-2 uppercase">Workout<br/><span className="text-teal-400">Complete!</span></h3>
                <p className="text-slate-400 mb-8">Great job smashing your goals today.</p>
                
                <div className="space-y-3">
                   <button 
                    onClick={handleShare}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                   >
                     <Share2 size={20} /> Share Stats
                   </button>
                   <button 
                    onClick={() => { setShowModal(false); setShowSuccess(false); navigate('/dashboard'); }}
                    className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase rounded-xl transition"
                   >
                     Dashboard
                   </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default WorkoutPlan;