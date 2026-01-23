import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Import the helper we just made

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // 1. Send data to Backend
      const res = await api.post('/auth/register', formData);
      
      // 2. If successful, we get a Token back. Save it!
      localStorage.setItem('token', res.data.token);
      
      console.log('Registered Success:', res.data);
      
      // 3. Redirect to the Dashboard (We will build this next)
      // For now, let's go to Login or a placeholder
      alert('Registration Successful! Redirecting...');
      navigate('/login'); 

    } catch (err) {
      console.error(err);
      // Show error message from backend (e.g., "User already exists")
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-900 font-sans">
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-8 m-4 bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-sm">
            JOIN THE SQUAD
          </h1>
          <p className="mt-2 text-slate-200 font-medium tracking-wide">Build your dream physique with AI.</p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-widest uppercase">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-widest uppercase">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-widest uppercase">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold tracking-wider rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Already a member?{' '}
          <Link to="/login" className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline transition">
            Login here
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Signup;