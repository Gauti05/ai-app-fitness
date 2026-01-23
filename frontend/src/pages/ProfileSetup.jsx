import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  Activity, Ruler, Weight, Target, ChevronRight, 
  User, Utensils, Loader 
} from 'lucide-react';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Clean Empty State for New Users
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    goal: 'Muscle Gain',
    activityLevel: 'Moderately Active',
    dietaryPreference: 'Non-Vegetarian',
    equipment: 'Gym',
  });

  // NO REDIRECTION LOGIC HERE. 
  // If a user lands here, we assume the Dashboard sent them here because they are new.
  // We just let them fill the form.

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create the profile
      await api.post('/profile', formData);
      // alert("Profile Created!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error creating profile");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center fixed"></div>
      <div className="absolute inset-0 bg-slate-900/80 fixed"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/30 to-slate-900/0 fixed pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Panel */}
        <div className="md:w-1/3 bg-slate-900/80 p-8 flex flex-col justify-between border-r border-white/10">
          <div>
            <div className="flex items-center gap-2 text-teal-400 mb-6">
              <Activity className="w-6 h-6" />
              <span className="font-bold tracking-wide text-xs uppercase">
                System Calibration
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">
              Build Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Athlete Profile
              </span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Precision matters. Our AI uses your exact biometrics, diet, and lifestyle to calculate your perfect plan.
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400"><User size={16} /></div>
              <span>Biometrics</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400"><Target size={16} /></div>
              <span>Goal Setting</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400"><Utensils size={16} /></div>
              <span>Nutrition & Diet</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:w-2/3 p-8 md:p-10 bg-slate-900/40 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ROW 1: Basic Stats */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-teal-400 outline-none transition" placeholder="25" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-teal-400 outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weight (kg)</label>
                <div className="relative">
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 pl-10 text-white focus:border-teal-400 outline-none" placeholder="75" required />
                  <Weight className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Height (cm)</label>
                <div className="relative">
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 pl-10 text-white focus:border-teal-400 outline-none" placeholder="180" required />
                  <Ruler className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            {/* ROW 2: Goals & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Goal</label>
                  <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-teal-400 outline-none">
                    <option value="Muscle Gain">Muscle Gain (Hypertrophy)</option>
                    <option value="Fat Loss">Fat Loss (Cutting)</option>
                    <option value="Strength">Strength & Power</option>
                    <option value="Recomposition">Recomposition</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Level</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-teal-400 outline-none">
                    <option value="Sedentary">Sedentary (Desk Job)</option>
                    <option value="Lightly Active">Lightly Active</option>
                    <option value="Moderately Active">Moderately Active</option>
                    <option value="Very Active">Very Active</option>
                  </select>
                </div>
            </div>

            {/* ROW 3: Nutrition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dietary Preference</label>
              <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-teal-400 outline-none">
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain">Jain</option>
              </select>
            </div>

            {/* ROW 4: Equipment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Equipment Access</label>
              <select name="equipment" value={formData.equipment} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-teal-400 outline-none">
                <option value="Gym">Full Commercial Gym</option>
                <option value="Home">Home (Dumbbells/Bands)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold uppercase tracking-wide rounded-lg shadow-lg shadow-teal-500/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (
                <>
                  Generate My Plan 
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;