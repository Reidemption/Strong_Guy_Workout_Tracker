# Strong Guy 💪

## Resources

**User**

Attributes:

- id (Object Id)
- user_id (Object Id)
- email (string)
- password (string)
- pastworkouts (list of previous workouts)

**Workout**

Attributes:

- id (Object Id)
- user_id (Object Id)
- name (string)
- exercises (list of objects)
- created (date)

**PerformedWorkout**

Attributes:

- id (Object Id)
- workout (list of performed workouts)

## Schemas

```js
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
  workout: [
    {
      exercise: { type: String },
      performed: {
        reps: { type: Number },
        pounds: { type: Number },
      },
    },
  ],
  time: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const userSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
  pastWorkouts: [{ performedWorkoutSchema }],
});
```

## Endpoints

| Name                    | Method | Path                    |
| ----------------------- | ------ | ----------------------- |
| Retrieve All Users      | GET    | /users                  |
| Create New User         | POST   | /users                  |
| Authenticate Sign In    | POST   | /authenticate           |
| Create New Workout      | POST   | /workouts               |
| Get User Workouts    | GET    | /workouts/      |
| Delete Specific Workout | DELETE | /workouts/_\<id\>_      |
| Save Completed Workout  | POST   | /workouts/finishWorkout |

## Hosted URL

https://strong-guy-sec.herokuapp.com/
