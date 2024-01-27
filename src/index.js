const express = require("express");
const path = require("path");
const session = require("express-session");
const { LogInCollection, CommunityQuestion } = require("./mongo");
const port = process.env.PORT || 3000;
const app = express();

app.use(
  session({
    secret: "1",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const tempelatePath = path.join(__dirname, "../tempelates");
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.static(publicPath));

app.get("/signup", (req, res) => {
  res.render("signup");
});

app
  .route("/")
  .all(async (req, res, next) => {
    try {
      if (req.session.loggedIn) {
        const userQuestions = await LogInCollection.findOne({
          name: req.session.username,
        })
          .populate("questions")
          .exec();

        const communityQuestions = await CommunityQuestion.find().populate(
          "user",
          "name"
        );

        const allQuestions = userQuestions.questions.concat(communityQuestions);

        res.render("home", {
          naming: req.session.username,
          questions: allQuestions,
        });
      } else {
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  })
  .get((req, res) => {
    res.render("main");
  })
  .post((req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error during logout");
      } else {
        res.redirect("/");
      }
    });
  });

app.get("/", async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const userQuestions = await LogInCollection.findOne({
        name: req.session.username,
      })
        .populate("questions")
        .exec();

      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      const allQuestions = userQuestions.questions.concat(communityQuestions);

      res.render("home", {
        naming: req.session.username,
        questions: allQuestions,
      });
    } else {
      res.render("login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const userQuestions = await LogInCollection.findOne({
        name: req.session.username,
      })
        .populate("questions")
        .exec();

      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      const allQuestions = userQuestions.questions.concat(communityQuestions);

      res.render("home", {
        naming: req.session.username,
        questions: allQuestions,
      });
    } else {
      res.render("login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/signup", async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const userQuestions = await LogInCollection.findOne({
        name: req.session.username,
      })
        .populate("questions")
        .exec();

      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      const allQuestions = userQuestions.questions.concat(communityQuestions);

      res.render("home", {
        naming: req.session.username,
        questions: allQuestions,
      });
    } else {
      res.render("signup");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/login", async (req, res) => {
  try {
    const user = await LogInCollection.findOne({ name: req.body.name });

    if (user && user.password === req.body.password) {
      const userQuestions = await LogInCollection.findOne({
        name: req.body.name,
      })
        .populate("questions")
        .exec();

      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      req.session.loggedIn = true;
      req.session.username = req.body.name;
      req.session.questions =
        userQuestions.questions.concat(communityQuestions);

      res.status(201).render("home", {
        naming: `${req.body.name}`,
        questions: req.session.questions,
      });
    } else {
      res.send("Incorrect credentials");
    }
  } catch (e) {
    console.error(e);
    res.send("Wrong details");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error during logout");
    } else {
      res.redirect("/");
    }
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error during logout");
    } else {
      res.redirect("/");
    }
  });
});

app.post("/add-question", async (req, res) => {
  try {
    const user = await LogInCollection.findOne({ name: req.body.name });

    if (user) {
      const communityQuestion = await CommunityQuestion.create({
        user: user._id,
        userName: user.name,
        category: user.category,
        question: req.body.question,
      });

      await LogInCollection.findOneAndUpdate(
        { name: req.body.name },
        { $push: { questions: communityQuestion._id } }
      );

      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      req.session.questions = req.session.questions.concat(communityQuestions);

      res.status(201).render("home", {
        naming: req.body.name,
        questions: req.session.questions,
      });
    } else {
      res.send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/signup", async (req, res) => {
  try {
    const { name, password, category } = req.body;

    if (!name || !password || !category) {
      return res.status(400).send("Name, password, and category are required");
    }

    const existingUser = await LogInCollection.findOne({ name });

    if (existingUser) {
      return res.status(409).send("User with that name already exists");
    }

    const newUser = new LogInCollection({
      name,
      password,
      category,
    });

    await newUser.save();

    req.session.loggedIn = true;
    req.session.username = name;
    req.session.questions = [];

    res.redirect("/"); //redirection code
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.listen(port, () => {
  console.log("Port connected");
});
//reply section (not completed)
// app.post("/add-reply", async (req, res) => {
//   try {
//     console.log("Reply form submitted by user: " + req.body.name); // Add this line for logging

//     const user = await LogInCollection.findOne({ name: req.body.name });
//     console.log("User found: " + user);
//     if (user) {
//       const reply = await Reply.create({
//         user: user._id,
//         question: req.body.questionId,
//         reply: req.body.reply,
//       });

//       const question = await CommunityQuestion.findById(req.body.questionId);
//       question.replies.push(reply);
//       await question.save();

//       const userQuestions = await LogInCollection.findOne({
//         name: req.session.username,
//       })
//         .populate("questions")
//         .exec();

//       const communityQuestions = await CommunityQuestion.find().populate(
//         "user",
//         "name"
//       );

//       const allQuestions = userQuestions.questions.concat(communityQuestions);

//       res.status(201).render("home", {
//         naming: req.body.name,
//         questions: allQuestions,
//       });
//     } else {
//       res.send("User not found");
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });
