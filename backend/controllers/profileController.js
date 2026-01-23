const Profile = require('../models/Profile');

// @desc    Get Current User Profile
// @route   GET /api/profile/me
exports.getCurrentProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create or Update Profile
// @route   POST /api/profile
exports.createProfile = async (req, res) => {
  // ... (Keep your existing createProfile code here) ...
  // Destructure all fields...
  const { 
    age, gender, height, weight, bodyType, 
    goal, activityLevel, 
    workoutLocation, equipment, timePerSession,
    dietaryPreference, allergies, budget,
    injuries, medicalConditions 
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  
  // ... (Keep the rest of your existing logic) ...
  if (age) profileFields.age = age;
  if (gender) profileFields.gender = gender;
  if (height) profileFields.height = height;
  if (weight) profileFields.weight = weight;
  // ... continue with all fields ...
  if (goal) profileFields.goal = goal;
  if (activityLevel) profileFields.activityLevel = activityLevel;
  if (workoutLocation) profileFields.workoutLocation = workoutLocation;
  if (equipment) profileFields.equipment = equipment;
  if (timePerSession) profileFields.timePerSession = timePerSession;
  if (dietaryPreference) profileFields.dietaryPreference = dietaryPreference;
  if (allergies) profileFields.allergies = allergies;
  if (budget) profileFields.budget = budget;
  if (injuries) profileFields.injuries = injuries;
  if (medicalConditions) profileFields.medicalConditions = medicalConditions;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};