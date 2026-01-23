import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup'; // <--- NEW USER FLOW
import WorkoutPlan from './pages/WorkoutPlan';
import Nutrition from './pages/Nutrition';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Chatbot from './components/Chatbot';
import Setup from './pages/Setup'; // <--- EXISTING USER FLOW (Update Stats)
import LogWorkout from './pages/LogWorkout';

function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }} 
      />

      <Chatbot />
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* --- 1. NEW USER ROUTE (Empty Form) --- */}
        <Route path="/profile-setup" element={<ProfileSetup />} />
        
        {/* --- 2. EXISTING USER ROUTE (Update Stats) --- */}
        <Route path="/setup" element={<Setup />} /> 
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workout-plan" element={<WorkoutPlan />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/history" element={<History />} /> 
        <Route path="/library" element={<ExerciseLibrary />} />

        <Route path="/log" element={<LogWorkout />} />
      </Routes>
    </>
  );
}

export default App;