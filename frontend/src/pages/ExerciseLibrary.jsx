import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  Search, BookOpen, AlertTriangle, CheckCircle2, ChevronLeft, 
  Loader, Youtube, Play, ExternalLink, Zap
} from 'lucide-react';

const ExerciseLibrary = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reusable function for both Search and Tags
  const fetchExercise = async (name) => {
    if (!name) return;
    setLoading(true);
    setError('');
    setData(null);
    setQuery(name); // Update input if tag was clicked

    try {
      // Endpoint matches backend controller 'explainExercise'
      const res = await api.post('/ai/explain-exercise', { exerciseName: name });
      setData(res.data);
    } catch (err) {
      setError("System busy. Try searching for 'Squat' or 'Deadlifts' which are cached.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExercise(query);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-6 relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>

      <div className="max-w-3xl w-full relative z-10 mt-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black italic">EXERCISE <span className="text-indigo-400">WIKI</span></h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search any exercise (e.g., 'Face Pulls')" 
            className="w-full p-6 pl-14 bg-slate-800 border border-white/10 rounded-2xl text-lg focus:outline-none focus:border-indigo-500 transition shadow-2xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-5 top-7 text-slate-500" size={24} />
          <button 
            type="submit" 
            disabled={loading || !query}
            className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-500 rounded-xl font-bold hover:bg-indigo-400 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : "Analyze"}
          </button>
        </form>

        {/* --- QUICK TAGS (For Testing Caching) --- */}
        {!data && !loading && (
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <span className="text-xs font-bold text-slate-500 uppercase py-2">Popular / Cached:</span>
            {['Deadlifts', 'Squat', 'Bench Press', 'Pull Up'].map((tag) => (
              <button
                key={tag}
                onClick={() => fetchExercise(tag)}
                className="px-4 py-2 bg-slate-800 border border-white/5 rounded-full text-sm font-medium text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition flex items-center gap-2"
              >
                <Zap size={12} className={tag === 'Deadlifts' || tag === 'Squat' ? "text-yellow-400 fill-yellow-400" : "text-slate-500"} />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center mb-6">
            {error}
          </div>
        )}

        {/* Results Area */}
        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. MAIN INFO CARD */}
            <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/10 pb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white capitalize">{data.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.targetMuscles.map(m => (
                      <span key={m} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase rounded-full border border-indigo-500/20">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2 bg-slate-900 rounded-lg border border-white/10 text-xs font-bold uppercase text-slate-400 shrink-0">
                  {data.difficulty}
                </div>
              </div>

              {/* VIDEO TUTORIAL SECTION */}
              <div className="mb-8">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-red-400 mb-4">
                     <Youtube size={20} /> Video Tutorial
                  </h3>
                  
                  {/* Clickable Video Card */}
                  <a 
                    href={`https://www.youtube.com/results?search_query=${data.name}+proper+form`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block w-full h-48 bg-slate-900 rounded-2xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-all"
                  >
                    {/* Fake Thumbnail Background */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition duration-700"></div>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition"></div>
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                           <Play size={24} fill="white" className="text-white ml-1" />
                        </div>
                        <p className="mt-3 font-bold text-white flex items-center gap-2">
                           Watch Form Guide <ExternalLink size={14} />
                        </p>
                    </div>
                  </a>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Instructions */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-teal-400 mb-4">
                    <CheckCircle2 size={20} /> Execution
                  </h3>
                  <ul className="space-y-3">
                    {data.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4 text-slate-300 leading-relaxed text-sm">
                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mistakes */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-orange-400 mb-4">
                    <AlertTriangle size={20} /> Common Mistakes
                  </h3>
                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-6">
                    <ul className="space-y-3">
                      {data.commonMistakes.map((mistake, i) => (
                        <li key={i} className="text-orange-200/80 text-sm flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Empty State Hint */}
        {!data && !loading && !error && (
          <div className="text-center text-slate-500 mt-20">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>Type an exercise name or click a tag for instant AI coaching.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExerciseLibrary;