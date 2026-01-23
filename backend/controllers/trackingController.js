const WorkoutLog = require('../models/WorkoutLog');
const User = require('../models/User');

// @desc    Log a completed workout
// @route   POST /api/tracking/log
exports.logWorkout = async (req, res) => {
  const { workoutDay, duration, calories, mood, notes } = req.body;

  try {
    // 1. Save the Log
    const newLog = new WorkoutLog({
      user: req.user.id,
      workoutDay,
      duration,
      calories,
      mood,
      notes
    });
    await newLog.save();

    // 2. Update User Stats (Streak Logic)
    const user = await User.findById(req.user.id);
    
    // Increment Total
    user.totalWorkouts = (user.totalWorkouts || 0) + 1;

    // Simple Streak Calculation
    const lastLog = await WorkoutLog.findOne({ user: req.user.id })
      .sort({ date: -1 })
      .skip(1); // Get the one BEFORE this new one

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLog) {
      const lastDate = new Date(lastLog.date);
      // If last workout was yesterday, streak +1
      if (lastDate.toDateString() === yesterday.toDateString()) {
        user.streak += 1;
      } 
      // If last workout was NOT today and NOT yesterday, reset to 1
      else if (lastDate.toDateString() !== today.toDateString()) {
        user.streak = 1;
      }
    } else {
      user.streak = 1; // First ever workout
    }

    await user.save();
    res.json(newLog);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get User Stats (Streak & Total)
// @route   GET /api/tracking/stats
// @desc    Get User Stats & Chart Data
// @route   GET /api/tracking/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Workouts
    const totalWorkouts = await WorkoutLog.countDocuments({ user: userId });

    // 2. Get logs from last 7 days for the chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await WorkoutLog.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    });

    // 3. Format data for the Chart (Group by Day Name)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = days.map(day => ({ name: day, workouts: 0 }));

    logs.forEach(log => {
      const dayName = days[new Date(log.date).getDay()];
      const dayEntry = chartData.find(d => d.name === dayName);
      if (dayEntry) dayEntry.workouts += 1;
    });

    // 4. Calculate Level (Gamification)
    let level = "Rookie";
    if (totalWorkouts > 5) level = "Bronze";
    if (totalWorkouts > 20) level = "Silver";
    if (totalWorkouts > 50) level = "Gold";
    if (totalWorkouts > 100) level = "Elite";

    res.json({
      totalWorkouts,
      streak: totalWorkouts > 0 ? 1 : 0, // Simplified streak logic
      level,
      chartData
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getLeaderboard = async (req, res) => {
  try {
    // MongoDB Aggregation Pipeline
    // 1. Group logs by User ID and count them
    // 2. Sort by count (descending)
    // 3. Limit to top 10
    // 4. Lookup user details (name) to display
    
    const leaderboard = await WorkoutLog.aggregate([
      {
        $group: {
          _id: "$user",
          totalWorkouts: { $sum: 1 },
          lastWorkout: { $max: "$date" }
        }
      },
      { $sort: { totalWorkouts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users", // The collection name in MongoDB (usually lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails" // Flatten the array
      },
      {
        $project: {
          name: "$userDetails.name",
          totalWorkouts: 1,
          lastWorkout: 1
        }
      }
    ]);

    res.json(leaderboard);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Get All Past Workouts
// @route   GET /api/tracking/history
exports.getHistory = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user.id })
      .sort({ date: -1 }); // Newest first

    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};