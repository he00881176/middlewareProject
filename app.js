const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const User = require("./model/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.set("view engine", "ejs");
// middlewares
app.use(express.static("public"));
app.use(cookieParser("thisIsMySecret."));
app.use(
  session({
    secret: "You won't know what is the secret, only if you ask monkey.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.urlencoded({ extends: true }));

const requireLogin = (req, res, next) => {
  if (!req.session.isVerified == true) {
    res.redirect("/login");
  } else {
    next();
  }
};

mongoose
  .connect("mongodb://localhost:27017/user", {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to mongodb.");
  })
  .catch((e) => {
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("This is homepage.");
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res, next) => {
  let { username, password } = req.body;
  try {
    let foundUser = await User.findOne({ username });
    if (foundUser) {
      res.send("Username is already exist");
    } else {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          next(err);
        }
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            next(err);
          }
          let newUser = new User({ username, password: hash });
          try {
            newUser
              .save()
              .then(() => {
                res.send("Data has been saved.");
              })
              .catch((e) => {
                res.send("Data saved failed.");
              });
          } catch (err) {
            next(err);
          }
        });
      });
    }
  } catch (e) {
    next(e);
  }
});

app.get("/secret", requireLogin, (req, res) => {
  res.render("secret.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res, next) => {
  let { username, password } = req.body;
  try {
    let foundUser = await User.findOne({ username });
    if (foundUser) {
      bcrypt.compare(password, foundUser.password, (err, result) => {
        if (err) {
          next(err);
        }

        if (result == true) {
          req.session.isVerified = true;
          res.redirect("/secret");
        } else {
          res.send("Username or password is not correct.");
        }
      });
    } else {
      res.send("Username or password is not correct.");
    }
  } catch (e) {
    next(e);
  }
});

app.get("/*", (req, res) => {
  res.status(404).send("404 Page not found");
});
//Error handler
app.use((err, req, res, next) => {
  console.log(err);
  res
    .status(500)
    .send("Something is broken. We already send a bunch of monkeys to fix it.");
});

app.listen(3000, () => {
  console.log("Server running on port 3000.");
});
