const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User'); // Context for Name
const Profile = require('../models/Profile');
const Workout = require('../models/Workout');
const MealPlan = require('../models/MealPlan');
const ExerciseCache = require('../models/ExerciseCache');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to pause execution (Used for Retries)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- ROBUST BACKUP DATA (The Fail-Safe) ---
const FALLBACK_EXERCISES = {
  "squat": {
    name: "Squat",
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    instructions: ["Stand feet shoulder-width.", "Lower hips like sitting in a chair.", "Keep chest up.", "Drive back up."],
    commonMistakes: ["Knees caving in", "Heels lifting", "Not deep enough"],
    difficulty: "Intermediate"
  },
  "squats": { 
    name: "Squat",
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    instructions: ["Stand feet shoulder-width.", "Lower hips like sitting in a chair.", "Keep chest up.", "Drive back up."],
    commonMistakes: ["Knees caving in", "Heels lifting", "Not deep enough"],
    difficulty: "Intermediate"
  },
  "deadlift": {
    name: "Deadlift",
    targetMuscles: ["Hamstrings", "Glutes", "Back"],
    instructions: ["Feet hip-width under bar.", "Hinge at hips to grip bar.", "Drive through heels to stand.", "Lower with control."],
    commonMistakes: ["Rounding back", "Jerking the bar", "Squatting the weight"],
    difficulty: "Advanced"
  },
  "deadlifts": { 
    name: "Deadlift",
    targetMuscles: ["Hamstrings", "Glutes", "Back"],
    instructions: ["Feet hip-width under bar.", "Hinge at hips to grip bar.", "Drive through heels to stand.", "Lower with control."],
    commonMistakes: ["Rounding back", "Jerking the bar", "Squatting the weight"],
    difficulty: "Advanced"
  },
  "bench press": {
    name: "Bench Press",
    targetMuscles: ["Chest", "Triceps", "Front Delts"],
    instructions: ["Lie on bench.", "Grip bar wider than shoulders.", "Lower to mid-chest.", "Press up."],
    commonMistakes: ["Flaring elbows", "Bouncing off chest", "Arching back"],
    difficulty: "Intermediate"
  },
  "pull up": {
    name: "Pull Up",
    targetMuscles: ["Lats", "Biceps", "Upper Back"],
    instructions: ["Grip bar wider than shoulders.", "Pull chest to bar.", "Lower all the way down."],
    commonMistakes: ["Using momentum", "Not going full range", "Shrugging shoulders"],
    difficulty: "Intermediate"
  }
};

// @desc    Generate AI Workout Plan (WITH RETRY)
// @route   POST /api/ai/generate
exports.generateWorkout = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).json({ msg: 'Please complete your profile first' });

    const prompt = `
      Act as an elite personal trainer. Create a 7-day workout plan for:
      - Age: ${profile.age}, Gender: ${profile.gender}
      - Weight: ${profile.weight}kg, Goal: ${profile.goal}
      - Equipment: ${profile.equipment}, Experience: ${profile.activityLevel}
      - Injuries: ${profile.injuries && profile.injuries.length > 0 ? profile.injuries.join(", ") : "None"}

      Requirements:
      - Return ONLY valid JSON. No markdown.
      - Structure: { "schedule": [ { "day": "Monday", "focus": "Push", "exercises": [ { "name": "Bench Press", "sets": "3", "reps": "8-12", "notes": "Focus on form" } ] } ] }
    `;

    // KEPT ORIGINAL MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // --- RETRY LOGIC ---
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break; // Success
      } catch (err) {
        if (err.status === 429 && retries > 1) {
          console.log(`⚠️ Rate limit (Workout). Waiting 15s... (${retries} left)`);
          await sleep(15000); 
          retries--;
        } else {
          throw err; 
        }
      }
    }

    const text = result.response.text().replace(/```json|```/g, '').trim();

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({ msg: 'AI response was not valid JSON', raw: text });
    }

    let workout = await Workout.findOneAndUpdate(
      { user: req.user.id },
      { plan: workoutPlan, generatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json(workout);
  } catch (err) {
    console.error("Workout Gen Error:", err.message);
    res.status(503).json({ msg: "AI is busy. Please try again in 1 minute." });
  }
};

// @desc    Get Saved Workout
// @route   GET /api/ai/plan
exports.getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({ user: req.user.id });
    if (!workout) return res.status(404).json({ msg: 'No workout found' });
    res.json(workout);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Generate AI Meal Plan (WITH RETRY)
// @route   POST /api/ai/generate-meal
exports.generateMealPlan = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).json({ msg: 'Please complete your profile first' });

    const prompt = `
      Act as an elite sports nutritionist. Create a 7-day meal plan for:
      - Weight: ${profile.weight}kg, Goal: ${profile.goal}
      - DIETARY PREFERENCE: ${profile.dietaryPreference} (STRICT REQUIREMENT)
      - Allergies: ${profile.allergies?.length > 0 ? profile.allergies.join(", ") : "None"}

      STRICT REQUIREMENTS:
      - If Dietary Preference is "Vegetarian", the plan MUST NOT contain any meat, chicken, or fish.
      - Return ONLY valid JSON. No markdown.
      - Structure: { 
          "macros": { "calories": 2500, "protein": "180g", "carbs": "250g", "fats": "80g" },
          "schedule": [ { "day": "Monday", "meals": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "..." } } ] 
        }
    `;

    // KEPT ORIGINAL MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // --- RETRY LOGIC ---
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break; 
      } catch (err) {
        if (err.status === 429 && retries > 1) {
          console.log(`⚠️ Rate limit (Meal). Waiting 15s... (${retries} left)`);
          await sleep(15000); 
          retries--;
        } else {
          throw err; 
        }
      }
    }

    const text = result.response.text().replace(/```json|```/g, '').trim();

    let mealPlanData;
    try {
      mealPlanData = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({ msg: 'AI response was not valid JSON', raw: text });
    }

    let mealPlan = await MealPlan.findOneAndUpdate(
      { user: req.user.id },
      { plan: mealPlanData, generatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json(mealPlan);
  } catch (err) {
    console.error("Meal Plan Gen Error:", err.message);
    res.status(503).json({ msg: "AI is busy. Please try again in 1 minute." });
  }
};

