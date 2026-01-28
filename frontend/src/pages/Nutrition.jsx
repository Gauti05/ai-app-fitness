import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  Utensils, RefreshCw, Leaf, Beef, 
  ShoppingBag, Flame, Loader, AlertCircle 
} from 'lucide-react';

const Nutrition = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0); // 0 = Monday

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const fetchMealPlan = async () => {
    try {
      const res = await api.get('/ai/meal-plan');
      if (res.data) setMealPlan(res.data.plan);
    } catch (err) {
      console.log("No meal plan found");
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/ai/generate-meal');
      setMealPlan(res.data.plan);
      toast.success("Chef AI has cooked up a new plan! 🍳");
    } catch (err) {
      toast.error("AI is busy. Try again in a moment.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <Loader className="animate-spin w-10 h-10" />
    </div>
  );

  // --- VIEW: EMPTY STATE (No Plan) ---
  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center relative overflow-hidden">
         {/* Background Image */}
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
         
         <div className="max-w-md text-center relative z-10">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl shadow-teal-500/10">
            <Utensils size={32} className="text-teal-400" />
          </div>
          <h1 className="text-3xl font-black italic uppercase mb-4">Fuel Your <span className="text-teal-400">Gains</span></h1>
          <p className="text-slate-400 mb-8">
            Nutrition is 70% of the battle. Let our AI Nutritionist build a custom 7-day meal plan based on your goal and dietary preferences.
          </p>
          <button 
            onClick={generateNewPlan}
            disabled={generating}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
          >
            {generating ? <Loader className="animate-spin" /> : <RefreshCw />}
            Generate Meal Plan
          </button>
        </div>
      </div>
    );
  }

  // --- DATA PREP FOR CHARTS ---
  const macros = mealPlan.macros || { protein: '0g', carbs: '0g', fats: '0g', calories: 0 };
  
  // Helper to convert "180g" string to number 180
  const parseMacro = (str) => parseInt(str?.replace('g', '')) || 0;
  
  const macroData = [
    { name: 'Protein', value: parseMacro(macros.protein), color: '#2dd4bf' }, // Teal
    { name: 'Carbs', value: parseMacro(macros.carbs), color: '#fb923c' },   // Orange
    { name: 'Fats', value: parseMacro(macros.fats), color: '#facc15' },     // Yellow
  ];

  const schedule = mealPlan.schedule || [];
  const currentDayPlan = schedule[activeDay] || {};

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-6 md:p-10 relative overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-900 to-slate-900"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-teal-400 mb-1">
              <Utensils size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Nutrition Protocol</span>
            </div>
            <h1 className="text-3xl font-black italic uppercase">Kitchen <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Intelligence</span></h1>
          </div>
          <button 
            onClick={generateNewPlan}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-white/10 hover:border-teal-500/50 rounded-lg text-sm font-bold transition text-slate-300 hover:text-white"
          >
            {generating ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Regenerate Plan
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: MACRO BREAKDOWN (The Pro Feature) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. PIE CHART CARD */}
            <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="font-bold text-slate-300 mb-6 flex items-center gap-2">
                <Flame className="text-orange-500" size={20} /> Daily Targets
              </h3>
              
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-2xl font-black text-white">{macros.calories}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Kcal</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <MacroStat label="Protein" value={macros.protein} color="text-teal-400" />
                <MacroStat label="Carbs" value={macros.carbs} color="text-orange-400" />
                <MacroStat label="Fats" value={macros.fats} color="text-yellow-400" />
              </div>
            </div>

            {/* 2. SHOPPING TIP */}
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-5 flex gap-4 items-start">
              <ShoppingBag className="text-teal-400 shrink-0" />
              <div>
                <h4 className="font-bold text-teal-400 text-sm mb-1">Shopping List Tip</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stick to the outer aisles of the grocery store. That's where the fresh protein and produce live. Processed food is in the middle!
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: MEAL SCHEDULE */}
          <div className="lg:col-span-2">
            
            {/* Day Selector (Horizontal Scroll) */}
            <div className="flex overflow-x-auto pb-4 gap-3 mb-4 custom-scrollbar">
              {schedule.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm transition border whitespace-nowrap ${
                    activeDay === idx 
                      ? 'bg-teal-500 text-slate-900 border-teal-500 shadow-lg shadow-teal-500/20' 
                      : 'bg-slate-800 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {day.day}
                </button>
              ))}
            </div>

            {/* Meal Cards */}
            <div className="space-y-4">
              {currentDayPlan.meals ? (
                Object.entries(currentDayPlan.meals).map(([type, food], idx) => (
                  <div key={idx} className="group bg-slate-800/60 border border-white/5 hover:border-teal-500/30 rounded-2xl p-6 transition-all flex gap-5 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 group-hover:scale-110 transition shrink-0">
                      {type === 'breakfast' && <Leaf size={20} className="text-green-400" />}
                      {type === 'lunch' && <Beef size={20} className="text-red-400" />}
                      {type === 'dinner' && <Utensils size={20} className="text-teal-400" />}
                      {type === 'snack' && <Leaf size={20} className="text-yellow-400" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{type}</h4>
                      <p className="text-lg font-medium text-white">{food}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl">
                   <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                   <p className="text-slate-500">Select a day to view the menu.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Simple sub-component for Macro Grid
const MacroStat = ({ label, value, color }) => (
  <div className="text-center p-3 bg-slate-900/50 rounded-xl border border-white/5">
    <p className={`text-sm font-black ${color}`}>{value}</p>
    <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
  </div>
);

export default Nutrition;