import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, Zap, Brain, ChevronRight, ScanLine, Dumbbell, Play, 
  User, Cpu, Target, Heart, Battery 
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="relative min-h-screen font-sans text-white selection:bg-cyan-400 selection:text-black overflow-x-hidden bg-slate-900">
      
      {/* ================= BACKGROUND LAYERS ================= */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
      ></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950/90"></div>
      <div className="fixed inset-0 z-0 bg-cyan-500/5 mix-blend-overlay pointer-events-none"></div>

      {/* ================= CONTENT ================= */}

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.6)]">
              <Dumbbell className="w-6 h-6 text-black transform -rotate-45" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white italic drop-shadow-md">
              TRAINER<span className="text-cyan-400">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden text-sm font-bold text-white transition md:block hover:text-cyan-400 hover:tracking-widest uppercase drop-shadow-md">
              Login
            </Link>
            <Link to="/signup" className="px-6 py-2 text-sm font-black text-black uppercase bg-white rounded-sm hover:bg-cyan-400 hover:scale-105 transition-all skew-x-[-10deg] shadow-lg">
              <span className="inline-block skew-x-[10deg]">Start Free</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 grid items-center gap-16 pt-36 pb-20 px-6 max-w-7xl mx-auto lg:grid-cols-2">
        
        {/* LEFT: TEXT COPY */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-cyan-400/50 bg-black/60 rounded-sm backdrop-blur-md">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-cyan-400"></span>
              <span className="relative inline-flex w-2 h-2 rounded-full bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-widest uppercase">AI Model v2.0 Live</span>
          </div>

          <h1 className="mb-6 text-6xl font-black leading-none text-white md:text-8xl drop-shadow-xl italic">
            TRAIN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
              SMARTER.
            </span>
          </h1>

          <p className="max-w-lg mb-10 text-xl font-bold leading-relaxed text-slate-100 drop-shadow-lg">
            Stop guessing. The first AI that treats your biology like data. Get a scientifically perfect workout split in seconds.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/signup" className="group relative px-8 py-4 bg-cyan-500 text-black font-black text-lg uppercase skew-x-[-10deg] hover:bg-white transition-colors shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <span className="flex items-center gap-2 inline-block skew-x-[10deg]">
                Generate Plan <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </span>
            </Link>
            
            <button className="px-8 py-4 border-2 border-white text-white font-bold text-lg uppercase skew-x-[-10deg] hover:bg-black/50 hover:border-cyan-400 hover:text-cyan-400 transition backdrop-blur-sm">
              <span className="flex items-center gap-2 inline-block skew-x-[10deg]">
                 <Play className="w-4 h-4 fill-current" /> Demo
              </span>
            </button>
          </div>
        </motion.div>

        {/* RIGHT: THE HUD (UPDATED WITH BODY MAP) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-md mx-auto w-full flex flex-col gap-4"
        >

          {/* ================= SECTION 1: WIDGETS ================= */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* BOX 2: HEART RATE */}
            <div className="relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-xl backdrop-blur-md">
                <div className="bg-black/80 rounded-lg border border-white/10 p-4 h-full">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono tracking-wider text-slate-400">HEART RATE</span>
                        <Heart className="w-3 h-3 text-red-500 animate-pulse" />
                    </div>
                    
                    <div className="h-10 flex items-end gap-1 mb-1">
                        <motion.div initial={{ height: '30%' }} animate={{ height: ['30%', '60%', '40%', '80%', '50%'] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 bg-cyan-500/30 rounded-sm" />
                        <motion.div initial={{ height: '50%' }} animate={{ height: ['50%', '30%', '70%', '40%', '60%'] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-1.5 bg-cyan-500/50 rounded-sm" />
                        <motion.div initial={{ height: '70%' }} animate={{ height: ['70%', '50%', '80%', '60%', '90%'] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 bg-cyan-500 rounded-sm" />
                        <motion.div initial={{ height: '40%' }} animate={{ height: ['40%', '80%', '30%', '70%', '50%'] }} transition={{ duration: 3, repeat: Infinity }} className="w-1.5 bg-cyan-500/50 rounded-sm" />
                        <motion.div initial={{ height: '60%' }} animate={{ height: ['60%', '40%', '70%', '50%', '80%'] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 bg-cyan-500/30 rounded-sm" />
                    </div>
                    <div className="text-xl font-bold text-white leading-none">62 <span className="text-[10px] text-slate-500 font-normal">BPM</span></div>
                </div>
            </div>

            {/* BOX 3: RECOVERY */}
            <div className="relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-xl backdrop-blur-md">
                <div className="bg-black/80 rounded-lg border border-white/10 p-4 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono tracking-wider text-slate-400">RECOVERY</span>
                        <Battery className="w-3 h-3 text-green-400" />
                    </div>
                    
                    <div>
                        <div className="text-right text-lg font-bold text-green-400 mb-1">94%</div>
                        <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '94%' }}
                                transition={{ delay: 2, duration: 1.5 }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full"
                            />
                        </div>
                        <div className="text-[9px] text-slate-500 mt-2 text-right">READY TO TRAIN</div>
                    </div>
                </div>
            </div>

          </div>

          {/* ================= SECTION 2: MUSCLE HEATMAP VISUALIZER ================= */}
          <div className="relative p-1 bg-gradient-to-br from-white/20 to-transparent rounded-2xl backdrop-blur-md shadow-2xl">
            <div className="bg-black/90 rounded-xl border border-white/10 p-5 overflow-hidden relative">
              
              {/* Scan Line Animation */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20 opacity-40 pointer-events-none"
              />

              {/* Header */}
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                 <div className="flex items-center gap-2 text-cyan-400">
                    <ScanLine className="w-4 h-4" />
                    <span className="font-mono text-xs font-bold tracking-widest">BODY_SCAN.AI</span>
                 </div>
                 <div className="flex gap-2 text-[8px] font-mono text-slate-500">
                   <span className="text-red-500">FATIGUE</span> / <span className="text-slate-300">FRESH</span>
                 </div>
              </div>

              {/* BODY MAP VISUAL */}
              <div className="flex items-center justify-between gap-4">
                
                {/* SVG Body Map (Simplified for Landing) */}
                <div className="h-32 w-1/3 flex justify-center relative">
                   <svg viewBox="0 0 200 400" className="h-full drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                      <path d="M70,60 Q100,90 130,60 L130,100 Q100,120 70,100 Z" fill="#ef4444" opacity="0.8" /> {/* Chest - Red */}
                      <rect x="80" y="105" width="40" height="60" rx="5" fill="#334155" /> {/* Abs */}
                      <circle cx="60" cy="65" r="15" fill="#f97316" /> {/* Shoulders - Orange */}
                      <circle cx="140" cy="65" r="15" fill="#f97316" />
                      <rect x="45" y="80" width="15" height="40" rx="5" fill="#334155" /> {/* Arms */}
                      <rect x="140" y="80" width="15" height="40" rx="5" fill="#334155" />
                      <path d="M75,170 L100,170 L100,260 L80,260 Z" fill="#334155" /> {/* Legs */}
                      <path d="M125,170 L100,170 L100,260 L120,260 Z" fill="#334155" />
                   </svg>
                   {/* Scanning Circle Overlay */}
                   <motion.div 
                     animate={{ y: [0, 80, 0] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="absolute w-full h-1 bg-cyan-400 blur-sm opacity-50"
                   />
                </div>

                {/* Data Readout */}
                <div className="w-2/3 space-y-3">
                  <ScannerRow icon={<User className="w-3.5 h-3.5 text-cyan-500" />} label="TARGET" value="CHEST & DELTS" delay={1} />
                  <ScannerRow icon={<Cpu className="w-3.5 h-3.5 text-cyan-500" />} label="STATUS" value="RECOVERY REQ." delay={2} highlight />
                  <ScannerRow icon={<Target className="w-3.5 h-3.5 text-cyan-500" />} label="NEXT" value="LEGS (OPT)" delay={3} />
                </div>
              </div>

              {/* Result Badge */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 4.5, type: "spring" }}
                className="mt-4 p-2 bg-cyan-900/40 border border-cyan-500/30 rounded-lg flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-cyan-400/10 group-hover:bg-cyan-400/20 transition-colors"></div>
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse relative z-10" />
                <span className="text-white font-bold tracking-wide text-[10px] relative z-10">WORKOUT ADAPTED</span>
              </motion.div>

            </div>
          </div>

        </motion.div>
      </div>

      {/* --- FEATURES STRIP --- */}
      <div className="relative z-10 bg-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6">
            <Feature 
              icon={<Brain className="w-8 h-8 text-cyan-400" />}
              title="NEURAL ADAPTATION"
              desc="The AI learns from your logs. If you hit a plateau, it automatically adjusts volume."
            />
            <Feature 
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title="INSTANT NUTRITION"
              desc="Full macro-nutrient breakdown generated in seconds based on your goal."
            />
            <Feature 
              icon={<Activity className="w-8 h-8 text-purple-400" />}
              title="MUSCLE HEATMAP"
              desc="Visualize your progressive overload with our 3D recovery tracking system."
            />
        </div>
      </div>

    </div>
  );
};

// --- SUB COMPONENTS ---

const ScannerRow = ({ icon, label, value, delay, highlight }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex justify-between items-center border-b border-white/5 pb-2 font-mono group"
  >
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-white/5 rounded-md border border-white/10 group-hover:border-cyan-500/50 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] text-slate-400 tracking-widest">{label}</span>
    </div>
    <span className={`text-xs font-bold tracking-wider ${highlight ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-white'}`}>
      {value}
    </span>
  </motion.div>
);

const Feature = ({ icon, title, desc }) => (
  <div className="flex gap-4 items-start p-4 hover:bg-white/5 rounded-xl transition-colors cursor-default">
    <div className="p-3 bg-slate-900 rounded-lg border border-white/10 shadow-lg">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-black italic text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default Landing;