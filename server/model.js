const mongoose = require("mongoose");

const date = new Date(Date.now()).toLocaleString();

const workoutSchema = new mongoose.Schema({
  name: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  exercises: [
    {
      name: { type: String },
      sets: { type: Number },
      reps: { type: Number },
    },
  ],
  created: { type: Date, default: date },
});

const performedWorkoutSchema = mongoose.Schema({
  name: { type: String },
  workout: [
    {
      exercise: { type: String },
      performed: [
        {
          reps: { type: Number },
          pounds: { type: Number },
        },
      ],
    },
  ],
  time: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  pastWorkouts: [performedWorkoutSchema],
});

const performedWorkout = new mongoose.model(
  "performedWorkout",
  performedWorkoutSchema
);

const User = mongoose.model("User", userSchema);

const Workout = mongoose.model("Workout", workoutSchema);
module.exports = {
  User,
  Workout,
  performedWorkout,
};
