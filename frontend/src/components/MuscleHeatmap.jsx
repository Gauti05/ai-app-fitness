import React, { useEffect, useState } from 'react';
import api from '../api';
import { Loader, Activity } from 'lucide-react';

const MuscleHeatmap = () => {
  const [muscleStatus, setMuscleStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMuscleData = async () => {
      try {
        // Fetch last 10 workouts
        const res = await api.get('/tracking/history');
        const logs = res.data;

        // Logic: Calculate "Heat" based on recency
        const heatMap = {};
        const now = new Date();

        logs.forEach(log => {
          const logDate = new Date(log.date);
          const hoursSince = (now - logDate) / (1000 * 60 * 60);
          
          // Only look at last 72 hours (3 days)
          if (hoursSince < 72) {
            // We assume log.exercises contains strings or objects with targetMuscles
            // Note: In a real app, you'd parse the specific exercises. 
            // For now, we will infer based on the "Workout Day Name" or AI Plan tags if available.
            // Simplified for Demo: We map common words in workout names to muscles.
            
            const text = (log.workoutDay + " " + (log.focus || "")).toLowerCase();
            
            let impacted = [];
            if (text.includes('push') || text.includes('chest')) impacted.push('chest', 'shoulders', 'triceps');
            if (text.includes('pull') || text.includes('back')) impacted.push('back', 'biceps', 'lats');
            if (text.includes('leg') || text.includes('squat')) impacted.push('quads', 'hamstrings', 'glutes', 'calves');
            if (text.includes('arm')) impacted.push('biceps', 'triceps');
            if (text.includes('abs') || text.includes('core')) impacted.push('abs');

            // Apply Heat Score (Newer = Hotter)
            impacted.forEach(muscle => {
              // Score: 3 (Freshly trained < 24h) to 1 (Recovering > 48h)
              let score = hoursSince < 24 ? 3 : hoursSince < 48 ? 2 : 1;
              heatMap[muscle] = Math.max(heatMap[muscle] || 0, score);
            });
          }
        });

        setMuscleStatus(heatMap);
        setLoading(false);
      } catch (err) {
        console.error("Heatmap Error", err);
        setLoading(false);
      }
    };
    fetchMuscleData();
  }, []);

  // Helper to get color based on heat score
  const getColor = (muscleName) => {
    const score = muscleStatus[muscleName] || 0;
    if (score === 3) return "#ef4444"; // Red (Fatigued)
    if (score === 2) return "#f97316"; // Orange (Recovering)
    if (score === 1) return "#eab308"; // Yellow (Okay)
    return "#334155"; // Slate-700 (Fresh)
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader className="animate-spin text-teal-400" /></div>;

  return (
    <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Activity size={18} className="text-teal-400" /> Muscle Recovery Status
          </h3>
          <p className="text-xs text-slate-400 mt-1">Based on training logs (Last 72h)</p>
        </div>
        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Fatigue</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Recovering</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700"></span> Fresh</span>
        </div>
      </div>

      <div className="flex justify-center gap-8 h-64">
        {/* FRONT BODY SVG */}
        <svg viewBox="0 0 200 400" className="h-full drop-shadow-xl">
          {/* Head */}
          <circle cx="100" cy="30" r="20" fill="#1e293b" />
          {/* Chest (Pecs) */}
          <path d="M70,60 Q100,90 130,60 L130,100 Q100,120 70,100 Z" fill={getColor('chest')} stroke="#0f172a" strokeWidth="2" />
          {/* Abs */}
          <rect x="80" y="105" width="40" height="60" rx="5" fill={getColor('abs')} stroke="#0f172a" strokeWidth="2" />
          {/* Shoulders (Delts) */}
          <circle cx="60" cy="65" r="15" fill={getColor('shoulders')} stroke="#0f172a" strokeWidth="2" />
          <circle cx="140" cy="65" r="15" fill={getColor('shoulders')} stroke="#0f172a" strokeWidth="2" />
          {/* Arms (Biceps) */}
          <rect x="45" y="80" width="15" height="40" rx="5" fill={getColor('biceps')} stroke="#0f172a" strokeWidth="2" />
          <rect x="140" y="80" width="15" height="40" rx="5" fill={getColor('biceps')} stroke="#0f172a" strokeWidth="2" />
          {/* Quads */}
          <path d="M75,170 L100,170 L100,260 L80,260 Z" fill={getColor('quads')} stroke="#0f172a" strokeWidth="2" />
          <path d="M125,170 L100,170 L100,260 L120,260 Z" fill={getColor('quads')} stroke="#0f172a" strokeWidth="2" />
        </svg>

        {/* BACK BODY SVG */}
        <svg viewBox="0 0 200 400" className="h-full drop-shadow-xl">
           {/* Head */}
           <circle cx="100" cy="30" r="20" fill="#1e293b" />
           {/* Upper Back (Traps/Lats) */}
           <path d="M60,60 L140,60 L120,130 L80,130 Z" fill={getColor('back')} stroke="#0f172a" strokeWidth="2" />
           {/* Lower Back */}
           <rect x="80" y="130" width="40" height="30" rx="5" fill={getColor('back')} stroke="#0f172a" strokeWidth="2" />
           {/* Triceps */}
           <rect x="45" y="80" width="15" height="40" rx="5" fill={getColor('triceps')} stroke="#0f172a" strokeWidth="2" />
           <rect x="140" y="80" width="15" height="40" rx="5" fill={getColor('triceps')} stroke="#0f172a" strokeWidth="2" />
           {/* Glutes */}
           <circle cx="85" cy="180" r="15" fill={getColor('glutes')} stroke="#0f172a" strokeWidth="2" />
           <circle cx="115" cy="180" r="15" fill={getColor('glutes')} stroke="#0f172a" strokeWidth="2" />
           {/* Hamstrings */}
           <rect x="75" y="200" width="20" height="60" rx="5" fill={getColor('hamstrings')} stroke="#0f172a" strokeWidth="2" />
           <rect x="105" y="200" width="20" height="60" rx="5" fill={getColor('hamstrings')} stroke="#0f172a" strokeWidth="2" />
           {/* Calves */}
           <ellipse cx="85" cy="290" rx="10" ry="25" fill={getColor('calves')} stroke="#0f172a" strokeWidth="2" />
           <ellipse cx="115" cy="290" rx="10" ry="25" fill={getColor('calves')} stroke="#0f172a" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default MuscleHeatmap;