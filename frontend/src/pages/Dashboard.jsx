import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { 
  BarChart, Bar, Tooltip, ResponsiveContainer, Cell 
} from 'recharts'; 
import api from '../api'; 
import { 
  LayoutDashboard, Dumbbell, Utensils, LogOut, 
  Calendar, Flame, ChevronRight, Zap, Loader, Trophy
} from 'lucide-react';
// --- IMPORT THE NEW HEATMAP COMPONENT ---
import MuscleHeatmap from '../components/MuscleHeatmap';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Track if the user has a VALID profile
  const [hasProfile, setHasProfile] = useState(false);

  const [stats, setStats] = useState({ 
    streak: 0, 
    totalWorkouts: 0,
    level: "Rookie", 
    chartData: [] 
  }); 
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const [userRes, statsRes, profileRes] = await Promise.all([
          api.get('/auth/user'),
          api.get('/tracking/stats'),
          // Return null if 404
          api.get('/profile/me').catch(() => ({ data: null })) 
        ]);

        setUser(userRes.data);
        setStats(statsRes.data); 
        
        // CHECK: Does profile data exist?
        if (profileRes.data && profileRes.data.age) {
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }

        setLoading(false);
      } catch (err) {
        console.error("Data load failed", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  // --- THE CORRECTED LOGIC ---
  const handleGenerateWorkout = async () => {
    // 1. IF NEW USER (No Profile): Go to Profile Setup Page
    if (!hasProfile) {
      // Navigate to the NEW USER page
      navigate('/profile-setup'); 
      return;
    }

    // 2. IF EXISTING USER: Generate Plan immediately
    setGenerating(true);
    try {
      await api.post('/ai/generate'); 
      toast.success("New Plan Generated!");
      navigate('/workout-plan'); 
    } catch (err) {
      toast.error("Error generating plan.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <Zap className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  const displayName = user?.name || "Athlete";
  const userInitial = displayName[0].toUpperCase();

  return (
    // Changed 'flex' to 'flex flex-col md:flex-row' to stack sidebar on mobile
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col md:flex-row relative overflow-hidden">
      
      {/* SIDEBAR */}
      {/* UPDATES FOR MOBILE:
         1. Removed 'hidden'.
         2. Added 'w-full md:w-64' -> Full width on mobile, 64px on desktop.
         3. Added 'h-auto md:h-screen' -> Auto height on mobile, full height on desktop.
         4. Added 'relative md:fixed' -> Scrollable on mobile, fixed on desktop.
         5. Added 'border-b md:border-r' -> Border bottom on mobile, border right on desktop.
      */}
      <aside className="flex flex-col w-full md:w-64 bg-slate-950/60 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 h-auto md:h-screen relative md:fixed z-20">
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center md:block">
          <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">
            TRAINER<span className="text-teal-400">AI</span>
          </span>
          {/* Mobile Logout Icon (Optional tweak to keep header clean) */}
          <button onClick={handleLogout} className="md:hidden text-slate-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </div>
        
        {/* Nav Items Container: Flex Row on Mobile (Scrollable), Flex Col on Desktop */}
        <nav className="flex-1 p-2 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <Link to="/dashboard" className="min-w-fit"><NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active /></Link>
          <Link to="/workout-plan" className="min-w-fit"><NavItem icon={<Dumbbell size={20}/>} label="Workouts" /></Link>
          <Link to="/nutrition" className="min-w-fit"><NavItem icon={<Utensils size={20}/>} label="Nutrition" /></Link>
          <Link to="/leaderboard" className="min-w-fit"><NavItem icon={<Trophy size={20}/>} label="Leaderboard" /></Link>
          <Link to="/history" className="min-w-fit"><NavItem icon={<Calendar size={20}/>} label="History" /></Link>
        </nav>
        
        {/* Desktop Logout Button */}
        <div className="hidden md:block p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
            <LogOut size={20} /> <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      {/* UPDATES FOR MOBILE:
         1. Removed 'md:ml-64' default margin on mobile (added 'md:' prefix).
         2. Added 'mt-0' to ensure no gap.
      */}
      <main className="relative z-10 flex-1 md:ml-64 p-4 md:p-10 bg-slate-900 pb-28">
        <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500 via-slate-900 to-slate-900"></div>
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 md:mb-10 relative z-10">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-white drop-shadow-md">Welcome back, {displayName}</h1>
            <div className="flex items-center gap-2 mt-2">
               <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                 <Trophy size={12} /> Rank: {stats.level}
               </span>
               <p className="text-slate-400 text-sm hidden md:block">Let's crush today's goals.</p>
            </div>
          </div>
          <Link to="/setup" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-slate-900 font-black shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-110 transition shrink-0">
            {userInitial}
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 relative z-10">
          <StatCard icon={<Flame className="text-orange-500" />} label="Streak" value={`${stats.streak} Days`} />
          <StatCard icon={<Dumbbell className="text-blue-400" />} label="Workouts" value={`${stats.totalWorkouts || 0} Total`} />
          
          <div className="col-span-2 md:col-span-2 bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between">
             <div className="flex justify-between items-center mb-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Activity (Last 7 Days)</p>
             </div>
             <div className="h-24 w-full min-w-0">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.chartData || []}>
                   <Tooltip 
                     cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                     contentStyle={{background: '#0f172a', border: '1px solid #334155', borderRadius: '8px'}}
                   />
                   <Bar dataKey="workouts" radius={[4, 4, 0, 0]}>
                     {(stats.chartData || []).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.workouts > 0 ? '#2dd4bf' : '#334155'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* --- MUSCLE RECOVERY HEATMAP --- */}
        <div className="mb-10 relative z-10 overflow-hidden rounded-2xl border border-white/5 bg-slate-800/20">
          <MuscleHeatmap />
        </div>

        {/* Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
          
          <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-teal-500/30 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-teal-500/20 transition duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/20">
                    <Zap size={14} /> AI Coach Ready
                  </div>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">Initialize Training Protocol</h2>
              <p className="text-slate-300 mb-8 max-w-md leading-relaxed text-sm md:text-base">
                  Your AI coach is ready to analyze your biometrics and generate a custom split.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleGenerateWorkout}
                  disabled={generating}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400 transition shadow-lg shadow-teal-500/20 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {generating ? (
                    <>Building Plan <Loader className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Generate Workout <ChevronRight size={20} /></>
                  )}
                </button>

                 <Link to="/workout-plan" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-teal-400 font-bold rounded-lg hover:bg-slate-700 transition border border-teal-500/30">
                  View Current Plan
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-slate-300 mb-4 uppercase text-xs tracking-wider">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/log">
                <div className="w-full flex justify-between items-center p-4 bg-slate-900/40 border border-teal-500/20 rounded-lg hover:border-teal-500 hover:bg-teal-500/10 transition group cursor-pointer">
                  <span className="text-sm font-bold text-teal-400">Log Completed Workout</span>
                  <ChevronRight size={16} className="text-teal-500" />
                </div>
              </Link>
              
              <Link to="/setup"><QuickAction label="Update Stats" /></Link>
              <Link to="/history"><QuickAction label="View History" /></Link>
              <Link to="/library"><QuickAction label="Exercise Library" /></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Update NavItem to behave nicely in horizontal scroll (whitespace-nowrap)
const NavItem = ({ icon, label, active }) => (
  <button className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition whitespace-nowrap ${active ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
    {React.cloneElement(icon, { size: 18 })}
    <span className="font-semibold text-xs md:text-sm">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-800/40 border border-white/10 p-3 md:p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:border-teal-500/30 transition h-full">
    <div className="p-2 md:p-3 bg-slate-900 rounded-lg border border-white/5 shrink-0">{icon}</div>
    <div>
      <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg md:text-xl font-bold text-white truncate">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ label }) => (
  <button className="w-full flex justify-between items-center p-4 bg-slate-900/40 border border-white/5 rounded-lg hover:border-teal-500/50 hover:bg-slate-800 transition group">
    <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
    <ChevronRight size={16} className="text-slate-600 group-hover:text-teal-400" />
  </button>
);

export default Dashboard;