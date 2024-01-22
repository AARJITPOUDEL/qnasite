const express = require("express");
const path = require("path");
const { LogInCollection, CommunityQuestion } = require("./mongo");
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const tempelatePath = path.join(__dirname, "../tempelates");
const publicPath = path.join(__dirname, "../public");
console.log(publicPath);

app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.static(publicPath));

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/", (req, res) => {
  res.render("login");
});
app.post("/signup", async (req, res) => {
  try {
    const checking = await LogInCollection.findOne({ name: req.body.name });

    if (checking) {
      res.send("User details already exist");
    } else {
      const user = {
        name: req.body.name,
        password: req.body.password,
        category: req.body.category,
        questions: [], // Initialize with an empty array
      };

      // Fetch community questions
      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      // Add community questions to the user's questions array
      user.questions = communityQuestions.map((question) => question._id);

      // Create the user
      await LogInCollection.create(user);

      res.status(201).render("home", {
        naming: req.body.name,
        questions: communityQuestions,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await LogInCollection.findOne({ name: req.body.name });

    if (user) {
      // Fetch user's questions
      const userQuestions = await LogInCollection.findOne({
        name: req.body.name,
      })
        .populate("questions")
        .exec();

      // Fetch community questions
      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      res.status(201).render("home", {
        naming: `${req.body.name}`,
        questions: userQuestions.questions.concat(communityQuestions),
      });
    } else {
      res.send("User not found");
    }
  } catch (e) {
    console.error(e);
    res.send("Wrong details");
  }
});

app.post("/add-question", async (req, res) => {
  try {
    const user = await LogInCollection.findOne({ name: req.body.name });

    if (user) {
      // Create a new community question
      const communityQuestion = await CommunityQuestion.create({
        user: user._id,
        userName: user.name, // Store the user's name
        category: user.category, // Store the user's category
        question: req.body.question,
      });

      // Update the user's questions array with the new community question
      await LogInCollection.findOneAndUpdate(
        { name: req.body.name },
        { $push: { questions: communityQuestion._id } }
      );

      // Fetch community questions to display on the home page
      const communityQuestions = await CommunityQuestion.find().populate(
        "user",
        "name"
      );

      res.status(201).render("home", {
        naming: req.body.name,
        questions: communityQuestions,
      });
    } else {
      res.send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log("Port connected");
});
