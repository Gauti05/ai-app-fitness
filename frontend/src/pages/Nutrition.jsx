import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  Utensils, ChevronLeft, RefreshCcw, Leaf, Flame, Droplets 
} from 'lucide-react';

const Nutrition = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await api.get('/ai/meal-plan');
      setPlan(res.data.plan);
    } catch (err) {
      console.log("No meal plan found");
    } finally {
      setLoading(false);
    }
  };

// Inside Nutrition.jsx

const handleGenerate = async () => {
  setGenerating(true);
  try {
    // This POST request triggers the backend fix above
    const res = await api.post('/ai/generate-meal'); 
    setPlan(res.data.plan); // This updates the UI immediately with the new diet
    toast.success("Meal plan updated for your new diet!");
  } catch (err) {
    toast.error("Error generating new meal plan.");
  } finally {
    setGenerating(false);
  }
};
  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <RefreshCcw className="w-10 h-10 animate-spin" />
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-slate-900/80"></div>

      <div className="relative z-10 max-w-lg">
        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-500/30">
          <Utensils className="w-10 h-10 text-teal-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Fuel Your Gains</h2>
        <p className="text-slate-400 mb-8 text-lg">
          Your AI nutritionist is ready to build a 7-day meal plan based on your current diet preferences and calorie needs.
        </p>
        
        <button 
          onClick={handleGenerate} 
          disabled={generating}
          className="px-8 py-4 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition shadow-xl shadow-teal-500/20 flex items-center gap-3 mx-auto disabled:opacity-50"
        >
          {generating ? (
            <>Thinking... <RefreshCcw className="animate-spin" /></>
          ) : (
            <>Generate Meal Plan <Utensils size={20} /></>
          )}
        </button>
        
        <div className="mt-6">
          <Link to="/dashboard" className="text-slate-500 hover:text-white transition">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );

  const schedule = plan.schedule; 
  const currentDay = schedule[activeDay];
  const macros = plan.macros;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 bg-slate-950 border-r border-white/10 flex flex-col h-auto md:h-screen overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition">
            <ChevronLeft size={20} />
          </Link>
          <span className="font-bold tracking-wider uppercase text-sm text-slate-400">Meal Schedule</span>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {schedule.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                activeDay === index 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-900/20' 
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="font-bold text-sm">{day.day}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 h-screen overflow-y-auto bg-slate-900 relative">
        <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900"></div>

        <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10">
          
          <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard icon={<Flame className="text-orange-500" />} label="Calories" value={macros.calories} />
            <MacroCard icon={<Leaf className="text-blue-400" />} label="Protein" value={macros.protein} />
            <MacroCard icon={<Leaf className="text-emerald-400" />} label="Carbs" value={macros.carbs} />
            <MacroCard icon={<Droplets className="text-yellow-400" />} label="Fats" value={macros.fats} />
          </div>

          <h1 className="text-3xl font-black italic text-white mb-8 flex items-center gap-3">
             <Utensils className="text-emerald-400" /> {currentDay.day}'s Menu
          </h1>

          <div className="space-y-6">
            <MealCard title="Breakfast" food={currentDay.meals.breakfast} />
            <MealCard title="Lunch" food={currentDay.meals.lunch} />
            <MealCard title="Snack" food={currentDay.meals.snack} />
            <MealCard title="Dinner" food={currentDay.meals.dinner} />
          </div>

          <div className="mt-12 text-center">
             <button onClick={handleGenerate} className="text-xs text-slate-500 hover:text-emerald-400 flex items-center justify-center gap-2 mx-auto">
               <RefreshCcw size={12} /> Regenerate Plan (Using Updated Stats)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MacroCard = ({ icon, label, value }) => (
  <div className="bg-slate-800/60 border border-white/10 p-4 rounded-xl flex items-center gap-3">
    <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  </div>
);

const MealCard = ({ title, food }) => (
  <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition">
    <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-2">{title}</h3>
    <p className="text-white text-lg font-medium leading-relaxed">{food}</p>
  </div>
);

export default Nutrition;