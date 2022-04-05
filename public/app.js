const url = "https://strong-guy-sec.herokuapp.com";
// const url = "http://localhost:8080";

var app = new Vue({
  el: "#app",
  data: {
    workouts: [],
    page: "", //login, workouts, workoutCreate, workout, history
    email: "",
    password: "",
    loggedInUser: "",
    users: [],
    error_message: "",
    //^ login info ^
    exercisesArr: [],
    exercise_name: "",
    exercise_set: "",
    exercise_rep: "",
    name: "",
    // ^ create workout info ^
    current_workout: {},
    seconds: 0,
    timer: "",
    i: 1,
    // ^ display info on workout ^
    workout: [],
    performed: [],
    reps: 0,
    pounds: 0,
    j: 0,
    // ^ update finished workout ^
    pastWorkouts: [],
    // ^ show past workouts ^
    user: {},
  },
  methods: {
    reallyStartTimer: function () {
      setInterval(this.startTimer, 1000);
    },
    startTimer: function () {
      ++this.seconds;
      var hour = Math.floor(this.seconds / 3600);
      var minute = Math.floor((this.seconds - hour * 3600) / 60);
      var seconds = this.seconds - (hour * 3600 + minute * 60);
      if (hour < 10) hour = "0" + hour;
      if (minute < 10) minute = "0" + minute;
      if (seconds < 10) seconds = "0" + seconds;
      this.timer = hour + ":" + minute + ":" + seconds;
    },
    pushToLists: function () {
      let exercises = {
        name: this.exercise_name,
        sets: this.exercise_set,
        reps: this.exercise_rep,
      };
      this.exercisesArr.push(exercises);
      this.exercise_name = "";
      this.exercise_set = "";
      this.exercise_rep = "";
      this.i++;
    },
    createUser: function () {
      if (!this.email || !this.password) {
        this.errorMessage("No email or password. Try Again.");
        return;
      }
      var user_body = {
        email: this.email,
        password: this.password,
      };
      fetch(`${url}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user_body),
      }).then(function (response) {
        // console.log(response.status);
        if (response.status == 201) {
          alert("User created!\nNow Signed In :^)");
          app.loginUser();
          app.error_message = "";
        } else {
          app.errorMessage(
            "Unable to create user. Try again with values in both fields"
          );
        }
      });
    },
    errorMessage: function (m = "Missing email or password") {
      app.error_message = m;
      app.email = "";
      app.password = "";
    },
    checkSession: function () {
      fetch(`${url}/session`).then(function (response) {
        if (response.status == 200) {
          app.getWorkouts();
          app.page = "workouts";
          response.json().then(function (data) {
            app.user = data._id;
          });
        } else {
          app.page = "login";
        }
      });
    },
    logoutUser: function () {
      fetch(`${url}/session`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(function (response) {
        if (response.status == 204) {
          app.user = {};
          app.exercisesArr = [];
          app.page = "login";
        } else {
          alert("Unable to logout. Try again.");
        }
      });
    },
    loginUser: function () {
      if (!this.email || !this.password) {
        this.errorMessage();
        return;
      }
      var user_body = {
        email: this.email,
        password: this.password,
      };
      fetch(`${url}/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user_body),
      }).then(function (response) {
        if (response.status == 201) {
          // console.log("success");
          app.email = "";
          app.password = "";
          app.error_message = "";

          app.page = "workouts";
          response.json().then(function (data) {
            //console.log(data);
            // just use getSession when I need to access app.user
            app.user = data;
          });
          app.getWorkouts();
        } else {
          app.errorMessage("Error during sign in. Try Again");
        }
      });
      // app.checkSession();
    },
    createWorkout: function () {
      if (!this.user) {
        this.page = "login";
        return;
      }
      if (!this.name || this.exercisesArr.length == 0) {
        this.error_message = "Missing required fields!!";
        return;
      }
      var workout_body = {
        name: this.name,
        exercises: this.exercisesArr,
        created: Date.now(),
      };
      fetch(`${url}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workout_body),
      }).then(function (response) {
        // console.log(workout_body);
        if (response.status == 400) {
          app.errorMessage();
          return;
        } else if (response.status == 201) {
          app.getWorkouts();
          app.exercisesArr = [];
          app.page = "workouts";
          app.error_message = "";
        }
      });
    },
    getWorkouts: function () {
      if (this.user) {
        fetch(`${url}/workouts`).then(function (response) {
          response.json().then(function (data) {
            app.workouts = data;
            app.name = "";
            app.i = 1;
          });
        });
      }
    },
    loadWorkout: function (workout) {
      this.page = "workout";
      fetch(`${url}/workouts/${workout._id}`).then(function (response) {
        response.json().then(function (data) {
          app.current_workout = data;
        });
      });
    },
    deleteWorkout: function (id) {
      console.log("deleting workout", id);
      fetch(`${url}/workouts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(function (response) {
        if (response.status == 200) {
          app.getWorkouts();
        } else {
          app.errorMessage("Error deleting workout");
        }
      });
    },
    finishWorkout: function () {
      const finishedWorkout = {
        workout: this.workout,
        time: this.timer,
        name: this.current_workout.name,
      };
      console.log(finishedWorkout);
      fetch(`${url}/finishWorkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finishedWorkout),
      }).then(function (response) {
        if (response.status == 200) {
          console.log("success");
          app.workout = [];
          app.timer = "";
          app.loadWorkoutHistory();
          app.page = "history";
          app.j = 0;
          response.json().then(function (data) {
            console.log(data);
          });
        } else {
          app.page = "workouts";
          app.errorMessage("Unable to save workout.");
        }
      });
    },
    addItem: function () {
      let newO = {
        pounds: this.pounds,
        reps: this.reps,
      };
      this.performed.push(newO);
      this.pounds = 0;
    },
    performedIntoWorkout: function () {
      const temp = {
        exercise: this.current_workout.exercises[this.j].name,
        performed: this.performed,
      };
      this.workout.push(temp);
      this.performed = [];
      this.j++;
      alert("Progress Saved!", "Keep up the good work!");
    },
    loadWorkoutHistory: function () {
      fetch(`${url}/users`).then(function (response) {
        response.json().then(function (data) {
          app.pastWorkouts = data.pastWorkouts;
        });
      });
    },
  },
  created: function () {
    this.checkSession();
  },
});