// @desc    Get Saved Meal Plan
// @route   GET /api/ai/meal-plan
exports.getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ user: req.user.id });
    if (!mealPlan) return res.status(404).json({ msg: 'No meal plan found' });
    res.json(mealPlan);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get Info about a specific exercise (WITH CACHE + FALLBACK + RETRY)
// @route   POST /api/ai/explain-exercise
exports.explainExercise = async (req, res) => {
  try {
    // 1. SAFE INPUT PROCESSING
    let { exerciseName } = req.body;
    
    if (!exerciseName) {
      return res.status(400).json({ msg: "Please provide an exercise name" });
    }
    
    exerciseName = exerciseName.toLowerCase().trim();

    // 2. CHECK DATABASE FIRST (The Cache)
    const cachedExercise = await ExerciseCache.findOne({ name: exerciseName });
    if (cachedExercise) {
      console.log(`✅ Served "${exerciseName}" from Cache (No AI usage)`);
      return res.json(cachedExercise.data);
    }

    // 3. IF NOT IN DB, ASK AI (With Retry Logic)
    console.log(`🤖 Asking AI about "${exerciseName}"...`);
    
    const prompt = `
      Act as an expert biomechanics coach. Explain the exercise "${exerciseName}" briefly.
      Return ONLY valid JSON in this format:
      {
        "name": "${exerciseName}",
        "targetMuscles": ["Muscle A", "Muscle B"],
        "instructions": ["Step 1...", "Step 2...", "Step 3..."],
        "commonMistakes": ["Mistake 1", "Mistake 2"],
        "difficulty": "Intermediate"
      }
    `;

    // KEPT ORIGINAL MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let retries = 2; // Reduced retries so we can fallback faster
    let result;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break; 
      } catch (err) {
        if (err.status === 429 && retries > 1) {
          console.log(`⚠️ Rate limit (Exercise). Waiting 5s...`);
          await sleep(5000); 
          retries--;
        } else {
          throw err; 
        }
      }
    }

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    const exerciseData = JSON.parse(text);

    // Save to Cache
    await new ExerciseCache({ name: exerciseName, data: exerciseData }).save();
    console.log(`💾 Saved "${exerciseName}" to Cache`);

    res.json(exerciseData);

  } catch (err) {
    console.error("Exercise Gen Error:", err.message);

    // 4. FALLBACK SYSTEM (If API Fails, use Backup)
    const safeName = req.body.exerciseName ? req.body.exerciseName.toLowerCase().trim() : "";

    if (FALLBACK_EXERCISES[safeName]) {
      console.log(`🛡️ Serving Backup Data for "${safeName}"`);
      
      const fallbackData = FALLBACK_EXERCISES[safeName];
      try {
        await new ExerciseCache({ name: safeName, data: fallbackData }).save();
      } catch (e) { /* Ignore duplicate key error */ }
      
      return res.json(fallbackData);
    }

    res.status(503).json({ 
      msg: "System busy. Try searching for 'Squat', 'Deadlifts' or 'Bench Press' (Cached)." 
    });
  }
};

// @desc    Chat with AI Coach (SMART CONTEXT VERSION)
// @route   POST /api/ai/chat
exports.chatWithCoach = async (req, res) => {
  const { message } = req.body;

  try {
    // 1. Fetch User Context (Profile & Current Plan)
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });
    const latestWorkout = await Workout.findOne({ user: req.user.id }).sort({ createdAt: -1 });

    // 2. Build the "System Prompt"
    let contextPrompt = `
      You are an elite personal trainer AI named "TrainerAI".
      
      USER CONTEXT:
      - Name: ${user.name}
      - Age: ${profile?.age || '?'}
      - Goal: ${profile?.goal || 'General Fitness'}
      - Experience: ${profile?.activityLevel || 'Beginner'}
      - Injuries/Limits: ${profile?.injuries && profile.injuries.length > 0 ? profile.injuries.join(", ") : "None"}
    `;

    if (latestWorkout && latestWorkout.plan) {
      // Add a summary of their current split
      contextPrompt += `
      - Current Plan available in system. 
      `;
    }

    contextPrompt += `
      INSTRUCTIONS:
      - Answer the user's question specifically based on their goal of "${profile?.goal}".
      - Keep answers concise (under 80 words), motivating, and actionable.
      - If they ask about their plan, refer to their specific workouts.
      
      USER QUESTION: "${message}"
    `;

    // KEPT ORIGINAL MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // --- RETRY LOGIC ---
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(contextPrompt);
        break; 
      } catch (err) {
        if (err.status === 429 && retries > 1) {
          console.log(`⚠️ Rate limit (Chat). Waiting 10s...`);
          await sleep(10000); 
          retries--;
        } else {
          throw err; 
        }
      }
    }

    const response = await result.response;
    const text = response.text();
    res.json({ reply: text });

  } catch (err) {
    console.error("Chat Error:", err.message);
    res.status(503).json({ 
      reply: "I'm currently overwhelmed with requests! Please give me a minute to cool down. 🧊" 
    });
  }
};