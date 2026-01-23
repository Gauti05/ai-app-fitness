const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path'); // <--- IMPORT PATH

dotenv.config();
connectDB();

// --- REGISTER MODELS ---
require('./models/User');
require('./models/Profile');
require('./models/Workout');
require('./models/MealPlan');
require('./models/WorkoutLog');

const app = express();

app.use(express.json());
app.use(cors());

// Define API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes')); 
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));

// -------------------------------------------------------------------------
//  DEPLOYMENT LOGIC (SERVE FRONTEND)
// -------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  // 1. Tell Express to serve the static files from the React build folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // 2. Catch-all handler: For any request that isn't an API call, send the React App
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // Simple message for local development
  app.get('/', (req, res) => res.send('API is running...'));
}
// -------------------------------------------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// dotenv.config();
// connectDB();

// // --- REGISTER MODELS MANUALLY TO PREVENT SCHEMA ERRORS ---
// // This ensures that 'user' is known to Mongoose before routes use it
// require('./models/User');
// require('./models/Profile');
// require('./models/Workout');
// require('./models/MealPlan');
// require('./models/WorkoutLog');
// // ---------------------------------------------------------

// const app = express();

// app.use(express.json());
// app.use(cors());

// // Define Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/profile', require('./routes/profileRoutes')); 
// app.use('/api/ai', require('./routes/aiRoutes'));
// app.use('/api/tracking', require('./routes/trackingRoutes'));

// app.get('/', (req, res) => res.send('API is running...'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));