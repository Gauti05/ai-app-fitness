const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User'); 
const Profile = require('../models/Profile');
const Workout = require('../models/Workout');
const MealPlan = require('../models/MealPlan');
const ExerciseCache = require('../models/ExerciseCache');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- HELPER 1: PAUSE FOR RETRIES ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- HELPER 2: CLEAN JSON (THE FIX) ---
// This extracts ONLY the JSON part { ... } and ignores extra text.
const cleanJSON = (text) => {
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) {
    return text.substring(firstOpen, lastClose + 1);
  }
  return text; // Return original if no brackets found (will likely fail parse, but safer)
};

// --- ROBUST BACKUP DATA (The Fail-Safe) ---
const FALLBACK_EXERCISES = {
  "squat": {
    name: "Squat",
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    instructions: ["Stand feet shoulder-width.", "Lower hips like sitting in a chair.", "Keep chest up.", "Drive back up."],
    commonMistakes: ["Knees caving in", "Heels lifting", "Not deep enough"],
    difficulty: "Intermediate"
  },
  "bench press": {
    name: "Bench Press",
    targetMuscles: ["Chest", "Triceps", "Front Delts"],
    instructions: ["Lie on bench.", "Grip bar wider than shoulders.", "Lower to mid-chest.", "Press up."],
    commonMistakes: ["Flaring elbows", "Bouncing off chest", "Arching back"],
    difficulty: "Intermediate"
  }
};

// @desc    Generate AI Workout Plan
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

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Retry Logic
    let retries = 3;
    let result;
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break; 
      } catch (err) {
        if (err.status === 429 && retries > 1) {
          await sleep(5000); 
          retries--;
        } else {
          throw err; 
        }
      }
    }

    // CLEAN THE RESPONSE
    const rawText = result.response.text();
    const jsonText = cleanJSON(rawText); 

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw Text was:", rawText);
      return res.status(500).json({ msg: 'AI response was not valid JSON', raw: rawText });
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

// @desc    Generate AI Meal Plan (Smart Health Aware)
// @route   POST /api/ai/generate-meal
exports.generateMealPlan = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).json({ msg: 'Please complete your profile first' });

    // 1. Get Health Conditions
    const healthConditions = req.body.healthConditions || [];

    const prompt = `
      Act as an expert clinical nutritionist. Create a 7-day meal plan for:
      - Weight: ${profile.weight}kg, Goal: ${profile.goal}
      - DIETARY PREFERENCE: ${profile.dietaryPreference}
      - HEALTH CONDITIONS: ${healthConditions.length > 0 ? healthConditions.join(", ") : "None"}
      - Allergies: ${profile.allergies?.length > 0 ? profile.allergies.join(", ") : "None"}

      CRITICAL MEDICAL GUIDELINES (MUST FOLLOW):
      1. IF "Diabetes": Focus on Low Glycemic Index (GI) foods. Zero refined sugars. High fiber. Balance carbs with protein/fat.
      2. IF "PCOD" or "PCOS": Anti-inflammatory focus. Limit dairy and gluten if possible. Focus on whole foods.
      3. IF "Hypertension" (High BP): DASH diet principles. Low sodium.
      4. IF "Thyroid" (Hypo): High selenium/zinc (brazil nuts, eggs). Avoid raw goitrogenic veggies (kale/broccoli) unless cooked.

      OUTPUT FORMAT:
      - Return ONLY valid JSON. No markdown.
      - Structure: { 
          "macros": { "calories": 2000, "protein": "150g", "carbs": "180g", "fats": "70g" },
          "schedule": [ { "day": "Monday", "meals": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "..." } } ] 
        }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Retry Logic
    let retries = 3;
    let result;
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break; 
      } catch (err) {
        if (err.status === 429 && retries > 1) {
          await sleep(5000); 
          retries--;
        } else {
          throw err; 
        }
      }
    }

    // CLEAN THE RESPONSE
    const rawText = result.response.text();
    const jsonText = cleanJSON(rawText); 

    let mealPlanData;
    try {
      mealPlanData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw Text was:", rawText);
      return res.status(500).json({ msg: 'AI response was not valid JSON', raw: rawText });
    }

    // Save to DB
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

// @desc    Get Info about a specific exercise
// @route   POST /api/ai/explain-exercise
exports.explainExercise = async (req, res) => {
  try {
    let { exerciseName } = req.body;
    if (!exerciseName) return res.status(400).json({ msg: "Please provide an exercise name" });
    exerciseName = exerciseName.toLowerCase().trim();

    // CHECK CACHE
    const cachedExercise = await ExerciseCache.findOne({ name: exerciseName });
    if (cachedExercise) return res.json(cachedExercise.data);

    // ASK AI
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

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    
    // CLEAN RESPONSE
    const rawText = result.response.text();
    const jsonText = cleanJSON(rawText);
    const exerciseData = JSON.parse(jsonText);

    // Save Cache
    await new ExerciseCache({ name: exerciseName, data: exerciseData }).save();
    res.json(exerciseData);

  } catch (err) {
    console.error("Exercise Gen Error:", err.message);
    
    // Fallback
    const safeName = req.body.exerciseName ? req.body.exerciseName.toLowerCase().trim() : "";
    if (FALLBACK_EXERCISES[safeName]) {
      return res.json(FALLBACK_EXERCISES[safeName]);
    }
    res.status(503).json({ msg: "System busy. Try common exercises." });
  }
};

// @desc    Chat with AI Coach (Smart Context)
// @route   POST /api/ai/chat
exports.chatWithCoach = async (req, res) => {
  const { message } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id });
    const latestWorkout = await Workout.findOne({ user: req.user.id }).sort({ createdAt: -1 });

    let contextPrompt = `
      You are an elite personal trainer AI named "TrainerAI".
      USER CONTEXT:
      - Name: ${user.name}
      - Goal: ${profile?.goal || 'General Fitness'}
      - Injuries: ${profile?.injuries && profile.injuries.length > 0 ? profile.injuries.join(", ") : "None"}
    `;

    if (latestWorkout && latestWorkout.plan) {
      contextPrompt += `- Current Plan available. `;
    }

    contextPrompt += `
      USER QUESTION: "${message}"
      Keep answer concise (under 80 words).
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(contextPrompt);
    const text = result.response.text();
    
    res.json({ reply: text });

  } catch (err) {
    console.error("Chat Error:", err.message);
    res.status(503).json({ reply: "I need a moment to think. Try again!" });
  }
};