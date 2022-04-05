const express = require("express");
const { model } = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local");
const cors = require("cors");
const { User, Workout } = require("./model");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: "q524slbjkgw3jkgioskjsdjk",
    resave: false,
    saveUninitialized: true,
  })
);
passport.use(
  new passportLocal.Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          done(null, false);
          return;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          done(null, false);
        } else {
          done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user._id);
});
passport.deserializeUser(function (userId, done) {
  User.findOne({ _id: userId })
    .then(function (user) {
      done(null, user);
    })
    .catch(function (err) {
      done(err);
    });
});
// app.get("/users", async (req, res) => {
//   console.log("Get all users; for dev purposes only.");
//   User.find({}, function (err, users) {
//     if (err) {
//       console.log("Found an error when fetching all users.");
//       res.status(400);
//       return;
//     }
//     res.json(users);
//   });
// });

app.post("/users", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  console.log(hashedPassword);
  if (!req.body.email || !req.body.password) {
    res.status(422).send("Fields missing");
    return;
  }
  User.create(
    {
      email: req.body.email,
      password: hashedPassword,
    },
    (err, user) => {
      if (err) {
        console.err(err);
        res.status(400);
        return;
      }
      console.log("User was created");
      res.status(201).json(user);
    }
  );
});

app.get("/users", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log(`Getting specific thread with id:${req.user._id}`);
  User.findById(req.user._id, (err, user) => {
    if (err != null) {
      res.status(500).json({
        err: err,
        message: "Unable to find thread with that id",
      });
      return;
    } else if (user === null) {
      res.status(404).json({ message: `unable to find threads`, error: err });
      return;
    }
    res.status(200).json(user);
  });
});
app.post("/session", passport.authenticate("local"), async (req, res) => {
  res.status(201).json(req.user);
  // console.log(req.user);
});

app.get("/session", function (req, res) {
  // req.user ? res.status(200).json(req.user) : res.sendStatus(401);
  if (req.user) {
    console.log("Get session returned 200");
    res.status(200).json(req.user);
  } else {
    console.log("Get session returned 401");
    res.sendStatus(401);
  }
});

// get workouts
app.get("/workouts", async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  res.setHeader("Content-Type", "application/json");
  console.log("returning all workouts");
  Workout.find({user_id: req.user._id}, (err, workouts) => {
    if (err != null) {
      res.status(400).json({
        error: err,
        message: "unable to get all workouts",
      });
      return;
    }
    res.status(200).json(workouts);
  });
});
// create a workout
app.post("/workouts", async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  res.setHeader("Content-Type", "application/json");
  console.log(`Creating a workout with ${req.body}`);
  if (!req.body.name) {
    console.log("Fields are missing, unable to create workout");
    res.status(422).json({
      message: "Unable to create workout",
      error: "Field(s) are missing",
    });
    return;
  }
  Workout.create(
    {
      name: req.body.name,
      exercises: req.body.exercises,
      user_id: req.user._id,
    },
    (err, workout) => {
      if (err) {
        console.log(`unable to create workout.`);
        res.status(400).json({
          message: "Unable to create workout",
          error: err,
        });
        return;
      }
      res.status(201).json(workout);
    }
  );
});

app.delete("/session", function (req, res) {
  req.logout();
  res.sendStatus(204);
});

// TODO: Performing a workout will add it into the user.
app.post("/finishWorkout", function async(req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  res.setHeader("Content-Type", "application/json");
  console.log("Saving a finished workout", req.body);
  User.findByIdAndUpdate(
    req.user._id,
    { $push: { pastWorkouts: req.body } },
    { new: true },
    (err, user) => {
      if (err != null) {
        res.status(500).json({
          error: err,
          message: "Unable to find thread with that id",
        });
        return;
      } else if (user === null) {
        res
          .status(404)
          .json({ message: `unable to find thread to delete`, error: err });
        return;
      }
      res.status(200).json(user.pastWorkouts[user.pastWorkouts.length - 1]);
      // res.status(200).json(finishedWorkout);
    }
  );
});

app.get("/workouts/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log("Fetching one workout", req.params.id);
  Workout.findById(req.params.id, (err, workout) => {
    if (err) {
      console.log(`cannot find workout with ${req.params.id}`);
      res.status(500).json({
        message: "Unable to find workout with given id",
        error: err,
      });
      return;
    } else if (workout === null) {
      res.status(404).json({
        message: `Unable to find workout with id: ${req.params.id}`,
        error: err,
      });
      return;
    }
    res.status(200).json(workout);
  });
});

app.patch("/workouts/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log("Updating the body", req.body);
  let updateBody = {};
  if (req.body.exercises) {
    updateBody.exercises = req.body.exercises;
  }
  if (req.body.name) {
    updateBody.name = req.body.name;
  }
  updateBody.created = Date.now();
  Workout.updateOne(
    {
      _id: req.params.id,
    },
    { $set: updateBody },
    function (err, res) {
      if (err) {
        console.log(`Error detected during PATCH ${err}`);
        res.status(400).json({
          message: "Error found",
          error: err,
        });
        return;
      } else if (res.n) {
        res.status(200).json(updateBody);
        return;
      }
    }
  );
});

app.delete("/workouts/:id", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  console.log(`Deleting workout with id: ${req.params.id}`);
  Workout.findByIdAndDelete(req.params.id, (err, workout) => {
    if (err || workout === null) {
      console.log(`Error while deleting ${req.params.id}`);
      res.status(404).json({
        message: "Unable to delete workout.",
        error: err,
      });
      return;
    }
    res.status(200).json(workout);
  });
});

// load up a workout
module.exports = app;
