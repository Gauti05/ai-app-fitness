import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  Utensils, RefreshCw, Leaf, Beef, X, Pill,
  ShoppingBag, Flame, Loader, AlertCircle, HeartPulse, Check, PlusCircle
} from 'lucide-react';

const Nutrition = () => {
  const [activeTab, setActiveTab] = useState('meals'); // 'meals' or 'supplements'
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Data States
  const [mealPlan, setMealPlan] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [activeDay, setActiveDay] = useState(0); 

  // Modal State
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);

  const conditionsList = [
    "Diabetes (Type 2)", "PCOD / PCOS", "Hypertension (High BP)", 
    "Thyroid (Hypo)", "High Cholesterol", "Gluten Intolerance", "Lactose Intolerance"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mealRes, suppRes] = await Promise.all([
        api.get('/ai/meal-plan').catch(() => ({ data: { plan: null } })),
        api.get('/ai/supplements').catch(() => ({ data: { stack: [] } }))
      ]);
      
      if (mealRes.data) setMealPlan(mealRes.data.plan);
      if (suppRes.data) setSupplements(suppRes.data.stack || []);
      
    } catch (err) {
      console.log("Error loading nutrition data");
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = (condition) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(prev => prev.filter(c => c !== condition));
    } else {
      setSelectedConditions(prev => [...prev, condition]);
    }
  };

  // Unified Generator Function
  const handleGenerate = async () => {
    setGenerating(true);
    setShowHealthModal(false);
    
    try {
      if (activeTab === 'meals') {
        const res = await api.post('/ai/generate-meal', { healthConditions: selectedConditions });
        setMealPlan(res.data.plan);
        toast.success("Meal Plan Created! 🥗");
      } else {
        const res = await api.post('/ai/generate-supplements', { healthConditions: selectedConditions });
        setSupplements(res.data.stack);
        toast.success("Supplement Stack Designed! 💊");
      }
    } catch (err) {
      toast.error("AI is busy. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
      <Loader className="animate-spin w-10 h-10" />
    </div>
  );

  // --- DATA PREP ---
  const macros = mealPlan?.macros || { protein: '0g', carbs: '0g', fats: '0g', calories: 0 };
  const parseMacro = (str) => parseInt(str?.replace('g', '')) || 0;
  const macroData = [
    { name: 'Protein', value: parseMacro(macros.protein), color: '#2dd4bf' }, 
    { name: 'Carbs', value: parseMacro(macros.carbs), color: '#fb923c' },   
    { name: 'Fats', value: parseMacro(macros.fats), color: '#facc15' },     
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 md:p-10 relative overflow-hidden pb-24">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-900 to-slate-900"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-400 mb-1">
              <Utensils size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Nutrition Protocol</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black italic uppercase">Kitchen <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Intelligence</span></h1>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('meals')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'meals' ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Meal Plan
            </button>
            <button 
              onClick={() => setActiveTab('supplements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'supplements' ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Pill size={14} /> Supplements
            </button>
          </div>
        </div>

        {/* --- VIEW 1: MEAL PLAN --- */}
        {activeTab === 'meals' && (
          mealPlan ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
              {/* Macros */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-slate-300 mb-6 flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} /> Daily Targets
                  </h3>
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={macroData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} itemStyle={{ fontWeight: 'bold' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                      <span className="text-2xl font-black text-white">{macros.calories}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Kcal</span>
                    </div>
                  </div>
                </div>
                 <button 
                  onClick={() => setShowHealthModal(true)}
                  className="w-full py-3 bg-slate-800 border border-white/10 hover:border-teal-500/50 rounded-xl text-sm font-bold transition text-slate-300 hover:text-white flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Regenerate Plan
                </button>
              </div>

              {/* Schedule */}
              <div className="lg:col-span-2">
                <div className="flex overflow-x-auto pb-4 gap-3 mb-4 custom-scrollbar">
                  {mealPlan.schedule.map((day, idx) => (
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

                <div className="space-y-4">
                  {mealPlan.schedule[activeDay]?.meals ? (
                    Object.entries(mealPlan.schedule[activeDay].meals).map(([type, food], idx) => (
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
                  ) : <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl">No meals found.</div>}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={<Utensils size={40}/>} title="No Meal Plan" desc="Generate a diet plan tailored to your goals." action={() => setShowHealthModal(true)} />
          )
        )}

        {/* --- VIEW 2: SUPPLEMENTS (NEW) --- */}
        {activeTab === 'supplements' && (
          supplements && supplements.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-6">
                <p className="text-slate-400 text-sm">
                  Based on your goals and health profile, here is your optimal stack.
                  <span className="block text-xs text-red-400 mt-1">* Consult a doctor before starting any new supplement.</span>
                </p>
                <button onClick={() => setShowHealthModal(true)} className="text-xs font-bold text-teal-400 hover:text-white flex items-center gap-1">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplements.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-white/10 hover:border-teal-500/40 rounded-2xl p-6 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-900 rounded-xl border border-white/5 text-teal-400">
                        <Pill size={24} />
                      </div>
                      <span className="px-2 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase rounded border border-teal-500/20">
                        {item.timing}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-teal-200/80 font-mono mb-4">{item.dosage}</p>
                    
                    <div className="space-y-3">
                      <div className="text-sm text-slate-400 leading-relaxed">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Why?</span>
                        {item.reason}
                      </div>
                      {item.warning && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-200">
                          <AlertCircle size={14} className="shrink-0 mt-0.5" />
                          {item.warning}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <EmptyState icon={<Pill size={40}/>} title="No Stack Found" desc="Let AI build a safe supplement protocol for you." action={() => setShowHealthModal(true)} />
          )
        )}
      </div>

      {/* --- HEALTH MODAL (Reusable for both) --- */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-white/10 p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-black italic text-white flex items-center gap-2">
                <HeartPulse className="text-red-500" /> HEALTH FACTORS
              </h3>
              <button onClick={() => setShowHealthModal(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X size={20} className="text-slate-400" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-6">Select conditions so the AI can filter {activeTab === 'meals' ? 'ingredients' : 'supplements'} for safety.</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {conditionsList.map((condition) => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`flex items-center justify-between p-4 rounded-xl text-xs font-bold transition border ${selectedConditions.includes(condition) ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20'}`}
                >
                  {condition} {selectedConditions.includes(condition) && <Check size={14} />}
                </button>
              ))}
            </div>
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 font-black uppercase rounded-xl shadow-lg shadow-teal-500/20 transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {generating ? <Loader className="animate-spin" /> : <RefreshCw />}
              Generate {activeTab === 'meals' ? 'Meal Plan' : 'Stack'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon, title, desc, action }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center text-center border border-dashed border-slate-700 rounded-3xl p-8">
    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-white/10">
      {React.cloneElement(icon, { className: "text-slate-500" })}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-500 mb-6 max-w-xs mx-auto">{desc}</p>
    <button onClick={action} className="px-8 py-3 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition">
      Start Generator
    </button>
  </div>
);

export default Nutrition;